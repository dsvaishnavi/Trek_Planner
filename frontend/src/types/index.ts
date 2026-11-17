export interface User {
  id: number | string
  email: string
  username: string
  first_name?: string
  last_name?: string
  avatar?: string | null
  bio?: string
  phone?: string
  location?: string
  travel_style?: string
  preferences?: string[]
  visited_cities?: string[]
  wishlist?: string[]
  badges?: Badge[]
  stats?: UserStats
  created_at?: string
}

export interface UserStats {
  trips_completed: number
  cities_visited: number
  total_distance_km: number
  points: number
  rank?: number
}

export interface Badge {
  id: string | number
  name: string
  description: string
  icon: string
  earned_at?: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  username: string
  password: string
  password_confirm?: string
  first_name?: string
  last_name?: string
}

export type TravelType = 'Adventure' | 'Beach' | 'Nature' | 'Historical' | 'Mountains'

export interface Destination {
  id: string | number
  name: string
  country: string
  city?: string
  description: string
  image: string
  rating: number
  price_range?: string
  tags?: string[]
  lat?: number
  lng?: number
  category?: TravelType | string
}

export interface TripDayActivity {
  time: 'morning' | 'afternoon' | 'evening'
  title: string
  description: string
  location?: string
  duration?: string
  cost?: number
}

export interface TripDay {
  day: number
  title: string
  activities: TripDayActivity[]
}

export interface Trip {
  id: string | number
  title: string
  destination: string
  start_date?: string
  end_date?: string
  days: number
  budget: number
  travelers?: number
  travel_type?: TravelType | string
  status?: 'planned' | 'ongoing' | 'completed' | 'draft'
  cover_image?: string
  itinerary?: TripDay[]
  attractions?: PlaceItem[]
  restaurants?: PlaceItem[]
  hotels?: Hotel[]
  nearby?: PlaceItem[]
  budget_breakdown?: BudgetBreakdown
  tips?: string[]
  packing_list?: string[]
  transport?: string[]
  safety?: string[]
  total_expense?: number
  photos?: string[]
  created_at?: string
  ai_summary?: string
}

export interface PlaceItem {
  id?: string | number
  name: string
  description?: string
  rating?: number
  image?: string
  category?: string
  distance_km?: number
  price_level?: string
  lat?: number
  lng?: number
}

export interface ChatSession {
  id: string | number
  title: string
  created_at: string
  updated_at?: string
}

export interface ChatMessage {
  id: string | number
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at?: string
  session_id?: string | number
}

export interface BudgetBreakdown {
  accommodation: number
  food: number
  transport: number
  activities: number
  miscellaneous: number
  total: number
  currency?: string
  tips?: string[]
}

export interface BudgetPredictPayload {
  destination: string
  days: number
  travelers: number
  travel_style?: string
  hotel_category?: string
}

export interface WeatherDay {
  date: string
  temp_max: number
  temp_min: number
  condition: string
  icon: string
  humidity?: number
  wind_kmh?: number
  precipitation_chance?: number
}

export interface WeatherData {
  city: string
  country?: string
  current_temp: number
  condition: string
  icon: string
  humidity: number
  wind_kmh: number
  feels_like?: number
  forecast: WeatherDay[]
  ai_suggestions?: string[]
  sunrise?: string
  sunset?: string
  uv_index?: number
  air_quality?: { aqi?: number; label?: string }
}

export interface Hotel {
  id: string | number
  name: string
  location: string
  city?: string
  rating: number
  price_per_night: number
  currency?: string
  image: string
  amenities?: string[]
  description?: string
  category?: string
  lat?: number
  lng?: number
  booking_url?: string
}

export interface MapPlace {
  id: string | number
  name: string
  type: string
  lat: number
  lng: number
  rating?: number
  distance_km?: number
  address?: string
  image?: string
}

export interface Notification {
  id: string | number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'trip' | 'system'
  read: boolean
  created_at: string
  link?: string
}

export interface JourneyData {
  trips: Trip[]
  total_expenses: number
  achievements: Badge[]
  photos: string[]
  timeline: JourneyTimelineItem[]
}

export interface JourneyTimelineItem {
  id: string | number
  date: string
  title: string
  description: string
  type: 'trip' | 'badge' | 'expense' | 'photo'
  meta?: Record<string, unknown>
}

export interface LeaderboardEntry {
  rank: number
  user_id: string | number
  username: string
  avatar?: string | null
  points: number
  trips_completed: number
  badge_count: number
}

export interface PlannerRequest {
  destination: string
  days: number
  budget: number
  travelers: number
  starting_location?: string
  hotel_category?: string
  transportation?: string
  interests?: string[]
}

export interface RecommendationRequest {
  preferences: string[]
  budget?: number
  travel_style?: string
  season?: string
  travelers?: number
}

export interface RecommendationResult {
  destinations: Destination[]
  hotels: Hotel[]
  activities: PlaceItem[]
  hidden_gems: PlaceItem[]
}

export interface ApiError {
  detail?: string
  message?: string
  [key: string]: unknown
}
