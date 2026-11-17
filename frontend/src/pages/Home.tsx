import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMapPin, FiStar } from 'react-icons/fi'
import type { Destination, TravelType, Trip } from '../types'
import tripService from '../services/tripService'
import GlassCard from '../components/common/GlassCard'
import GradientButton from '../components/common/GradientButton'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import { formatCurrency } from '../utils'

const HERO_BG =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80'

const travelTypes: TravelType[] = ['Adventure', 'Beach', 'Nature', 'Historical', 'Mountains']

const testimonials = [
  {
    quote: 'TrekVerse planned our Kyoto week better than any agency — and we stayed under budget.',
    name: 'Maya R.',
    role: 'Solo traveler',
  },
  {
    quote: 'The AI itinerary felt human. Morning hikes, afternoon cafés, evening views — perfect rhythm.',
    name: 'Jordan K.',
    role: 'Couple trip',
  },
  {
    quote: 'Budget charts and weather tips in one place. Finally travel tools that talk to each other.',
    name: 'Samir P.',
    role: 'Family of four',
  },
]

const features = [
  { title: 'AI Itineraries', desc: 'Day-by-day plans with morning, afternoon, and evening beats.' },
  { title: 'Smart Budgeting', desc: 'Predict costs across hotels, food, transport, and activities.' },
  { title: 'Live Context', desc: 'Weather, maps, and hotels that adapt to your destination.' },
  { title: 'Your Journey', desc: 'Track trips, badges, and memories in one timeline.' },
]

