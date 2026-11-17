import api from './api'
import type { RecommendationRequest, RecommendationResult } from '../types'
import { mockDestinations } from './tripService'

const mockResult: RecommendationResult = {
  destinations: mockDestinations.slice(0, 4),
  hotels: [
    {
      id: 1,
      name: 'Cliffside Retreat',
      location: 'Santorini, Greece',
      rating: 4.9,
      price_per_night: 280,
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
      amenities: ['Infinity pool', 'Breakfast', 'Spa'],
    },
    {
      id: 2,
      name: 'Bamboo Grove Villa',
      location: 'Ubud, Bali',
      rating: 4.7,
      price_per_night: 145,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      amenities: ['Private pool', 'Yoga deck'],
    },
  ],
  activities: [
    { name: 'Sunrise hike', description: 'Guided trail with panoramic views', rating: 4.8, category: 'Adventure' },
    { name: 'Cooking class', description: 'Learn regional recipes with a local chef', rating: 4.9, category: 'Food' },
    { name: 'Kayak sunset tour', description: 'Paddle along the coastline at dusk', rating: 4.6, category: 'Water' },
  ],
  hidden_gems: [
    { name: 'Secret waterfall trail', description: 'Low-crowd path 40 min from town', rating: 4.7 },
    { name: 'Family-run spice farm', description: 'Tour + tasting away from tourist hubs', rating: 4.8 },
  ],
}

export const recommendationService = {
  async getRecommendations(req: RecommendationRequest): Promise<RecommendationResult> {
    try {
      const payload = {
        interests: req.preferences || [],
        travel_style: req.travel_style || '',
        budget: req.budget != null ? String(req.budget) : '',
        preferred_weather: req.season || '',
      }
      const { data } = await api.post('/recommendations/', payload)
      return {
        destinations: (data.destinations || []).map((d: Record<string, unknown>, i: number) => ({
          id: i + 1,
          name: d.name as string,
          country: 'India',
          description: `${d.category || 'Travel'} · score ${d.score ?? ''}`,
          image: mockDestinations[i % mockDestinations.length].image,
          rating: 4.5 + ((d.score as number) || 0) * 0.1,
          tags: String(d.tags || '')
            .split(/\s+/)
            .filter(Boolean),
          category: d.category as string,
        })),
        hotels: (data.hotels || []).map((h: Record<string, unknown>, i: number) => ({
          id: i + 1,
          name: h.name as string,
          location: (h.destination as string) || '',
          rating: (h.rating as number) || 4.5,
          price_per_night: (h.price as number) || 3000,
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          amenities: (h.amenities as string[]) || [],
        })),
        activities: (data.activities || data.treks || []).map((a: Record<string, unknown>) => ({
          name: a.name as string,
          description: (a.type as string) || (a.difficulty as string) || '',
          category: (a.type as string) || 'activity',
          rating: 4.6,
        })),
        hidden_gems: (data.hidden_gems || []).map((g: Record<string, unknown>) => ({
          name: g.name as string,
          description: (g.why as string) || (g.region as string) || '',
          rating: 4.7,
        })),
      }
    } catch {
      await new Promise((r) => setTimeout(r, 900))
      const filtered = mockDestinations.filter((d) =>
        req.preferences.length === 0
          ? true
          : req.preferences.some(
              (p) =>
                d.category?.toLowerCase().includes(p.toLowerCase()) ||
                d.tags?.some((t) => t.toLowerCase().includes(p.toLowerCase())),
            ),
      )
      return {
        ...mockResult,
        destinations: (filtered.length ? filtered : mockResult.destinations).slice(0, 4),
      }
    }
  },
}

export default recommendationService
