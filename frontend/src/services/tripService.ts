import api from './api'
import type { Destination, PlannerRequest, Trip } from '../types'

export const mockDestinations: Destination[] = [
  {
    id: 1,
    name: 'Santorini',
    country: 'Greece',
    description: 'Whitewashed cliffs, Aegean sunsets, and caldera views.',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80',
    rating: 4.9,
    price_range: '$$$',
    tags: ['Beach', 'Romance'],
    category: 'Beach',
    lat: 36.3932,
    lng: 25.4615,
  },
  {
    id: 2,
    name: 'Kyoto',
    country: 'Japan',
    description: 'Temples, tea houses, and timeless seasons.',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    rating: 4.8,
    price_range: '$$',
    tags: ['Historical', 'Culture'],
    category: 'Historical',
    lat: 35.0116,
    lng: 135.7681,
  },
  {
    id: 3,
    name: 'Patagonia',
    country: 'Chile / Argentina',
    description: 'Glaciers, windswept peaks, and wild trails.',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    rating: 4.9,
    price_range: '$$$',
    tags: ['Adventure', 'Mountains'],
    category: 'Mountains',
    lat: -50.9423,
    lng: -73.4068,
  },
  {
    id: 4,
    name: 'Bali',
    country: 'Indonesia',
    description: 'Rice terraces, temples, and surf at golden hour.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    rating: 4.7,
    price_range: '$$',
    tags: ['Nature', 'Beach'],
    category: 'Nature',
    lat: -8.3405,
    lng: 115.092,
  },
  {
    id: 5,
    name: 'Reykjavik',
    country: 'Iceland',
    description: 'Northern lights, hot springs, and volcanic drama.',
    image: 'https://images.unsplash.com/photo-1504829857797-ddff29ac2005?w=800&q=80',
    rating: 4.8,
    price_range: '$$$',
    tags: ['Adventure', 'Nature'],
    category: 'Adventure',
    lat: 64.1466,
    lng: -21.9426,
  },
  {
    id: 6,
    name: 'Marrakech',
    country: 'Morocco',
    description: 'Souks, riads, and desert gateways.',
    image: 'https://images.unsplash.com/photo-1597212618440-901f2f2c7c0e?w=800&q=80',
    rating: 4.6,
    price_range: '$$',
    tags: ['Historical', 'Culture'],
    category: 'Historical',
    lat: 31.6295,
    lng: -7.9811,
  },
]

