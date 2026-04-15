import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import ArticleModal from '../components/ArticleModal'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { HiCheckCircle, HiXCircle, HiEye, HiTrash, HiRefresh, HiBadgeCheck } from 'react-icons/hi'

const TABS = [
  { key: 'pending', label: 'Pending', color: 'text-amber-600' },
  { key: 'approved', label: 'Approved', color: 'text-green-600' },
  { key: 'rejected', label: 'Rejected', color: 'text-red-500' },
  { key: 'all', label: 'All', color: 'text-slate-600' },
]

export default function AdminPage({ user, profile }) {
  const router = useRouter()
  const [tab, setTab] = useState('pending')
  const [pubs, setPubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({})
  const [viewing, setViewing] = useState(null)
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'

  useEffect(() => {
    if (profile && !isAdmin) { toast.error('Access denied.'); router.push('/') }
  }, [profile])

  useEffect(() => { if (isAdmin) loadData() }, [tab, isAdmin])

  async function loadData() {
    setLoading(true)
    let q = supabase
      .from('publications')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
    if (tab !== 'all') q = q.eq('status', tab)
    const { data } = await q
    setPubs(data || [])
    setLoading(false)
    loadCounts()
  }

  async function loadCounts() {
    const { data } = await supabase.from('publications').select('status')
    const c = { pending: 0, approved: 0, rejected: 0, all: 0 }
    data?.forEach(p => { c[p.status] = (c[p.status] || 0) + 1; c.all++ })
    setCounts(c)
  }

  async function review(id, status) {
    const { error } = await supabase.from('publications').update({
      status,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success(`Publication ${status}!`)
    loadData()
  }

  async function deletePub(id) {
    if (!confirm('Are you sure you want to permanently delete this publication?')) return
    const { error } = await supabase.from('publications').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Deleted.')
    loadData()
  }

  async function makeAdmin(authorId) {
    if (!authorId) { toast.error('No registered user for this submission.'); return }
    const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', authorId)
    if (error) { toast.error(error.message); return }
    toast.success('User promoted to admin!')
  }

  if (!user) return (
    <>
      <Navbar user={user} profile={profile} />
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="font-display text-2xl font-bold mb-2">Admin Access Only</h2>
          <p className="font-ui text-slate-500">You must be signed in as an administrator.</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Head><title>Admin Panel — Three Angels Publications</title></Head>
      <Navbar user={user} profile={profile} />

      <div className="hero-pattern py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-white mb-1">🛡 Admin Panel</h1>
          <p className="font-ui text-blue-200 text-sm">Review, approve, and manage all church publications</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-brand-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-6">
          {TABS.map(t => (
            <div key={t.key} className="text-center">
              <div className={`font-display text-2xl font-bold ${t.key === 'pending' ? 'text-gold-400' : t.key === 'approved' ? 'text-green-400' : t.key === 'rejected' ? 'text-red-400' : 'text-white'}`}>
                {counts[t.key] ?? '—'}
              </div>
              <div className="font-ui text-xs text-blue-300 uppercase tracking-wide">{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-xl font-ui text-sm font-semibold transition-all ${
                tab === t.key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'
              }`}>
              {t.label}
              {counts[t.key] > 0 && tab !== t.key && (
                <span className={`ml-2 text-xs font-bold ${t.color}`}>{counts[t.key]}</span>
              )}
            </button>
          ))}
          <button onClick={loadData} className="ml-auto p-2 text-slate-400 hover:text-brand-600 transition-colors">
            <HiRefresh size={18} />
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : pubs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="font-display text-xl font-bold text-slate-600">No {tab} publications</h3>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 font-ui text-xs font-bold text-slate-400 uppercase tracking-wide">Title</th>
                    <th className="text-left px-5 py-3 font-ui text-xs font-bold text-slate-400 uppercase tracking-wide">Author</th>
                    <th className="text-left px-5 py-3 font-ui text-xs font-bold text-slate-400 uppercase tracking-wide">Category</th>
                    <th className="text-left px-5 py-3 font-ui text-xs font-bold text-slate-400 uppercase tracking-wide">Date</th>
                    <th className="text-left px-5 py-3 font-ui text-xs font-bold text-slate-400 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 font-ui text-xs font-bold text-slate-400 uppercase tracking-wide">Media</th>
                    <th className="text-right px-5 py-3 font-ui text-xs font-bold text-slate-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pubs.map(pub => {
                    const authorName = pub.profiles?.full_name || pub.author_name || 'Anonymous'
                    const date = new Date(pub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
                    return (
                      <tr key={pub.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-ui font-semibold text-sm text-slate-800 max-w-[200px] truncate">{pub.title}</div>
                          {pub.summary && <div className="font-ui text-xs text-slate-400 truncate max-w-[200px]">{pub.summary}</div>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-ui text-sm text-slate-700">{authorName}</div>
                          {pub.author_email && <div className="font-ui text-xs text-slate-400">{pub.author_email}</div>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-ui text-xs font-semibold capitalize bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">
                            {pub.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-ui text-sm text-slate-500">{date}</td>
                        <td className="px-5 py-4">
                          <span className={`font-ui text-xs font-bold px-2.5 py-1 rounded-full badge-${pub.status}`}>
                            {pub.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1">
                            {pub.pdf_url && <span title="Has PDF" className="text-lg">📄</span>}
                            {pub.youtube_url && <span title="Has Video" className="text-lg">▶️</span>}
                            {pub.cover_image_url && <span title="Has Cover" className="text-lg">🖼️</span>}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setViewing(pub)} title="Preview"
                              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                              <HiEye size={16} />
                            </button>
                            {pub.status !== 'approved' && (
                              <button onClick={() => review(pub.id, 'approved')} title="Approve"
                                className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                <HiCheckCircle size={16} />
                              </button>
                            )}
                            {pub.status !== 'rejected' && (
                              <button onClick={() => review(pub.id, 'rejected')} title="Reject"
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <HiXCircle size={16} />
                              </button>
                            )}
                            {pub.author_id && (
                              <button onClick={() => makeAdmin(pub.author_id)} title="Make Admin"
                                className="p-1.5 text-slate-400 hover:text-gold-600 hover:bg-amber-50 rounded-lg transition-colors">
                                <HiBadgeCheck size={16} />
                              </button>
                            )}
                            <button onClick={() => deletePub(pub.id)} title="Delete"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <HiTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admin guide */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <h3 className="font-ui font-bold text-sm text-brand-800 mb-3">Admin Quick Guide</h3>
          <div className="grid sm:grid-cols-4 gap-4 font-ui text-xs text-slate-600">
            <div className="flex items-start gap-2"><HiEye className="text-brand-500 mt-0.5 shrink-0" size={14}/><span><strong>Preview</strong> — read the full article before deciding</span></div>
            <div className="flex items-start gap-2"><HiCheckCircle className="text-green-500 mt-0.5 shrink-0" size={14}/><span><strong>Approve</strong> — makes the article publicly visible</span></div>
            <div className="flex items-start gap-2"><HiXCircle className="text-red-500 mt-0.5 shrink-0" size={14}/><span><strong>Reject</strong> — hides and flags the article</span></div>
            <div className="flex items-start gap-2"><HiBadgeCheck className="text-gold-500 mt-0.5 shrink-0" size={14}/><span><strong>Make Admin</strong> — grants the author admin rights</span></div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="font-ui text-xs text-slate-500">To make yourself admin, run this SQL in Supabase:</p>
            <code className="block mt-1.5 bg-white border border-blue-200 rounded-lg p-3 text-xs text-brand-800 font-mono">
              UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
            </code>
          </div>
        </div>
      </div>

      {viewing && <ArticleModal pub={viewing} onClose={() => setViewing(null)} />}
    </>
  )
}
