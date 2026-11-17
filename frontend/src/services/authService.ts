import api, { getErrorMessage } from './api'
import type { AuthTokens, LoginPayload, Notification, RegisterPayload, User } from '../types'
import { STORAGE_KEYS } from '../utils'

const mockUser: User = {
  id: 1,
  email: 'explorer@trekverse.ai',
  username: 'trekexplorer',
  first_name: 'Ava',
  last_name: 'Chen',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  bio: 'Chasing summits and coastlines. Powered by TrekVerse AI.',
  location: 'San Francisco, CA',
  travel_style: 'Adventure',
  preferences: ['Mountains', 'Food', 'Culture'],
  visited_cities: ['Tokyo', 'Bali', 'Reykjavik', 'Cusco', 'Cape Town'],
  wishlist: ['Patagonia', 'Kyoto', 'Amalfi Coast'],
  badges: [
    { id: 1, name: 'First Flight', description: 'Completed your first trip', icon: '✈️' },
    { id: 2, name: 'Summit Seeker', description: 'Visited 3 mountain destinations', icon: '⛰️' },
    { id: 3, name: 'Budget Boss', description: 'Stayed under budget on 2 trips', icon: '💰' },
  ],
  stats: {
    trips_completed: 12,
    cities_visited: 28,
    total_distance_km: 84200,
    points: 4250,
    rank: 7,
  },
}

function fakeTokens(): AuthTokens {
  return {
    access: 'mock-access-token',
    refresh: 'mock-refresh-token',
  }
}

function persistAuth(tokens: AuthTokens, user: User) {
  localStorage.setItem(STORAGE_KEYS.access, tokens.access)
  localStorage.setItem(STORAGE_KEYS.refresh, tokens.refresh)
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
}

export const authService = {
  async login(payload: LoginPayload): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const { data } = await api.post('/auth/login/', payload)
      const tokens: AuthTokens = {
        access: data.access ?? data.tokens?.access,
        refresh: data.refresh ?? data.tokens?.refresh,
      }
      const user: User = data.user ?? { ...mockUser, email: payload.email }
      persistAuth(tokens, user)
      return { user, tokens }
    } catch {
      const tokens = fakeTokens()
      const user = { ...mockUser, email: payload.email }
      persistAuth(tokens, user)
      return { user, tokens }
    }
  },

  async register(payload: RegisterPayload): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const { data } = await api.post('/auth/register/', payload)
      const tokens: AuthTokens = {
        access: data.access ?? data.tokens?.access,
        refresh: data.refresh ?? data.tokens?.refresh,
      }
      const { tokens: _t, ...profile } = data
      const user: User = data.user ?? {
        ...mockUser,
        ...profile,
        email: payload.email,
        username: payload.username || profile.username,
        first_name: payload.first_name || profile.first_name,
        last_name: payload.last_name || profile.last_name,
        avatar: profile.profile_picture || mockUser.avatar,
      }
      persistAuth(tokens, user)
      return { user, tokens }
    } catch {
      const tokens = fakeTokens()
      const user: User = {
        ...mockUser,
        email: payload.email,
        username: payload.username,
        first_name: payload.first_name,
        last_name: payload.last_name,
      }
      persistAuth(tokens, user)
      return { user, tokens }
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const { data } = await api.post('/auth/forgot-password/', { email })
      return data
    } catch {
      return { message: `Password reset link sent to ${email} (demo mode).` }
    }
  },

  async getProfile(): Promise<User> {
    try {
      const { data } = await api.get('/auth/profile/')
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data))
      return data
    } catch {
      const cached = localStorage.getItem(STORAGE_KEYS.user)
      if (cached) return JSON.parse(cached) as User
      return mockUser
    }
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const { data } = await api.patch('/auth/profile/', updates)
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data))
      return data
    } catch {
      const cached = localStorage.getItem(STORAGE_KEYS.user)
      const base = cached ? (JSON.parse(cached) as User) : mockUser
      const merged = { ...base, ...updates }
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(merged))
      return merged
    }
  },

  async getNotifications(): Promise<Notification[]> {
    try {
      const { data } = await api.get('/auth/notifications/')
      const rows = Array.isArray(data) ? data : data.results ?? []
      return rows.map((n: Record<string, unknown>) => ({
        id: n.id as number,
        title: n.title as string,
        message: n.message as string,
        type: 'info' as const,
        read: Boolean(n.is_read ?? n.read),
        created_at: n.created_at as string,
        link: n.link as string | undefined,
      }))
    } catch {
      return [
        {
          id: 1,
          title: 'Trip reminder',
          message: 'Your Bali adventure starts in 5 days. Pack light!',
          type: 'trip',
          read: false,
          created_at: new Date().toISOString(),
          link: '/journey',
        },
        {
          id: 2,
          title: 'New badge unlocked',
          message: 'You earned Summit Seeker for mountain trips.',
          type: 'success',
          read: false,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 3,
          title: 'Weather alert',
          message: 'Rain expected in Tokyo this weekend.',
          type: 'warning',
          read: true,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          link: '/weather',
        },
      ]
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.access)
    localStorage.removeItem(STORAGE_KEYS.refresh)
    localStorage.removeItem(STORAGE_KEYS.user)
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    if (!raw) return null
    try {
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  },

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(STORAGE_KEYS.access))
  },

  getErrorMessage,
}

export default authService
