import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import GlassCard from '../../components/common/GlassCard'
import GradientButton from '../../components/common/GradientButton'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register(form)
      navigate('/planner')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
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
            <h1 className="h3 mb-1">Create your account</h1>
            <p className="text-muted-tv small mb-0">Start planning with AI in minutes</p>
          </div>
          <form onSubmit={onSubmit} className="d-flex flex-column gap-3">
            <div className="row g-2">
              <div className="col-6">
                <label className="tv-label">First name</label>
                <input className="tv-input" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} />
              </div>
              <div className="col-6">
                <label className="tv-label">Last name</label>
                <input className="tv-input" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="tv-label">Username</label>
              <input className="tv-input" value={form.username} onChange={(e) => update('username', e.target.value)} required />
            </div>
            <div>
              <label className="tv-label">Email</label>
              <input className="tv-input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
            </div>
            <div>
              <label className="tv-label">Password</label>
              <input className="tv-input" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={6} />
            </div>
            <div>
              <label className="tv-label">Confirm password</label>
              <input className="tv-input" type="password" value={form.password_confirm} onChange={(e) => update('password_confirm', e.target.value)} required />
            </div>
            {error && <div className="alert alert-danger py-2 small mb-0">{error}</div>}
            <GradientButton type="submit" loading={loading} className="w-100">
              Create account
            </GradientButton>
          </form>
          <p className="text-center small mt-3 mb-0">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
