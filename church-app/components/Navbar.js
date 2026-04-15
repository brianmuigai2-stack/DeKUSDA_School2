import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { HiMenu, HiX, HiChevronDown } from 'react-icons/hi'
import AuthModal from './AuthModal'

export default function Navbar({ user, profile }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'

  async function signOut() {
    await supabase.auth.signOut()
    toast.success('Signed out.')
    router.push('/')
  }

  function openAuth(mode) {
    setAuthMode(mode)
    setShowAuth(true)
  }

  const navLinks = [
    { href: '/', label: 'Publications' },
    { href: '/resources', label: 'Resources' },
    { href: '/submit', label: 'Submit Article' },
  ]

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-brand-900 text-brand-200 text-center py-1.5 text-xs font-ui tracking-wide">
        ✞ &nbsp; Sharing God's Word — Three Angels Church Publications Ministry
      </div>

      <nav className="sticky top-0 z-50 glass border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <Image src="/logo.png" alt="Logo" fill className="object-contain drop-shadow-md" />
            </div>
            <div>
              <div className="font-display text-brand-900 font-bold text-lg leading-none tracking-wide">Three Angels</div>
              <div className="font-ui text-brand-500 text-xs tracking-widest uppercase">Publications</div>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={`px-4 py-2 rounded-lg font-ui text-sm font-medium transition-all ${
                  router.pathname === link.href
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-brand-700'
                }`}>
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin"
                className={`px-4 py-2 rounded-lg font-ui text-sm font-medium transition-all ${
                  router.pathname === '/admin'
                    ? 'bg-brand-600 text-white'
                    : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                }`}>
                🛡 Admin
              </Link>
            )}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold font-ui">
                    {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="font-ui text-sm text-slate-700 font-medium">
                    {profile?.full_name?.split(' ')[0] || 'User'}
                  </span>
                </div>
                <button onClick={signOut}
                  className="px-3 py-1.5 text-sm font-ui font-medium text-slate-500 hover:text-red-600 transition-colors">
                  Sign out
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => openAuth('login')}
                  className="px-4 py-2 font-ui text-sm font-medium text-brand-700 hover:bg-brand-50 rounded-lg transition-all">
                  Sign In
                </button>
                <button onClick={() => openAuth('register')}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-ui text-sm font-semibold rounded-lg transition-all shadow-sm">
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <HiX size={22} /> : <HiMenu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-blue-100 bg-white px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg font-ui text-sm font-medium text-slate-700 hover:bg-brand-50">
                {link.label}
              </Link>
            ))}
            {isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg font-ui text-sm font-medium text-brand-700 bg-brand-50">🛡 Admin Panel</Link>}
            <hr className="my-2" />
            {user ? (
              <button onClick={signOut} className="w-full text-left px-4 py-2.5 font-ui text-sm text-red-600">Sign Out</button>
            ) : (
              <div className="flex gap-2 pt-1">
                <button onClick={() => { openAuth('login'); setMenuOpen(false) }} className="flex-1 py-2 border border-brand-200 text-brand-700 rounded-lg font-ui text-sm font-medium">Sign In</button>
                <button onClick={() => { openAuth('register'); setMenuOpen(false) }} className="flex-1 py-2 bg-brand-600 text-white rounded-lg font-ui text-sm font-semibold">Register</button>
              </div>
            )}
          </div>
        )}
      </nav>

      {showAuth && <AuthModal mode={authMode} onClose={() => setShowAuth(false)} onSwitch={setAuthMode} />}
    </>
  )
}
