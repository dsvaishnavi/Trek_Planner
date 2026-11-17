import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { JourneyData } from '../types'
import journeyService from '../services/journeyService'
import PageHero from '../components/common/PageHero'
import GlassCard from '../components/common/GlassCard'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import { formatCurrency, formatDate } from '../utils'

const typeColor: Record<string, string> = {
  trip: 'var(--tv-ocean-600)',
  badge: 'var(--tv-sand-500)',
  expense: 'var(--tv-warning)',
  photo: 'var(--tv-ocean-400)',
}

export default function Journey() {
  const [data, setData] = useState<JourneyData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await journeyService.getJourney()
        if (!cancelled) setData(res)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <PageHero
        title="Your Journey"
        subtitle="Trips, expenses, photos, and achievements on one timeline."
      />
      <div className="container pb-5">
        {loading && <LoadingSkeleton height={200} count={3} />}

        {data && !loading && (
          <div className="d-flex flex-column gap-5">
            <div className="row g-3">
              <div className="col-md-4">
                <GlassCard className="p-4 text-center">
                  <div className="text-muted-tv small">Trips</div>
                  <div className="fs-2 fw-bold">{data.trips.length}</div>
                </GlassCard>
              </div>
              <div className="col-md-4">
                <GlassCard className="p-4 text-center">
                  <div className="text-muted-tv small">Total expenses</div>
                  <div className="fs-2 fw-bold">{formatCurrency(data.total_expenses)}</div>
                </GlassCard>
              </div>
              <div className="col-md-4">
                <GlassCard className="p-4 text-center">
                  <div className="text-muted-tv small">Achievements</div>
                  <div className="fs-2 fw-bold">{data.achievements.length}</div>
                </GlassCard>
              </div>
            </div>

            <section>
              <h2 className="h4 mb-3">Trips</h2>
              <div className="row g-3">
                {data.trips.map((t, i) => (
                  <div className="col-md-4" key={t.id}>
                    <motion.div
                      className="media-card"
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {t.cover_image && <img src={t.cover_image} alt={t.title} />}
                      <div className="media-card-body">
                        <h3 className="h5 mb-1">{t.title}</h3>
                        <p className="small text-muted-tv mb-2">
                          {t.days} days · {formatCurrency(t.budget)}
                          {t.total_expense != null && ` · spent ${formatCurrency(t.total_expense)}`}
                        </p>
                        <span className="badge text-capitalize" style={{ background: 'var(--tv-gradient)' }}>
                          {t.status}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="h4 mb-3">Timeline</h2>
              <div className="position-relative ps-4">
                <div
                  className="position-absolute top-0 bottom-0 start-0"
                  style={{ width: 2, marginLeft: 7, background: 'var(--tv-border)' }}
                />
                {data.timeline.map((item, i) => (
                  <motion.div
                    key={item.id}
                    className="position-relative mb-4"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <span
                      className="position-absolute rounded-circle"
                      style={{
                        width: 16,
                        height: 16,
                        left: -28,
                        top: 6,
                        background: typeColor[item.type] || 'var(--tv-primary)',
                        border: '3px solid var(--tv-bg)',
                      }}
                    />
                    <GlassCard className="p-3">
                      <div className="small text-muted-tv">{formatDate(item.date)} · {item.type}</div>
                      <div className="fw-semibold">{item.title}</div>
                      <div className="small text-muted-tv">{item.description}</div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="h4 mb-3">Photos</h2>
              <div className="row g-2">
                {data.photos.map((src) => (
                  <div className="col-6 col-md-3" key={src}>
                    <img
                      src={src}
                      alt="Travel memory"
                      className="w-100 rounded"
                      style={{ height: 160, objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="h4 mb-3">Achievements</h2>
              <div className="row g-3">
                {data.achievements.map((b) => (
                  <div className="col-md-4" key={b.id}>
                    <GlassCard className="p-3 d-flex gap-3 align-items-center">
                      <span style={{ fontSize: '2rem' }}>{b.icon}</span>
                      <div>
                        <div className="fw-semibold">{b.name}</div>
                        <div className="small text-muted-tv">{b.description}</div>
                      </div>
                    </GlassCard>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  )
}
