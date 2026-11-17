import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import type { MapPlace } from '../types'
import mapService from '../services/mapService'
import PageHero from '../components/common/PageHero'
import GlassCard from '../components/common/GlassCard'
import LoadingSkeleton from '../components/common/LoadingSkeleton'

// Fix default marker icons with Vite
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

const CATEGORIES = [
  { value: 'attraction', label: 'Attractions' },
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'hotel', label: 'Hotels' },
  { value: 'cafe', label: 'Cafés' },
]

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], 13)
  }, [lat, lng, map])
  return null
}

export default function Maps() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [type, setType] = useState('attraction')
  const [places, setPlaces] = useState<MapPlace[]>([])
  const [loading, setLoading] = useState(true)
  const [geoError, setGeoError] = useState('')

  useEffect(() => {
    if (!navigator.geolocation) {
      setCoords({ lat: 35.6762, lng: 139.6503 })
      setGeoError('Geolocation unavailable — showing Tokyo demo.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setCoords({ lat: 35.6762, lng: 139.6503 })
        setGeoError('Location denied — showing Tokyo demo.')
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }, [])

  useEffect(() => {
    if (!coords) return
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await mapService.getNearby(coords!.lat, coords!.lng, type)
        if (!cancelled) setPlaces(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [coords, type])

  return (
    <>
      <PageHero
        title="Nearby Explorer"
        subtitle="Discover places around you with interactive map markers."
        compact
      />
      <div className="container pb-5">
        {geoError && <p className="text-muted-tv small">{geoError}</p>}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`tv-chip ${type === c.value ? 'active' : ''}`}
              onClick={() => setType(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="row g-3">
          <div className="col-lg-8">
            {!coords || loading ? (
              <LoadingSkeleton height={420} />
            ) : (
              <GlassCard className="p-2 overflow-hidden">
                <MapContainer
                  center={[coords.lat, coords.lng]}
                  zoom={13}
                  style={{ height: 420, width: '100%' }}
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Recenter lat={coords.lat} lng={coords.lng} />
                  <Marker position={[coords.lat, coords.lng]}>
                    <Popup>You are here</Popup>
                  </Marker>
                  {places.map((p) => (
                    <Marker key={p.id} position={[p.lat, p.lng]}>
                      <Popup>
                        <strong>{p.name}</strong>
                        <br />
                        ★ {p.rating?.toFixed(1) ?? '—'} · {p.distance_km} km
                        {p.address && (
                          <>
                            <br />
                            <span className="text-muted">{p.address}</span>
                          </>
                        )}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </GlassCard>
            )}
          </div>
          <div className="col-lg-4">
            <GlassCard className="p-3" style={{ maxHeight: 440, overflowY: 'auto' }}>
              <h2 className="h6 mb-3">Places ({places.length})</h2>
              {loading && <LoadingSkeleton height={48} count={5} />}
              {!loading && places.map((p) => (
                <div
                  key={p.id}
                  className="py-2 border-bottom"
                  style={{ borderColor: 'var(--tv-border)' }}
                >
                  <div className="fw-semibold">{p.name}</div>
                  <div className="small text-muted-tv">
                    ★ {p.rating?.toFixed(1)} · {p.distance_km} km · {p.type}
                  </div>
                </div>
              ))}
            </GlassCard>
          </div>
        </div>
      </div>
    </>
  )
}
