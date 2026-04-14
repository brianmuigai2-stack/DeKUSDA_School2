import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { HiX } from 'react-icons/hi'

export default function AuthModal({ mode, onClose, onSwitch }) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        console.log("LOGIN ATTEMPT:", { email, data, error })
        if (error) throw error
        toast.success('Welcome back! 🙏')
        onClose()
      } else {
        if (!name.trim()) { toast.error('Please enter your name'); setLoading(false); return }
        const { data, error } = await supabase.auth.signUp({
          email, password
        })
        console.log("SIGNUP ATTEMPT:", { email, name, data, error })
        if (error) throw error
        
        // Create profile manually after successful signup
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: name,
              email: email,
              role: 'member'
            })
          console.log("PROFILE CREATE:", { profileError })
        }
        
        toast.success('Account created! Welcome to the community.')
        onClose()
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md modal-enter overflow-hidden">
        {/* Header */}
        <div className="hero-pattern px-8 pt-8 pb-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-blue-200 hover:text-white transition-colors">
            <HiX size={20} />
          </button>
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Logo" className="h-16 w-auto drop-shadow-lg" />
          </div>
          <h2 className="font-display text-2xl font-bold text-center">
            {mode === 'login' ? 'Welcome Back' : 'Join the Community'}
          </h2>
          <p className="text-blue-200 text-center font-ui text-sm mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block font-ui text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 font-ui text-sm"
                placeholder="Your full name" required />
            </div>
          )}
          <div>
            <label className="block font-ui text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 font-ui text-sm"
              placeholder="your@email.com" autoComplete="email" required />
          </div>
          <div>
            <label className="block font-ui text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 font-ui text-sm"
              placeholder="••••••••" autoComplete="current-password" required />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-ui font-semibold rounded-lg transition-all shadow-sm disabled:opacity-60 mt-2">
            {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center font-ui text-sm text-slate-500">
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button type="button" onClick={() => onSwitch(mode === 'login' ? 'register' : 'login')}
              className="text-brand-600 font-semibold hover:underline">
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
