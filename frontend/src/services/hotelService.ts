import api from './api'
import type { Hotel } from '../types'

export const mockHotels: Hotel[] = [
  {
    id: 1,
    name: 'Azure Cliff Hotel',
    location: 'Oia, Santorini',
    city: 'Santorini',
    rating: 4.9,
    price_per_night: 320,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    amenities: ['Infinity pool', 'Spa', 'Breakfast', 'Sea view'],
    description: 'Caldera-facing suites with private terraces.',
    category: 'Luxury',
  },
  {
    id: 2,
    name: 'Temple Garden Inn',
    location: 'Gion, Kyoto',
    city: 'Kyoto',
    rating: 4.7,
    price_per_night: 180,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    amenities: ['Onsen', 'Garden', 'WiFi'],
    description: 'Quiet ryokan-inspired stay near historic lanes.',
    category: 'Boutique',
  },
  {
    id: 3,
    name: 'Jungle Canopy Lodge',
    location: 'Ubud, Bali',
    city: 'Bali',
    rating: 4.6,
    price_per_night: 95,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    amenities: ['Pool', 'Yoga', 'Breakfast'],
    description: 'Open-air villas among rice terraces.',
    category: 'Mid-range',
  },
  {
    id: 4,
    name: 'Nordic Lights Lodge',
    location: 'Reykjavik outskirts',
    city: 'Reykjavik',
    rating: 4.8,
    price_per_night: 210,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
    amenities: ['Hot tub', 'Aurora deck', 'Parking'],
    description: 'Cozy base for Iceland adventures.',
    category: 'Boutique',
  },
  {
    id: 5,
    name: 'Medina Riad Maison',
    location: 'Marrakech Medina',
    city: 'Marrakech',
    rating: 4.5,
    price_per_night: 110,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    amenities: ['Courtyard', 'Rooftop', 'Breakfast'],
    description: 'Traditional riad with modern comforts.',
    category: 'Boutique',
  },
  {
    id: 6,
    name: 'Patagonia Basecamp',
    location: 'Torres del Paine',
    city: 'Patagonia',
    rating: 4.7,
    price_per_night: 160,
    image: 'https://images.unsplash.com/photo-1610641818989-c2051b5b5c1a?w=800&q=80',
    amenities: ['Guided hikes', 'Dining', 'Gear storage'],
    description: 'Trail-ready lodge for serious hikers.',
    category: 'Adventure',
  },
]

function mapHotel(h: Record<string, unknown>): Hotel {
  return {
    id: h.id as number,
    name: h.name as string,
    location: (h.destination as string) || (h.location as string) || '',
    city: (h.destination as string) || (h.city as string),
    rating: (h.rating as number) || 4.5,
    price_per_night: Number(h.price ?? h.price_per_night ?? 0),
    image:
      (h.image_url as string) ||
      (h.image as string) ||
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    amenities: (h.amenities as string[]) || [],
    description: (h.description as string) || '',
    category: Array.isArray(h.room_types) ? String((h.room_types as string[])[0]) : 'Standard',
    lat: h.latitude as number | undefined,
    lng: h.longitude as number | undefined,
  }
}

export const hotelService = {
  async getHotels(params?: { city?: string; q?: string }): Promise<Hotel[]> {
    try {
      const { data } = await api.get('/hotels/', {
        params: {
          destination: params?.city || params?.q,
          search: params?.q,
        },
      })
      const rows = Array.isArray(data) ? data : data.results ?? []
      return rows.length ? rows.map(mapHotel) : mockHotels
    } catch {
      if (params?.city) {
        return mockHotels.filter(
          (h) =>
            h.city?.toLowerCase().includes(params.city!.toLowerCase()) ||
            h.location.toLowerCase().includes(params.city!.toLowerCase()),
        )
      }
      return mockHotels
    }
  },

  async recommend(payload: { destination?: string; budget?: number; category?: string }): Promise<Hotel[]> {
    try {
      const { data } = await api.get('/hotels/recommend/', {
        params: {
          destination: payload.destination,
          budget_max: payload.budget,
        },
      })
      const rows = Array.isArray(data) ? data : data.results ?? []
      return rows.length ? rows.map(mapHotel) : mockHotels.slice(0, 4)
    } catch {
      return mockHotels.slice(0, 4)
    }
  },
}

export default hotelService
