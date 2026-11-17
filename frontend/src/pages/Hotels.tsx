import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiStar } from 'react-icons/fi'
import type { Hotel } from '../types'
import hotelService from '../services/hotelService'
import PageHero from '../components/common/PageHero'
import GlassCard from '../components/common/GlassCard'
import GradientButton from '../components/common/GradientButton'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import { formatCurrency } from '../utils'
import { useDebounce } from '../hooks/useDebounce'

export default function Hotels() {
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 350)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await hotelService.getHotels(debounced ? { city: debounced } : undefined)
        if (!cancelled) setHotels(data.length ? data : await hotelService.getHotels())
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [debounced])

  function book(hotel: Hotel) {
    if (hotel.booking_url) {
      window.open(hotel.booking_url, '_blank', 'noopener,noreferrer')
    } else {
      window.alert(`Booking demo for ${hotel.name} — connect a booking partner to go live.`)
    }
  }

  return (
    <>
      <PageHero
        title="Hotels"
        subtitle="Curated stays for every itinerary — from boutique to adventure lodges."
      >
        <input
          className="tv-input"
          style={{ maxWidth: 420 }}
          placeholder="Filter by city…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </PageHero>
      <div className="container pb-5">
        <div className="row g-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div className="col-md-4" key={i}><LoadingSkeleton height={320} /></div>
              ))
            : hotels.map((h, i) => (
                <div className="col-md-4 col-sm-6" key={h.id}>
                  <motion.div
                    className="media-card"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <img src={h.image} alt={h.name} />
                    <div className="media-card-body">
                      <div className="d-flex justify-content-between gap-2">
                        <h2 className="h5 mb-1">{h.name}</h2>
                        <span className="small d-flex align-items-center gap-1" style={{ color: 'var(--tv-accent)' }}>
                          <FiStar /> {h.rating}
                        </span>
                      </div>
                      <p className="small text-muted-tv mb-2">{h.location}</p>
                      {h.description && <p className="small truncate-2 mb-2">{h.description}</p>}
                      {h.amenities && (
                        <div className="d-flex flex-wrap gap-1 mb-3">
                          {h.amenities.slice(0, 3).map((a) => (
                            <span key={a} className="badge" style={{ background: 'color-mix(in srgb, var(--tv-primary) 12%, transparent)', color: 'var(--tv-primary)' }}>
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="d-flex justify-content-between align-items-center">
                        <strong>{formatCurrency(h.price_per_night)}<span className="fw-normal text-muted-tv small"> / night</span></strong>
                        <GradientButton className="btn-sm" onClick={() => book(h)}>Book Now</GradientButton>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
        </div>
        {!loading && hotels.length === 0 && (
          <GlassCard className="p-5 text-center text-muted-tv">No hotels found for that city.</GlassCard>
        )}
      </div>
    </>
  )
}