export default function Home() {
  const navigate = useNavigate()
  const [destination, setDestination] = useState('')
  const [budget, setBudget] = useState('2000')
  const [days, setDays] = useState('5')
  const [travelType, setTravelType] = useState<TravelType>('Adventure')
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [d, t] = await Promise.all([tripService.getDestinations(), tripService.getTrips()])
        if (!cancelled) {
          setDestinations(d)
          setTrips(t)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  function onGenerate(e: FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams({
      destination,
      budget,
      days,
      travel_type: travelType,
    })
    navigate(`/planner?${params.toString()}`)
  }

  return (
    <>
      {/* Full-bleed hero — brand + headline + sentence + search only */}
      <section
        className="position-relative d-flex align-items-end"
        style={{
          minHeight: '100vh',
          marginTop: 'calc(-1 * var(--tv-navbar-h))',
          paddingTop: 'var(--tv-navbar-h)',
          backgroundImage: `var(--tv-gradient-hero), url(${HERO_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container pb-5 pt-5" style={{ paddingBottom: '4.5rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-white"
            style={{ maxWidth: 720 }}
          >
            <div
              className="mb-3"
              style={{
                fontFamily: 'var(--tv-font-display)',
                fontSize: 'clamp(2.4rem, 5vw, 3.75rem)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              🌍 TrekVerse AI
            </div>
            <h1
              className="text-white mb-3"
              style={{
                fontFamily: 'var(--tv-font-sans)',
                fontWeight: 500,
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                lineHeight: 1.35,
              }}
            >
              Plan Your Dream Journey with AI
            </h1>
            <p className="mb-4 opacity-90" style={{ fontSize: '1.05rem', maxWidth: 480 }}>
              Intelligent itineraries, budgets, and discoveries — crafted for how you actually travel.
            </p>
          </motion.div>

          <motion.form
            onSubmit={onGenerate}
            className="hero-search glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
          >
            <div>
              <label className="tv-label text-white-50" style={{ color: 'var(--tv-text-muted)' }}>Destination</label>
              <input
                className="tv-input"
                placeholder="Bali, Kyoto, Iceland…"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="tv-label">Budget (USD)</label>
              <input
                className="tv-input"
                type="number"
                min={100}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="tv-label">Days</label>
              <input
                className="tv-input"
                type="number"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="tv-label">Travel Type</label>
              <select
                className="tv-select"
                value={travelType}
                onChange={(e) => setTravelType(e.target.value as TravelType)}
              >
                {travelTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="d-flex align-items-end">
              <GradientButton type="submit" className="w-100">
                Generate AI Trip
              </GradientButton>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="page-section">
        <div className="container">
          <p className="section-eyebrow">Explore</p>
          <h2 className="section-title">Popular Destinations</h2>
          <p className="section-lead mb-4">Hand-picked places travelers love right now.</p>
          <div className="row g-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div className="col-md-4 col-sm-6" key={i}>
                    <LoadingSkeleton height={280} />
                  </div>
                ))
              : destinations.slice(0, 6).map((d, i) => (
                  <div className="col-md-4 col-sm-6" key={d.id}>
                    <motion.div
                      className="media-card"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <img src={d.image} alt={d.name} />
                      <div className="media-card-body">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div>
                            <h3 className="h5 mb-1">{d.name}</h3>
                            <div className="text-muted-tv small d-flex align-items-center gap-1">
                              <FiMapPin size={12} /> {d.country}
                            </div>
                          </div>
                          <span className="small d-flex align-items-center gap-1" style={{ color: 'var(--tv-accent)' }}>
                            <FiStar /> {d.rating}
                          </span>
                        </div>
                        <p className="small text-muted-tv mt-2 mb-0 truncate-2">{d.description}</p>
                      </div>
                    </motion.div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Trending Trips */}
      <section className="page-section" style={{ background: 'color-mix(in srgb, var(--tv-ocean-700) 4%, var(--tv-bg))' }}>
        <div className="container">
          <p className="section-eyebrow">Trending</p>
          <h2 className="section-title">Trending Trips</h2>
          <p className="section-lead mb-4">Journeys our community is planning and living.</p>
          <div className="row g-4">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div className="col-md-4" key={i}><LoadingSkeleton height={220} /></div>
                ))
              : trips.slice(0, 3).map((t) => (
                  <div className="col-md-4" key={t.id}>
                    <GlassCard asMotion className="overflow-hidden h-100 p-0">
                      {t.cover_image && (
                        <img src={t.cover_image} alt={t.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                      )}
                      <div className="p-3">
                        <h3 className="h5 mb-1">{t.title}</h3>
                        <p className="text-muted-tv small mb-2">{t.days} days · {formatCurrency(t.budget)}</p>
                        <span className="badge" style={{ background: 'var(--tv-gradient)', color: '#fff' }}>
                          {t.status || 'planned'}
                        </span>
                      </div>
                    </GlassCard>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="page-section">
        <div className="container">
          <p className="section-eyebrow">Stories</p>
          <h2 className="section-title">Loved by explorers</h2>
          <div className="row g-4 mt-1">
            {testimonials.map((t) => (
              <div className="col-md-4" key={t.name}>
                <GlassCard asMotion className="p-4 h-100">
                  <p className="mb-3" style={{ fontFamily: 'var(--tv-font-display)', fontSize: '1.1rem' }}>
                    “{t.quote}”
                  </p>
                  <div className="fw-semibold">{t.name}</div>
                  <div className="text-muted-tv small">{t.role}</div>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="page-section" style={{ background: 'color-mix(in srgb, var(--tv-sand-400) 8%, var(--tv-bg))' }}>
        <div className="container">
          <p className="section-eyebrow">Platform</p>
          <h2 className="section-title">Everything for the modern traveler</h2>
          <div className="row g-4 mt-1">
            {features.map((f) => (
              <div className="col-md-6 col-lg-3" key={f.title}>
                <GlassCard asMotion className="p-4 h-100">
                  <h3 className="h5 mb-2">{f.title}</h3>
                  <p className="text-muted-tv small mb-0">{f.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="page-section">
        <div className="container">
          <GlassCard className="p-5 text-center" style={{ background: 'var(--tv-gradient)', border: 'none' }}>
            <h2 className="text-white mb-2" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
              Ready for your next chapter?
            </h2>
            <p className="text-white opacity-90 mb-4 mx-auto" style={{ maxWidth: 420 }}>
              Open the AI Planner and generate a trip in minutes.
            </p>
            <Link to="/planner" className="btn btn-light rounded-pill px-4 fw-semibold" style={{ color: 'var(--tv-ocean-900)' }}>
              Start planning
            </Link>
          </GlassCard>
        </div>
      </section>
    </>
  )
}
