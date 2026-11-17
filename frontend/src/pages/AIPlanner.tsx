import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheck, FiClock, FiMapPin, FiShield } from 'react-icons/fi'
import type { Trip } from '../types'
import tripService from '../services/tripService'
import PageHero from '../components/common/PageHero'
import GlassCard from '../components/common/GlassCard'
import GradientButton from '../components/common/GradientButton'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import { formatCurrency } from '../utils'

const INTERESTS = [
  'Food', 'Culture', 'Hiking', 'Beaches', 'Nightlife', 'Photography',
  'Wildlife', 'Museums', 'Shopping', 'Wellness',
]

export default function AIPlanner() {
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    destination: params.get('destination') || '',
    days: Number(params.get('days') || 5),
    budget: Number(params.get('budget') || 2000),
    travelers: 2,
    starting_location: '',
    hotel_category: 'Boutique',
    transportation: 'Mixed',
    interests: [] as string[],
  })
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const chartReady = useMemo(() => trip?.budget_breakdown, [trip])

  function toggleInterest(i: string) {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(i)
        ? f.interests.filter((x) => x !== i)
        : [...f.interests, i],
    }))
  }

  async function onGenerate(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTrip(null)
    try {
      const result = await tripService.generatePlan(form)
      setTrip(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHero
        title="AI Trip Planner"
        subtitle="Tell us your destination and preferences — we’ll craft a full itinerary."
      />
      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <GlassCard className="p-4 sticky-lg-top" style={{ top: 'calc(var(--tv-navbar-h) + 1rem)' }}>
              <form onSubmit={onGenerate} className="d-flex flex-column gap-3">
                <div>
                  <label className="tv-label">Destination</label>
                  <input className="tv-input" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="tv-label">Days</label>
                    <input className="tv-input" type="number" min={1} max={30} value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} />
                  </div>
                  <div className="col-6">
                    <label className="tv-label">Travelers</label>
                    <input className="tv-input" type="number" min={1} value={form.travelers} onChange={(e) => setForm({ ...form, travelers: Number(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <label className="tv-label">Budget (USD)</label>
                  <input className="tv-input" type="number" min={100} value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="tv-label">Starting location</label>
                  <input className="tv-input" value={form.starting_location} onChange={(e) => setForm({ ...form, starting_location: e.target.value })} placeholder="City / airport" />
                </div>
                <div>
                  <label className="tv-label">Hotel category</label>
                  <select className="tv-select" value={form.hotel_category} onChange={(e) => setForm({ ...form, hotel_category: e.target.value })}>
                    {['Hostel', 'Budget', 'Boutique', '4-star', '5-star', 'Resort'].map((h) => (
                      <option key={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="tv-label">Transportation</label>
                  <select className="tv-select" value={form.transportation} onChange={(e) => setForm({ ...form, transportation: e.target.value })}>
                    {['Public transit', 'Rental car', 'Mixed', 'Private transfers', 'Walking-first'].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="tv-label">Interests</label>
                  <div className="d-flex flex-wrap gap-2">
                    {INTERESTS.map((i) => (
                      <button
                        key={i}
                        type="button"
                        className={`tv-chip ${form.interests.includes(i) ? 'active' : ''}`}
                        onClick={() => toggleInterest(i)}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
                {error && <div className="alert alert-danger py-2 small mb-0">{error}</div>}
                <GradientButton type="submit" loading={loading} className="w-100">
                  Generate Plan
                </GradientButton>
              </form>
            </GlassCard>
          </div>

          <div className="col-lg-8">
            {loading && (
              <div className="d-flex flex-column gap-3">
                <LoadingSkeleton height={48} />
                <LoadingSkeleton height={180} count={3} />
              </div>
            )}

            {!loading && !trip && (
              <GlassCard className="p-5 text-center text-muted-tv">
                <FiMapPin size={36} className="mb-3 opacity-50" />
                <p className="mb-0">Your AI itinerary will appear here after you generate a plan.</p>
              </GlassCard>
            )}

            <AnimatePresence>
              {trip && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="d-flex flex-column gap-4"
                >
                  <GlassCard className="p-4">
                    <h2 className="h3 mb-1">{trip.title}</h2>
                    <p className="text-muted-tv mb-0">
                      {trip.days} days · {formatCurrency(trip.budget)} · {trip.travelers || form.travelers} travelers
                    </p>
                  </GlassCard>

                  {trip.itinerary?.map((day, di) => (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: di * 0.08 }}
                    >
                      <GlassCard className="p-4">
                        <h3 className="h5 mb-3 d-flex align-items-center gap-2">
                          <FiClock className="text-primary-tv" /> {day.title}
                        </h3>
                        <div className="d-flex flex-column gap-3">
                          {day.activities.map((a, ai) => (
                            <div key={ai} className="d-flex gap-3">
                              <span
                                className="badge align-self-start text-capitalize"
                                style={{ background: 'var(--tv-gradient)', minWidth: 88 }}
                              >
                                {a.time}
                              </span>
                              <div>
                                <div className="fw-semibold">{a.title}</div>
                                <div className="text-muted-tv small">{a.description}</div>
                                {a.cost != null && (
                                  <div className="small mt-1" style={{ color: 'var(--tv-accent)' }}>
                                    ~{formatCurrency(a.cost)}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}

                  <div className="row g-3">
                    {[
                      { title: 'Attractions', items: trip.attractions?.map((x) => x.name) },
                      { title: 'Restaurants', items: trip.restaurants?.map((x) => x.name) },
                      { title: 'Nearby', items: trip.nearby?.map((x) => x.name) },
                    ].map((block) => (
                      <div className="col-md-4" key={block.title}>
                        <GlassCard className="p-3 h-100">
                          <h4 className="h6 mb-2">{block.title}</h4>
                          <ul className="mb-0 ps-3 small">
                            {block.items?.map((n) => <li key={n}>{n}</li>)}
                          </ul>
                        </GlassCard>
                      </div>
                    ))}
                  </div>

                  {trip.hotels && trip.hotels.length > 0 && (
                    <GlassCard className="p-4">
                      <h3 className="h5 mb-3">Recommended hotels</h3>
                      <div className="row g-3">
                        {trip.hotels.map((h) => (
                          <div className="col-md-6" key={h.id}>
                            <div className="d-flex gap-3">
                              <img src={h.image} alt="" width={88} height={88} className="rounded object-fit-cover" />
                              <div>
                                <div className="fw-semibold">{h.name}</div>
                                <div className="small text-muted-tv">{h.location}</div>
                                <div className="small">{formatCurrency(h.price_per_night)}/night · ★ {h.rating}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  {chartReady && (
                    <GlassCard className="p-4">
                      <h3 className="h5 mb-3">Budget breakdown</h3>
                      <div className="row g-2 small">
                        {Object.entries(chartReady)
                          .filter(([k]) => k !== 'total' && k !== 'currency' && k !== 'tips' && typeof chartReady[k as keyof typeof chartReady] === 'number')
                          .map(([k, v]) => (
                            <div className="col-6 col-md-4" key={k}>
                              <div className="text-muted-tv text-capitalize">{k}</div>
                              <div className="fw-semibold">{formatCurrency(v as number)}</div>
                            </div>
                          ))}
                        <div className="col-12 mt-2 pt-2 border-top" style={{ borderColor: 'var(--tv-border)' }}>
                          <strong>Total: {formatCurrency(chartReady.total)}</strong>
                        </div>
                      </div>
                    </GlassCard>
                  )}

                  <div className="row g-3">
                    {[
                      { title: 'Tips', icon: <FiCheck />, items: trip.tips },
                      { title: 'Packing', icon: <FiCheck />, items: trip.packing_list },
                      { title: 'Transport', icon: <FiMapPin />, items: trip.transport },
                      { title: 'Safety', icon: <FiShield />, items: trip.safety },
                    ].map((b) => (
                      <div className="col-md-6" key={b.title}>
                        <GlassCard className="p-3 h-100">
                          <h4 className="h6 mb-2 d-flex align-items-center gap-2">{b.icon} {b.title}</h4>
                          <ul className="mb-0 ps-3 small">
                            {b.items?.map((n) => <li key={n}>{n}</li>)}
                          </ul>
                        </GlassCard>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}
