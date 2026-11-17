import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import GlassCard from '../../components/common/GlassCard'
import GradientButton from '../../components/common/GradientButton'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="auth-card">
          <div className="text-center mb-4">
            <div className="brand-logo justify-content-center mb-2">🌍 TrekVerse AI</div>
            <h1 className="h3 mb-1">Welcome back</h1>
            <p className="text-muted-tv small mb-0">Sign in to continue your journey</p>
          </div>
          <form onSubmit={onSubmit} className="d-flex flex-column gap-3">
            <div>
              <label className="tv-label">Email</label>
              <input
                className="tv-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="tv-label">Password</label>
              <input
                className="tv-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && <div className="alert alert-danger py-2 small mb-0">{error}</div>}
            <GradientButton type="submit" loading={loading} className="w-100">
              Sign in
            </GradientButton>
          </form>
          <div className="d-flex justify-content-between mt-3 small">
            <Link to="/forgot-password">Forgot password?</Link>
            <Link to="/register">Create account</Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