function buildMockTrip(req: PlannerRequest): Trip {
  const days = Array.from({ length: req.days }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1} in ${req.destination}`,
    activities: [
      {
        time: 'morning' as const,
        title: i === 0 ? 'Arrival & orientation walk' : 'Landmark exploration',
        description: `Start your morning exploring the highlights of ${req.destination}.`,
        duration: '3h',
        cost: Math.round(req.budget * 0.02),
      },
      {
        time: 'afternoon' as const,
        title: 'Local cuisine & culture',
        description: 'Immerse in local flavors and artisan neighborhoods.',
        duration: '3h',
        cost: Math.round(req.budget * 0.03),
      },
      {
        time: 'evening' as const,
        title: 'Sunset viewpoint & dinner',
        description: 'Catch golden hour then enjoy a curated dinner spot.',
        duration: '3h',
        cost: Math.round(req.budget * 0.04),
      },
    ],
  }))

  return {
    id: Date.now(),
    title: `AI Trip to ${req.destination}`,
    destination: req.destination,
    days: req.days,
    budget: req.budget,
    travelers: req.travelers,
    status: 'planned',
    cover_image: mockDestinations[0].image,
    itinerary: days,
    attractions: [
      { name: `${req.destination} Old Town`, rating: 4.7, category: 'Sightseeing', description: 'Historic core with cafés and viewpoints.' },
      { name: 'National Museum', rating: 4.5, category: 'Culture', description: 'Essential cultural stop.' },
      { name: 'Scenic Overlook', rating: 4.9, category: 'Nature', description: 'Best photo spot at dusk.' },
    ],
    restaurants: [
      { name: 'Harbor Table', rating: 4.6, price_level: '$$', description: 'Fresh seafood with waterfront views.' },
      { name: 'Spice Route Kitchen', rating: 4.8, price_level: '$$$', description: 'Modern takes on local classics.' },
    ],
    hotels: [
      {
        id: 101,
        name: 'Oceanview Boutique',
        location: req.destination,
        rating: 4.7,
        price_per_night: Math.round(req.budget / req.days / req.travelers / 2),
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
        amenities: ['WiFi', 'Breakfast', 'Pool'],
        category: req.hotel_category || 'Boutique',
      },
    ],
    nearby: [
      { name: 'Artisan Market', distance_km: 1.2, rating: 4.4 },
      { name: 'Botanical Garden', distance_km: 3.5, rating: 4.6 },
    ],
    budget_breakdown: {
      accommodation: Math.round(req.budget * 0.4),
      food: Math.round(req.budget * 0.25),
      transport: Math.round(req.budget * 0.15),
      activities: Math.round(req.budget * 0.15),
      miscellaneous: Math.round(req.budget * 0.05),
      total: req.budget,
      currency: 'USD',
    },
    tips: [
      'Book popular attractions 48 hours ahead.',
      'Carry a light rain jacket even in dry season.',
      'Use local transit cards to save on short hops.',
    ],
    packing_list: ['Comfortable walking shoes', 'Reusable water bottle', 'Power adapter', 'Daypack', 'Sunscreen'],
    transport: [
      req.transportation || 'Public transit + rideshare',
      'Airport transfer recommended on arrival day',
    ],
    safety: [
      'Keep digital copies of documents.',
      'Use hotel safes for passports.',
      'Stay aware in crowded tourist zones.',
    ],
    created_at: new Date().toISOString(),
  }
}

const mockTrips: Trip[] = [
  {
    id: 1,
    title: 'Bali Escape',
    destination: 'Bali',
    days: 7,
    budget: 1800,
    status: 'completed',
    cover_image: mockDestinations[3].image,
    travel_type: 'Nature',
    total_expense: 1650,
    created_at: '2025-11-12',
  },
  {
    id: 2,
    title: 'Kyoto Temples',
    destination: 'Kyoto',
    days: 5,
    budget: 2200,
    status: 'planned',
    cover_image: mockDestinations[1].image,
    travel_type: 'Historical',
    created_at: '2026-03-01',
  },
  {
    id: 3,
    title: 'Iceland Ring',
    destination: 'Reykjavik',
    days: 8,
    budget: 3200,
    status: 'ongoing',
    cover_image: mockDestinations[4].image,
    travel_type: 'Adventure',
    created_at: '2026-06-20',
  },
]

export const tripService = {
  async getDestinations(): Promise<Destination[]> {
    try {
      const { data } = await api.get('/destinations/')
      const rows = Array.isArray(data) ? data : data.results ?? []
      if (!rows.length) return mockDestinations
      return rows.map((d: Record<string, unknown>) => ({
        id: d.id as number,
        name: d.name as string,
        country: (d.country as string) || 'India',
        description: (d.description as string) || '',
        image: (d.image_url as string) || (d.image as string) || mockDestinations[0].image,
        rating: (d.rating as number) || 4.5,
        tags: (d.tags as string[]) || [],
        category: d.category as string,
        lat: d.latitude as number | undefined,
        lng: d.longitude as number | undefined,
      }))
    } catch {
      return mockDestinations
    }
  },

  async getTrips(): Promise<Trip[]> {
    try {
      const { data } = await api.get('/trips/')
      return Array.isArray(data) ? data : data.results ?? mockTrips
    } catch {
      return mockTrips
    }
  },

  async createTrip(trip: Partial<Trip>): Promise<Trip> {
    try {
      const { data } = await api.post('/trips/', trip)
      return data
    } catch {
      return { ...mockTrips[0], ...trip, id: Date.now() }
    }
  },

  async generatePlan(req: PlannerRequest): Promise<Trip> {
    try {
      const { data } = await api.post('/planner/generate/', req)
      // Backend returns { plan, trip }; normalize into Trip for the UI
      if (data.trip) return mapPlanToTrip(data.trip, data.plan)
      if (data.plan) return mapPlanToTrip(data.plan, data.plan)
      return data as Trip
    } catch {
      await new Promise((r) => setTimeout(r, 1200))
      return buildMockTrip(req)
    }
  },
}

/** Map backend AI plan / trip JSON into the frontend Trip shape */
function mapPlanToTrip(tripOrPlan: Record<string, unknown>, plan?: Record<string, unknown>): Trip {
  const p = plan || tripOrPlan
  const itineraryRaw = (p.itinerary || tripOrPlan.itinerary || {}) as Record<string, { title?: string; morning?: string; afternoon?: string; evening?: string }>
  const itinerary = Object.entries(itineraryRaw).map(([key, day], i) => ({
    day: i + 1,
    title: day.title || key.replace('_', ' '),
    activities: [
      { time: 'morning' as const, title: 'Morning', description: day.morning || '', duration: '3h', cost: 0 },
      { time: 'afternoon' as const, title: 'Afternoon', description: day.afternoon || '', duration: '3h', cost: 0 },
      { time: 'evening' as const, title: 'Evening', description: day.evening || '', duration: '3h', cost: 0 },
    ],
  }))
  const breakdown = (p.budget_breakdown || {}) as Record<string, number>
  return {
    id: (tripOrPlan.id as number) || Date.now(),
    title: (p.title as string) || (tripOrPlan.title as string) || 'AI Trip',
    destination: (p.destination as string) || (tripOrPlan.destination as string) || '',
    days: (p.days as number) || itinerary.length || 3,
    budget: Number(tripOrPlan.budget ?? breakdown.total ?? 0),
    travelers: (p.travelers as number) || (tripOrPlan.travelers as number) || 1,
    status: (tripOrPlan.status as Trip['status']) || 'planned',
    itinerary,
    attractions: (p.attractions as Trip['attractions']) || [],
    restaurants: (p.restaurants as Trip['restaurants']) || [],
    hotels: (p.hotels as Trip['hotels']) || [],
    nearby: (p.nearby_places as Trip['nearby']) || [],
    budget_breakdown: {
      accommodation: breakdown.hotel ?? 0,
      food: breakdown.food ?? 0,
      transport: breakdown.transport ?? 0,
      activities: breakdown.activities ?? 0,
      miscellaneous: (breakdown.shopping ?? 0) + (breakdown.emergency ?? 0),
      total: breakdown.total ?? 0,
      currency: 'INR',
    },
    tips: (p.travel_tips as string[]) || [],
    packing_list: (p.packing_checklist as string[]) || [],
    transport: [String(p.best_transport || '')].filter(Boolean),
    safety: (p.safety_advice as string[]) || [],
    created_at: (tripOrPlan.created_at as string) || new Date().toISOString(),
    ai_summary: p.ai_summary as string | undefined,
  } as Trip
}

export default tripService
