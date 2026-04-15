import Head from 'next/head'
import Navbar from '../components/Navbar'
import { HiExternalLink } from 'react-icons/hi'

const RESOURCES = [
  {
    category: 'Bible Study',
    icon: '📖',
    color: 'from-brand-600 to-brand-800',
    items: [
      { icon: '📖', name: 'Bible Gateway', url: 'https://www.biblegateway.com', desc: 'Read the Bible in over 200 versions and 70 languages. Includes commentary, devotionals, and study tools.' },
      { icon: '📗', name: 'YouVersion Bible', url: 'https://www.youversion.com', desc: 'Free Bible app with reading plans, audio Bible, and community features.' },
      { icon: '🔬', name: 'Adventist Biblical Research', url: 'https://adventistbiblicalresearch.org', desc: 'Deep academic Bible study resources from the Adventist Biblical Research Institute.' },
    ]
  },
  {
    category: 'EGW Estate',
    icon: '✍️',
    color: 'from-purple-600 to-purple-800',
    items: [
      { icon: '✍️', name: 'EGW Writings', url: 'https://egwwritings.org', desc: 'Official online library of all Ellen G. White\'s writings, fully searchable with cross-references.' },
      { icon: '🏛️', name: 'White Estate', url: 'https://whiteestate.org', desc: 'The official custodians of Ellen G. White\'s writings and legacy. Research resources and historical materials.' },
      { icon: '📰', name: 'EGW Estate News', url: 'https://whiteestate.org/about/news', desc: 'Latest news, publications and updates from the Ellen G. White Estate.' },
    ]
  },
  {
    category: 'Worship & Music',
    icon: '🎵',
    color: 'from-green-600 to-green-800',
    items: [
      { icon: '🎵', name: 'SDA Hymnal', url: 'https://sdahymnal.net', desc: 'The complete Seventh-day Adventist Hymnal available online with lyrics and sheet music.' },
      { icon: '🎼', name: 'Adventist Hymnal App', url: 'https://www.adventisthymnal.org', desc: 'Digital hymnal with audio recordings and worship aids.' },
    ]
  },
  {
    category: 'Church Resources',
    icon: '🏛️',
    color: 'from-amber-600 to-amber-800',
    items: [
      { icon: '🌍', name: 'Adventist.org', url: 'https://www.adventist.org', desc: 'The official website of the Seventh-day Adventist world church. News, beliefs, and global mission.' },
      { icon: '📚', name: 'AdventSource', url: 'https://www.adventsource.org', desc: 'Ministry and leadership resources for Adventist churches.' },
      { icon: '📡', name: 'Hope Channel', url: 'https://www.hopechannel.com', desc: 'Christian television broadcasting Christ-centered content globally.' },
    ]
  },
]

export default function ResourcesPage({ user, profile }) {
  return (
    <>
      <Head><title>Resources — Three Angels Publications</title></Head>
      <Navbar user={user} profile={profile} />

      {/* Hero */}
      <div className="hero-pattern py-14 px-4 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-4xl font-bold mb-3">Study Resources</h1>
          <p className="font-ui text-blue-200">Curated tools to deepen your Bible study, prayer life, and understanding of Scripture.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14 space-y-14">
        {RESOURCES.map(section => (
          <div key={section.category}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-xl shadow-sm`}>
                {section.icon}
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900">{section.category}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {section.items.map(r => (
                <a key={r.name} href={r.url} target="_blank" rel="noopener"
                  className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{r.icon}</span>
                    <HiExternalLink className="text-slate-300 group-hover:text-brand-500 transition-colors mt-1" size={18} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{r.name}</h3>
                  <p className="font-ui text-sm text-slate-500 leading-relaxed">{r.desc}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="font-ui text-xs font-bold text-brand-600 group-hover:underline">Visit resource →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
