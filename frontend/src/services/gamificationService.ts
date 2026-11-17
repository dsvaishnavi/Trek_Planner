import api from './api'
import type { Badge, LeaderboardEntry } from '../types'

const mockBadges: Badge[] = [
  { id: 1, name: 'First Flight', description: 'Complete your first trip', icon: '✈️' },
  { id: 2, name: 'Summit Seeker', description: 'Visit 3 mountain destinations', icon: '⛰️' },
  { id: 3, name: 'Coast Collector', description: 'Visit 3 beach destinations', icon: '🏖️' },
  { id: 4, name: 'Budget Boss', description: 'Stay under budget twice', icon: '💰' },
  { id: 5, name: 'Globe Trotter', description: 'Visit 5 countries', icon: '🌍' },
  { id: 6, name: 'Night Owl', description: 'Log 3 evening adventures', icon: '🌙' },
]

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, user_id: 10, username: 'nomadnova', points: 9120, trips_completed: 24, badge_count: 12, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { rank: 2, user_id: 11, username: 'peakwalker', points: 8450, trips_completed: 21, badge_count: 10, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
  { rank: 3, user_id: 12, username: 'coastalcat', points: 7800, trips_completed: 19, badge_count: 9 },
  { rank: 4, user_id: 13, username: 'templetrail', points: 6540, trips_completed: 16, badge_count: 8 },
  { rank: 5, user_id: 14, username: 'desertfox', points: 5900, trips_completed: 14, badge_count: 7 },
  { rank: 6, user_id: 15, username: 'aurorahunter', points: 5120, trips_completed: 13, badge_count: 6 },
  { rank: 7, user_id: 1, username: 'trekexplorer', points: 4250, trips_completed: 12, badge_count: 5, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { rank: 8, user_id: 16, username: 'mapmaven', points: 3980, trips_completed: 11, badge_count: 5 },
  { rank: 9, user_id: 17, username: 'suitcasepro', points: 3410, trips_completed: 9, badge_count: 4 },
  { rank: 10, user_id: 18, username: 'wanderweek', points: 2900, trips_completed: 8, badge_count: 3 },
]

export const gamificationService = {
  async getBadges(): Promise<Badge[]> {
    try {
      const { data } = await api.get('/gamification/badges/')
      return Array.isArray(data) ? data : data.results ?? mockBadges
    } catch {
      return mockBadges
    }
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const { data } = await api.get('/gamification/leaderboard/')
      const rows = Array.isArray(data) ? data : data.results ?? []
      return rows.map((r: Record<string, unknown>) => ({
        rank: r.rank as number,
        user_id: (r.rank as number) || 0,
        username: r.username as string,
        points: (r.xp_points as number) ?? (r.points as number) ?? 0,
        trips_completed: 0,
        badge_count: (r.travel_level as number) || 0,
      }))
    } catch {
      return mockLeaderboard
    }
  },
}

export default gamificationService
