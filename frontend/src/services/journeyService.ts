import api from './api'
import type { JourneyData } from '../types'

const mockJourney: JourneyData = {
  trips: [
    {
      id: 1,
      title: 'Bali Escape',
      destination: 'Bali',
      days: 7,
      budget: 1800,
      status: 'completed',
      cover_image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
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
      cover_image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
      created_at: '2026-03-01',
    },
    {
      id: 3,
      title: 'Iceland Ring',
      destination: 'Reykjavik',
      days: 8,
      budget: 3200,
      status: 'ongoing',
      cover_image: 'https://images.unsplash.com/photo-1504829857797-ddff29ac2005?w=800&q=80',
      total_expense: 1100,
      created_at: '2026-06-20',
    },
  ],
  total_expenses: 2750,
  achievements: [
    { id: 1, name: 'First Flight', description: 'Completed your first trip', icon: '✈️', earned_at: '2024-05-01' },
    { id: 2, name: 'Summit Seeker', description: 'Visited 3 mountain destinations', icon: '⛰️', earned_at: '2025-08-12' },
    { id: 3, name: 'Globe Trotter', description: 'Visited 5 countries', icon: '🌍', earned_at: '2025-12-01' },
  ],
  photos: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600&q=80',
  ],
  timeline: [
    {
      id: 1,
      date: '2026-06-20',
      title: 'Iceland Ring started',
      description: 'Touchdown in Reykjavik — adventure begins.',
      type: 'trip',
    },
    {
      id: 2,
      date: '2025-12-01',
      title: 'Globe Trotter unlocked',
      description: 'You visited your 5th country.',
      type: 'badge',
    },
    {
      id: 3,
      date: '2025-11-18',
      title: 'Bali trip expense logged',
      description: '$1,650 total — under budget by $150.',
      type: 'expense',
    },
    {
      id: 4,
      date: '2025-11-15',
      title: 'Photos added',
      description: '12 memories from Ubud and Uluwatu.',
      type: 'photo',
    },
  ],
}

export const journeyService = {
  async getJourney(): Promise<JourneyData> {
    try {
      const { data } = await api.get('/journey/')
      const trips = data.timeline || data.trips || []
      return {
        trips,
        total_expenses: data.stats?.total_spent ?? data.total_expenses ?? 0,
        achievements: (data.achievements || []).map((a: Record<string, unknown>, i: number) => ({
          id: i + 1,
          name: (a.badge__name as string) || (a.name as string) || 'Badge',
          description: (a.badge__description as string) || (a.description as string) || '',
          icon: (a.badge__icon as string) || (a.icon as string) || '🏅',
          earned_at: a.earned_at as string,
        })),
        photos: data.photos || mockJourney.photos,
        timeline: trips.map((t: Record<string, unknown>) => ({
          id: t.id as number,
          date: (t.created_at as string) || '',
          title: (t.title as string) || 'Trip',
          description: `${t.destination || ''} · ${t.status || 'planned'}`,
          type: 'trip' as const,
        })),
        stats: data.stats,
        visited_locations: data.visited_locations || [],
      } as JourneyData
    } catch {
      return mockJourney
    }
  },
}

export default journeyService
