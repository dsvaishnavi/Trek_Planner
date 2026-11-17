import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { FiStar } from 'react-icons/fi'
import type { RecommendationResult } from '../types'
import recommendationService from '../services/recommendationService'
import PageHero from '../components/common/PageHero'
import GlassCard from '../components/common/GlassCard'
import GradientButton from '../components/common/GradientButton'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import { formatCurrency } from '../utils'

const PREFS = ['Adventure', 'Beach', 'Nature', 'Historical', 'Mountains', 'Food', 'Culture', 'Relaxation']

export default function Recommendations() {
  const [prefs, setPrefs] = useState<string[]>(['Nature'])
  const [budget, setBudget] = useState(2000)
  const [travelStyle, setTravelStyle] = useState('balanced')
  const [season, setSeason] = useState('any')
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [loading, setLoading] = useState(false)

  function toggle(p: string) {
    setPrefs((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await recommendationService.getRecommendations({
        preferences: prefs,
        budget,
        travel_style: travelStyle,
        season,
      })
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHero
        title="Personalized Recommendations"
        subtitle="Tell us what you love — we’ll surface destinations, stays, and hidden gems."
      />
      <div className="container pb-5">
        <GlassCard className="p-4 mb-4">
          <form onSubmit={onSubmit} className="row g-3 align-items-end">
            <div className="col-12">
              <label className="tv-label">Preferences</label>
              <div className="d-flex flex-wrap gap-2">
                {PREFS.map((p) => (
                  <button key={p} type="button" className={`tv-chip ${prefs.includes(p) ? 'active' : ''}`} onClick={() => toggle(p)}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-md-3">
              <label className="tv-label">Budget</label>
              <input className="tv-input" type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
            </div>
            <div className="col-md-3">
              <label className="tv-label">Travel style</label>
              <select className="tv-select" value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)}>
                <option value="budget">Budget</option>
                <option value="balanced">Balanced</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="tv-label">Season</label>
              <select className="tv-select" value={season} onChange={(e) => setSeason(e.target.value)}>
                <option value="any">Any</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="fall">Fall</option>
                <option value="winter">Winter</option>
              </select>
            </div>
            <div className="col-md-3">
              <GradientButton type="submit" loading={loading} className="w-100">
                Get recommendations
              </GradientButton>
            </div>
          </form>
        </GlassCard>

        {loading && (
          <div className="row g-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="col-md-3" key={i}><LoadingSkeleton height={240} /></div>
            ))}
          </div>
        )}

        {result && !loading && (
          <div className="d-flex flex-column gap-5">
            <section>
              <h2 className="h4 mb-3">Destinations</h2>
              <div className="row g-3">
                {result.destinations.map((d, i) => (
                  <div className="col-md-3 col-sm-6" key={d.id}>
                    <motion.div className="media-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <img src={d.image} alt={d.name} />
                      <div className="media-card-body">
                        <div className="fw-semibold">{d.name}</div>
                        <div className="small text-muted-tv">{d.country}</div>
                        <div className="small mt-1 d-flex align-items-center gap-1"><FiStar /> {d.rating}</div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="h4 mb-3">Hotels</h2>
              <div className="row g-3">
                {result.hotels.map((h) => (
                  <div className="col-md-6" key={h.id}>
                    <GlassCard className="p-0 overflow-hidden h-100">
                      <div className="row g-0">
                        <div className="col-4">
                          <img src={h.image} alt="" style={{ width: '100%', height: '100%', minHeight: 120, objectFit: 'cover' }} />
                        </div>
                        <div className="col-8 p-3">
                          <div className="fw-semibold">{h.name}</div>
                          <div className="small text-muted-tv">{h.location}</div>
                          <div className="small mt-1">{formatCurrency(h.price_per_night)}/night · ★ {h.rating}</div>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                ))}
              </div>
            </section>

            <div className="row g-4">
              <div className="col-md-6">
                <h2 className="h4 mb-3">Activities</h2>
                <div className="d-flex flex-column gap-2">
                  {result.activities.map((a) => (
                    <GlassCard key={a.name} className="p-3">
                      <div className="fw-semibold">{a.name}</div>
                      <div className="small text-muted-tv">{a.description}</div>
                    </GlassCard>
                  ))}
                </div>
              </div>
              <div className="col-md-6">
                <h2 className="h4 mb-3">Hidden gems</h2>
                <div className="d-flex flex-column gap-2">
                  {result.hidden_gems.map((g) => (
                    <GlassCard key={g.name} className="p-3">
                      <div className="fw-semibold">{g.name}</div>
                      <div className="small text-muted-tv">{g.description}</div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
