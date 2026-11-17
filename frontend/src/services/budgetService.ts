import api from './api'
import type { BudgetBreakdown, BudgetPredictPayload } from '../types'

export const budgetService = {
  async predict(payload: BudgetPredictPayload): Promise<BudgetBreakdown> {
    try {
      const { data } = await api.post('/budget/predict/', {
        destination: payload.destination,
        days: payload.days,
        travelers: payload.travelers,
        hotel_category: payload.hotel_category || 'standard',
        transport: 'train',
        season: 'summer',
        activities: 3,
      })
      return {
        accommodation: data.hotel ?? data.accommodation ?? 0,
        food: data.food ?? 0,
        transport: data.transport ?? 0,
        activities: data.activities ?? 0,
        miscellaneous: (data.shopping ?? 0) + (data.emergency ?? 0),
        total: data.total ?? 0,
        currency: data.currency || 'INR',
        tips: [
          `Model: ${data.model || 'RandomForestRegressor'}`,
          'Emergency buffer (~10%) is included in miscellaneous.',
          'Adjust hotel category to see cost swings.',
        ],
      }
    } catch {
      await new Promise((r) => setTimeout(r, 700))
      const base = 120 * payload.days * payload.travelers
      const styleMult =
        payload.travel_style === 'luxury' ? 2.2 : payload.travel_style === 'budget' ? 0.7 : 1.1
      const hotelMult =
        payload.hotel_category === '5-star' ? 1.8 : payload.hotel_category === 'hostel' ? 0.55 : 1
      const total = Math.round(base * styleMult * hotelMult)
      return {
        accommodation: Math.round(total * 0.4),
        food: Math.round(total * 0.25),
        transport: Math.round(total * 0.15),
        activities: Math.round(total * 0.12),
        miscellaneous: Math.round(total * 0.08),
        total,
        currency: 'USD',
        tips: [
          `For ${payload.destination}, mid-week flights often save 10–15%.`,
          'Book free-cancellation hotels until 7 days before departure.',
          'Set a daily cash limit for food & souvenirs.',
        ],
      }
    }
  },
}

export default budgetService
