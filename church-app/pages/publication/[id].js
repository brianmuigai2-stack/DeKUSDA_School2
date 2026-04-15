import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { supabase, getYouTubeId } from '../../lib/supabase'
import { HiDownload, HiExternalLink, HiCalendar, HiArrowLeft, HiShare } from 'react-icons/hi'
import toast from 'react-hot-toast'

const CATEGORY_COLORS = {
  sermon:     'bg-blue-100 text-blue-700',
  devotional: 'bg-purple-100 text-purple-700',
  testimony:  'bg-green-100 text-green-700',
  study:      'bg-amber-100 text-amber-700',
  news:       'bg-rose-100 text-rose-700',
  general:    'bg-slate-100 text-slate-700',
}

export default function PublicationPage({ user, profile }) {
  const router = useRouter()
  const { id } = router.query
  const [pub, setPub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [related, setRelated] = useState([])

  useEffect(() => {
    if (id) fetchPublication()
  }, [id])

  async function fetchPublication() {
    setLoading(true)
    const { data, error } = await supabase
      .from('publications')
      .select('*, profiles(full_name, email), publication_images(*)')
      .eq('id', id)
      .eq('status', 'approved')
      .single()

    if (error || !data) { router.push('/'); return }
    setPub(data)
    setLoading(false)

    // Increment views
    supabase.from('publications').update({ views: (data.views || 0) + 1 }).eq('id', id).then(() => {})

    // Load related
    const { data: rel } = await supabase
      .from('publications')
      .select('id, title, category, cover_image_url, author_name, profiles(full_name), created_at')
      .eq('status', 'approved')
      .eq('category', data.category)
      .neq('id', id)
      .limit(3)
    setRelated(rel || [])
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: pub.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) return (
    <>
      <Navbar user={user} profile={profile} />
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-6" />
        <div className="h-64 bg-slate-200 rounded-2xl mb-8" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-slate-100 rounded" style={{ width: `${85 - i * 5}%` }} />)}
        </div>
      </div>
    </>
  )

  if (!pub) return null

  const authorName = pub.profiles?.full_name || pub.author_name || 'Anonymous'
  const initials = authorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  const dateStr = new Date(pub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const ytId = pub.youtube_url ? getYouTubeId(pub.youtube_url) : null
  const catColor = CATEGORY_COLORS[pub.category] || CATEGORY_COLORS.general

  return (
    <>
      <Head>
        <title>{pub.title} — Three Angels Publications</title>
        <meta name="description" content={pub.summary || pub.title} />
        {pub.cover_image_url && <meta property="og:image" content={pub.cover_image_url} />}
      </Head>

      <Navbar user={user} profile={profile} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 font-ui text-sm text-slate-500 hover:text-brand-600 mb-8 transition-colors">
          <HiArrowLeft size={16} /> Back to Publications
        </Link>

        {/* Article */}
        <article className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Cover image */}
          {pub.cover_image_url && (
            <div className="relative h-72 sm:h-96 w-full">
              <Image src={pub.cover_image_url} alt={pub.title} fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          )}

          {/* Article header */}
          <div className="p-6 sm:p-10 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`text-xs font-ui font-bold px-3 py-1 rounded-full capitalize ${catColor}`}>
                {pub.category === 'study' ? 'Bible Study' : pub.category}
              </span>
              {pub.featured && (
                <span className="text-xs font-ui font-bold px-3 py-1 rounded-full bg-gold-400 text-white">★ Featured</span>
              )}
              {pub.pdf_url && (
                <span className="text-xs font-ui font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">📄 PDF Attached</span>
              )}
              {ytId && (
                <span className="text-xs font-ui font-bold px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">▶ Video Included</span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-6">
              {pub.title}
            </h1>

            {/* Author + date + actions row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {initials}
                </div>
                <div>
                  <div className="font-ui font-semibold text-slate-800">{authorName}</div>
                  <div className="font-ui text-xs text-slate-400 flex items-center gap-1">
                    <HiCalendar size={11} /> {dateStr}
                    {pub.views > 0 && <span className="ml-2">· {pub.views} views</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button onClick={handleShare}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-ui text-sm font-semibold transition-all">
                  <HiShare size={15} /> Share
                </button>
                {pub.pdf_url && (
                  <a href={pub.pdf_url} target="_blank" rel="noopener"
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-ui text-sm font-semibold transition-all">
                    <HiExternalLink size={15} /> View PDF
                  </a>
                )}
                {pub.allow_download && pub.pdf_url && (
                  <a href={pub.pdf_url} download target="_blank" rel="noopener"
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-ui text-sm font-semibold transition-all shadow-sm">
                    <HiDownload size={15} /> Download PDF
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Article body */}
          <div className="p-6 sm:p-10">

            {/* Summary / lead */}
            {pub.summary && (
              <p className="font-body text-xl text-slate-600 italic leading-relaxed mb-8 pb-8 border-b border-slate-100">
                {pub.summary}
              </p>
            )}

            {/* Inline images grid */}
            {pub.publication_images?.length > 0 && (
              <div className={`grid gap-4 mb-8 ${pub.publication_images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {pub.publication_images.map(img => (
                  <figure key={img.id} className="rounded-xl overflow-hidden">
                    <div className="relative aspect-video bg-slate-100">
                      <Image src={img.url} alt={img.caption || ''} fill className="object-cover" />
                    </div>
                    {img.caption && (
                      <figcaption className="text-xs font-ui text-slate-500 text-center py-2 bg-slate-50 px-3">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}

            {/* Main content */}
            {pub.content && (
              <div className="prose-article mb-10">
                {pub.content.split('\n').filter(p => p.trim()).map((para, i) => (
                  <p key={i} className="font-body text-lg text-slate-700 leading-[1.85] mb-5">
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* YouTube embed */}
            {ytId && (
              <div className="mt-8 mb-8">
                <h3 className="font-display text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center text-white text-xs shadow-sm">▶</span>
                  Video
                </h3>
                <div className="relative pb-[56.25%] h-0 rounded-2xl overflow-hidden bg-black shadow-lg">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${ytId}?rel=0`}
                    title="YouTube video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* PDF banner */}
            {pub.pdf_url && (
              <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center gap-4 flex-wrap">
                <div className="text-4xl">📄</div>
                <div className="flex-1 min-w-0">
                  <div className="font-ui font-bold text-slate-800">{pub.pdf_filename || 'Attached Document'}</div>
                  <div className="font-ui text-sm text-slate-500">PDF document attached to this publication</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <a href={pub.pdf_url} target="_blank" rel="noopener"
                    className="px-4 py-2 bg-brand-600 text-white rounded-xl font-ui text-sm font-semibold hover:bg-brand-700 transition-colors">
                    View PDF
                  </a>
                  {pub.allow_download && (
                    <a href={pub.pdf_url} download
                      className="px-4 py-2 bg-white border border-brand-200 text-brand-700 rounded-xl font-ui text-sm font-semibold hover:bg-brand-50 transition-colors flex items-center gap-1.5">
                      <HiDownload size={15} /> Download
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Related publications */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-6">More in {pub.category === 'study' ? 'Bible Study' : pub.category.charAt(0).toUpperCase() + pub.category.slice(1)}</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {related.map(r => (
                <Link key={r.id} href={`/publication/${r.id}`}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all">
                  <div className="relative h-36 bg-gradient-to-br from-brand-700 to-brand-900">
                    {r.cover_image_url && (
                      <Image src={r.cover_image_url} alt={r.title} fill className="object-cover opacity-80" />
                    )}
                  </div>
                  <div className="p-4">
                    <span className={`text-xs font-ui font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[r.category] || CATEGORY_COLORS.general}`}>
                      {r.category}
                    </span>
                    <h3 className="font-display font-bold text-slate-800 mt-2 line-clamp-2 text-sm leading-snug">{r.title}</h3>
                    <p className="font-ui text-xs text-slate-400 mt-1">
                      {r.profiles?.full_name || r.author_name || 'Anonymous'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="hero-pattern text-white mt-16 py-8 text-center">
        <p className="font-ui text-sm text-blue-300">
          © {new Date().getFullYear()} Three Angels Publications Ministry &nbsp;·&nbsp;
          <Link href="/" className="hover:text-white transition-colors">Back to Publications</Link>
        </p>
      </footer>
    </>
  )
}
