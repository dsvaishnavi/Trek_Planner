import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import type { WeatherData } from '../types'
import weatherService from '../services/weatherService'
import PageHero from '../components/common/PageHero'
import GlassCard from '../components/common/GlassCard'
import GradientButton from '../components/common/GradientButton'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import { formatDate } from '../utils'

export default function Weather() {
  const [city, setCity] = useState('Tokyo')
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await weatherService.getWeather(city)
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHero
        title="Weather & Travel Tips"
        subtitle="Check the forecast and get AI suggestions for packing and timing."
      />
      <div className="container pb-5">
        <GlassCard className="p-3 mb-4">
          <form onSubmit={onSubmit} className="row g-2 align-items-end">
            <div className="col-md-8">
              <label className="tv-label">City</label>
              <input className="tv-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Tokyo, Paris, Reykjavik…" />
            </div>
            <div className="col-md-4">
              <GradientButton type="submit" loading={loading} className="w-100">Get weather</GradientButton>
            </div>
          </form>
        </GlassCard>

        {loading && <LoadingSkeleton height={200} count={2} />}

        {data && !loading && (
          <div className="d-flex flex-column gap-4">
            <GlassCard className="p-4">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <h2 className="h3 mb-1">{data.icon} {data.city}</h2>
                  <p className="text-muted-tv mb-0">{data.condition}</p>
                </div>
                <div className="text-end">
                  <div style={{ fontSize: '2.5rem', fontWeight: 600, fontFamily: 'var(--tv-font-display)' }}>
                    {data.current_temp}°C
                  </div>
                  <div className="small text-muted-tv">
                    Feels {data.feels_like ?? data.current_temp}° · Humidity {data.humidity}% · Wind {data.wind_kmh} km/h
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="row g-3">
              {data.forecast.map((day, i) => (
                <div className="col-6 col-md-3 col-lg" key={day.date}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlassCard className="p-3 text-center h-100">
                      <div className="small text-muted-tv mb-1">{formatDate(day.date)}</div>
                      <div style={{ fontSize: '1.75rem' }}>{day.icon}</div>
                      <div className="fw-semibold">{day.temp_max}° / {day.temp_min}°</div>
                      <div className="small text-muted-tv">{day.condition}</div>
                    </GlassCard>
                  </motion.div>
                </div>
              ))}
            </div>

            {data.ai_suggestions && (
              <GlassCard className="p-4">
                <h3 className="h5 mb-3">AI suggestions</h3>
                <ul className="mb-0">
                  {data.ai_suggestions.map((s) => (
                    <li key={s} className="mb-2">{s}</li>
                  ))}
                </ul>
              </GlassCard>
            )}
          </div>
        )}
      </div>
    </>
  )
}
