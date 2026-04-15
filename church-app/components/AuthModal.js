import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { HiX, HiEye, HiEyeOff, HiMail } from 'react-icons/hi'

export default function AuthModal({ mode, onClose, onSwitch }) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Welcome back! 🙏')
        onClose()
      } else {
        if (!name.trim()) { toast.error('Please enter your name'); setLoading(false); return }
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } }
        })
        if (error) throw error
        toast.success('Account created! Check your email to verify. 🙏')
        onClose()
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    if (!email.trim()) { toast.error('Please enter your email first'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setResetSent(true)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
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
            {forgotMode ? 'Reset Password' : mode === 'login' ? 'Welcome Back' : 'Join the Community'}
          </h2>
          <p className="text-blue-200 text-center font-ui text-sm mt-1">
            {forgotMode ? 'Enter your email to receive a reset link'
              : mode === 'login' ? 'Sign in to your account'
              : 'Create your free account'}
          </p>
        </div>

        {/* Reset email sent confirmation */}
        {resetSent ? (
          <div className="px-8 py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiMail className="text-green-600" size={28} />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">Check Your Email</h3>
            <p className="font-ui text-sm text-slate-500 mb-6">
              We sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
            </p>
            <button onClick={() => { setForgotMode(false); setResetSent(false) }}
              className="font-ui text-sm text-brand-600 font-semibold hover:underline">
              ← Back to Sign In
            </button>
          </div>

        ) : forgotMode ? (
          /* Forgot password form */
          <form onSubmit={handleForgotPassword} className="px-8 py-6 space-y-4">
            <div>
              <label className="block font-ui text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 font-ui text-sm"
                placeholder="your@email.com" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-ui font-semibold rounded-lg transition-all disabled:opacity-60">
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
            <p className="text-center font-ui text-sm text-slate-500">
              <button type="button" onClick={() => setForgotMode(false)}
                className="text-brand-600 font-semibold hover:underline">
                ← Back to Sign In
              </button>
            </p>
          </form>

        ) : (
          /* Login / Register form */
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
                placeholder="your@email.com" required />
            </div>
            <div>
              <label className="block font-ui text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 pr-11 font-ui text-sm"
                  placeholder="••••••••" required
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600 transition-colors">
                  {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex justify-end -mt-1">
                <button type="button" onClick={() => setForgotMode(true)}
                  className="font-ui text-xs text-brand-600 hover:underline font-medium">
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-ui font-semibold rounded-lg transition-all shadow-sm disabled:opacity-60 mt-2">
              {loading ? '…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            <p className="text-center font-ui text-sm text-slate-500">
              {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
              <button type="button" onClick={() => onSwitch(mode === 'login' ? 'register' : 'login')}
                className="text-brand-600 font-semibold hover:underline">
                {mode === 'login' ? 'Register' : 'Sign In'}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
