import { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuthStore, useUIStore } from '../store'
import toast from 'react-hot-toast'

export default function AuthModal() {
  const { showAuthModal, authMode, closeAuthModal, switchAuthMode } = useUIStore()
  const { login, register, isLoading, error, clearError } = useAuthStore()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  if (!showAuthModal) return null

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (authMode === 'login') {
      const result = await login(form.email, form.password)
      if (result.success) {
        toast.success(`Welcome back${result.isAdmin ? ', Admin!' : '!'}`)
        closeAuthModal()
      } else {
        toast.error(error || 'Invalid credentials. Please try again.')
      }
    } else {
      const result = await register(form.name, form.email, form.password)
      if (result.success) {
        if (result.needsConfirmation) {
          toast.success('Check your email to confirm your account!')
        } else {
          toast.success('Account created! Welcome aboard.')
        }
        closeAuthModal()
      } else {
        toast.error(error || 'Registration failed. Please try again.')
      }
    }
  }

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
              {authMode === 'login' ? 'Sign in to access property management & details' : 'Register to access all features'}
            </p>
          </div>
          <button onClick={closeAuthModal} style={{
            border: 'none', background: '#f1f5f9', borderRadius: 8,
            width: 36, height: 36, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {authMode === 'register' && (
              <div>
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: 40 }}
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: 40 }}
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    border: 'none', background: 'transparent', cursor: 'pointer',
                  }}
                >
                  {showPass ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', padding: '10px 14px', borderRadius: 8, color: '#dc2626', fontSize: 14 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="animate-spin" style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%', display: 'inline-block'
                  }} />
                  {authMode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                authMode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
          {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={switchAuthMode}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563ab', fontWeight: 600 }}
          >
            {authMode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}
