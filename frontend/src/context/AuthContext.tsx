import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { LoginPayload, RegisterPayload, User } from '../types'
import authService from '../services/authService'

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<User>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function init() {
      if (!authService.isAuthenticated()) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        const profile = await authService.getProfile()
        if (!cancelled) setUser(profile)
      } catch {
        if (!cancelled) setUser(authService.getStoredUser())
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void init()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const { user: u } = await authService.login(payload)
    setUser(u)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user: u } = await authService.register(payload)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    const updated = await authService.updateProfile(updates)
    setUser(updated)
    return updated
  }, [])

  const refreshProfile = useCallback(async () => {
    const profile = await authService.getProfile()
    setUser(profile)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
      refreshProfile,
    }),
    [user, loading, login, register, logout, updateProfile, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
