import api from './api'
import type { MapPlace } from '../types'

function mockNearby(lat: number, lng: number, type: string): MapPlace[] {
  const offsets = [
    [0.01, 0.008],
    [-0.008, 0.012],
    [0.015, -0.006],
    [-0.012, -0.01],
    [0.006, 0.015],
    [-0.004, 0.004],
  ]
  const names: Record<string, string[]> = {
    restaurant: ['Harbor Bistro', 'Spice Alley', 'Rooftop Kitchen', 'Local Table', 'Night Market Eats', 'Café Verde'],
    hotel: ['City Nest Hotel', 'Garden Stay', 'Urban Lodge', 'Skyline Inn', 'Harbor Suites', 'Quiet Quarters'],
    attraction: ['Old Fort', 'Art Museum', 'River Walk', 'Viewpoint Park', 'Heritage Square', 'Botanic Garden'],
    cafe: ['Bean & Book', 'Morning Light', 'Steam Room', 'Latte Lane', 'Corner Cup', 'Brew Trail'],
  }
  const list = names[type] ?? names.attraction
  return offsets.map(([dLat, dLng], i) => ({
    id: i + 1,
    name: list[i],
    type,
    lat: lat + dLat,
    lng: lng + dLng,
    rating: 4.2 + (i % 8) * 0.1,
    distance_km: Math.round((Math.sqrt(dLat * dLat + dLng * dLng) * 111) * 10) / 10,
    address: `Near ${lat.toFixed(3)}, ${lng.toFixed(3)}`,
  }))
}

export const mapService = {
  async getNearby(lat: number, lng: number, type = 'attraction'): Promise<MapPlace[]> {
    try {
      const { data } = await api.get('/maps/nearby/', { params: { lat, lng, type } })
      return Array.isArray(data) ? data : data.results ?? mockNearby(lat, lng, type)
    } catch {
      return mockNearby(lat, lng, type)
    }
  },
}

export default mapService
