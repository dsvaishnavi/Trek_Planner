import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import PageHero from '../components/common/PageHero'
import GlassCard from '../components/common/GlassCard'
import GradientButton from '../components/common/GradientButton'
import ProtectedRoute from '../components/layout/ProtectedRoute'
import { getInitials } from '../utils'

function ProfileContent() {
  const { user, updateProfile } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    location: user?.location || '',
    travel_style: user?.travel_style || 'Adventure',
    phone: user?.phone || '',
  })
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function onSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await updateProfile({ ...form, avatar })
      setMessage('Profile updated.')
    } finally {
      setSaving(false)
    }
  }

  function onAvatarChange(file: File | null) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatar(reader.result)
    }
    reader.readAsDataURL(file)
  }

  if (!user) return null

  return (
    <>
      <PageHero title="Profile" subtitle="Your traveler identity, stats, and badges." />
      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <GlassCard className="p-4 text-center">
              <button
                type="button"
                className="border-0 bg-transparent p-0 mb-3"
                onClick={() => fileRef.current?.click()}
                aria-label="Upload profile picture"
              >
                {avatar ? (
                  <img src={avatar} alt="" width={112} height={112} className="rounded-circle object-fit-cover" />
                ) : (
                  <span
                    className="rounded-circle d-inline-flex align-items-center justify-content-center text-white mx-auto"
                    style={{ width: 112, height: 112, background: 'var(--tv-gradient)', fontSize: '2rem' }}
                  >
                    {getInitials(user.username || user.email)}
                  </span>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={(e) => onAvatarChange(e.target.files?.[0] ?? null)}
              />
              <h2 className="h4 mb-1">{user.first_name || user.username}</h2>
              <p className="text-muted-tv small">{user.email}</p>
              <Link to="/leaderboard" className="small">View leaderboard →</Link>
            </GlassCard>

            {user.stats && (
              <GlassCard className="p-4 mt-3">
                <h3 className="h6 mb-3">Stats</h3>
                <div className="row g-2 text-center">
                  <div className="col-6">
                    <div className="fw-bold">{user.stats.trips_completed}</div>
                    <div className="small text-muted-tv">Trips</div>
                  </div>
                  <div className="col-6">
                    <div className="fw-bold">{user.stats.cities_visited}</div>
                    <div className="small text-muted-tv">Cities</div>
                  </div>
                  <div className="col-6">
                    <div className="fw-bold">{user.stats.points}</div>
                    <div className="small text-muted-tv">Points</div>
                  </div>
                  <div className="col-6">
                    <div className="fw-bold">#{user.stats.rank ?? '—'}</div>
                    <div className="small text-muted-tv">Rank</div>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>

          <div className="col-lg-8">
            <GlassCard className="p-4 mb-4">
              <h3 className="h5 mb-3">Edit profile</h3>
              <form onSubmit={onSave} className="row g-3">
                <div className="col-md-6">
                  <label className="tv-label">First name</label>
                  <input className="tv-input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="tv-label">Last name</label>
                  <input className="tv-input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="tv-label">Username</label>
                  <input className="tv-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="tv-label">Phone</label>
                  <input className="tv-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="tv-label">Location</label>
                  <input className="tv-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="tv-label">Travel style</label>
                  <select className="tv-select" value={form.travel_style} onChange={(e) => setForm({ ...form, travel_style: e.target.value })}>
                    {['Adventure', 'Beach', 'Nature', 'Historical', 'Mountains', 'Luxury', 'Budget'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="tv-label">Bio</label>
                  <textarea className="tv-textarea" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </div>
                {message && <div className="col-12"><div className="alert alert-success py-2 small mb-0">{message}</div></div>}
                <div className="col-12">
                  <GradientButton type="submit" loading={saving}>Save changes</GradientButton>
                </div>
              </form>
            </GlassCard>

            <div className="row g-3">
              <div className="col-md-6">
                <GlassCard className="p-4 h-100">
                  <h3 className="h6 mb-3">Wishlist</h3>
                  <div className="d-flex flex-wrap gap-2">
                    {(user.wishlist || []).map((w) => (
                      <span key={w} className="tv-chip">{w}</span>
                    ))}
                    {!user.wishlist?.length && <span className="text-muted-tv small">No wishlist yet.</span>}
                  </div>
                </GlassCard>
              </div>
              <div className="col-md-6">
                <GlassCard className="p-4 h-100">
                  <h3 className="h6 mb-3">Visited cities</h3>
                  <div className="d-flex flex-wrap gap-2">
                    {(user.visited_cities || []).map((c) => (
                      <span key={c} className="tv-chip active">{c}</span>
                    ))}
                    {!user.visited_cities?.length && <span className="text-muted-tv small">None logged yet.</span>}
                  </div>
                </GlassCard>
              </div>
              <div className="col-12">
                <GlassCard className="p-4">
                  <h3 className="h6 mb-3">Badges</h3>
                  <div className="row g-2">
                    {(user.badges || []).map((b) => (
                      <div className="col-md-4" key={b.id}>
                        <div className="d-flex gap-2 align-items-center p-2 rounded" style={{ background: 'color-mix(in srgb, var(--tv-primary) 8%, transparent)' }}>
                          <span style={{ fontSize: '1.5rem' }}>{b.icon}</span>
                          <div>
                            <div className="fw-semibold small">{b.name}</div>
                            <div className="text-muted-tv" style={{ fontSize: '0.75rem' }}>{b.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!user.badges?.length && <span className="text-muted-tv small">Earn badges by completing trips.</span>}
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
