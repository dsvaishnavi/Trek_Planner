import api from './api'
import type { WeatherData } from '../types'

function mockWeather(city: string): WeatherData {
  const conditions = ['Sunny', 'Partly Cloudy', 'Light Rain', 'Clear', 'Cloudy']
  return {
    city,
    country: 'Demo',
    current_temp: 22,
    condition: 'Partly Cloudy',
    icon: '⛅',
    humidity: 58,
    wind_kmh: 14,
    feels_like: 21,
    forecast: Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() + i)
      return {
        date: d.toISOString().slice(0, 10),
        temp_max: 20 + ((i * 2) % 7),
        temp_min: 12 + (i % 5),
        condition: conditions[i % conditions.length],
        icon: ['☀️', '⛅', '🌧️', '🌙', '☁️'][i % 5],
        humidity: 50 + i * 3,
        wind_kmh: 10 + i,
        precipitation_chance: i % 3 === 0 ? 40 : 10,
      }
    }),
    ai_suggestions: [
      `Pack layers for ${city} — mornings can be cool.`,
      'Best outdoor activities: mid-morning before afternoon clouds.',
      'Carry a compact umbrella on day 3 of your forecast.',
      'Golden hour photos look best around 18:30 this week.',
    ],
  }
}

export const weatherService = {
  async getWeather(city: string): Promise<WeatherData> {
    try {
      const { data } = await api.get('/weather/', { params: { city } })
      // Normalize backend OpenWeather/mock payload into UI WeatherData
      if (data.current_temp != null) return data as WeatherData
      return {
        city: data.city || city,
        current_temp: data.temperature ?? 25,
        condition: data.description || 'Clear',
        icon: (data.rain_chance ?? 0) > 40 ? '🌧️' : (data.temperature ?? 25) > 30 ? '☀️' : '⛅',
        humidity: data.humidity ?? 50,
        wind_kmh: Math.round((data.wind_speed ?? 3) * 3.6),
        feels_like: data.feels_like,
        forecast: [
          {
            date: new Date().toISOString().slice(0, 10),
            temp_max: Math.round((data.temperature ?? 25) + 2),
            temp_min: Math.round((data.temperature ?? 25) - 4),
            condition: data.description || 'Clear',
            icon: '⛅',
            humidity: data.humidity,
            wind_kmh: Math.round((data.wind_speed ?? 3) * 3.6),
            precipitation_chance: data.rain_chance,
          },
        ],
        ai_suggestions: data.suggestions || [],
        sunrise: data.sunrise,
        sunset: data.sunset,
        uv_index: data.uv_index,
        air_quality: data.air_quality,
      } as WeatherData
    } catch {
      await new Promise((r) => setTimeout(r, 500))
      return mockWeather(city || 'Mumbai')
    }
  },
}

export default weatherService
