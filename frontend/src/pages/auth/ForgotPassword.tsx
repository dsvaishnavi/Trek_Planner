import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import authService from '../../services/authService'
import GlassCard from '../../components/common/GlassCard'
import GradientButton from '../../components/common/GradientButton'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await authService.forgotPassword(email)
      setMessage(res.message)
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
            <h1 className="h3 mb-1">Reset password</h1>
            <p className="text-muted-tv small mb-0">We’ll email you a reset link</p>
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
              />
            </div>
            {message && <div className="alert alert-success py-2 small mb-0">{message}</div>}
            <GradientButton type="submit" loading={loading} className="w-100">
              Send reset link
            </GradientButton>
          </form>
          <p className="text-center small mt-3 mb-0">
            <Link to="/login">Back to login</Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
