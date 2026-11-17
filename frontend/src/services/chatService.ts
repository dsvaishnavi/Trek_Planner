import api from './api'
import type { ChatMessage, ChatSession } from '../types'

const mockSessions: ChatSession[] = [
  { id: 1, title: 'Best time for Patagonia', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 2, title: 'Family trip to Bali', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, title: 'Budget Europe tips', created_at: new Date().toISOString() },
]

const mockSuggestions = [
  'Plan a 5-day adventure in Iceland under $2500',
  'What should I pack for Kyoto in spring?',
  'Hidden gems near Santorini',
  'Compare Bali vs Phuket for a beach week',
]

function mockReply(prompt: string): string {
  return `Great question! Based on your ask — **"${prompt.slice(0, 80)}${prompt.length > 80 ? '…' : ''}"** — here's a TrekVerse AI take:

### Quick plan
1. **Focus on 2–3 anchors** so you don't overpack the itinerary.
2. **Book stays mid-week** for better rates in peak months.
3. **Mix icons with local spots** — one famous landmark, one neighborhood café, one viewpoint.

### Suggested day shape
- **Morning:** Outdoor / light walking while it's cooler  
- **Afternoon:** Museum, market, or rest  
- **Evening:** Sunset + dinner reservation  

Want me to tailor this by budget, season, or travel style?`
}

export const chatService = {
  async getSessions(): Promise<ChatSession[]> {
    try {
      const { data } = await api.get('/chat/sessions/')
      return Array.isArray(data) ? data : data.results ?? mockSessions
    } catch {
      return mockSessions
    }
  },

  async createSession(title = 'New chat'): Promise<ChatSession> {
    try {
      const { data } = await api.post('/chat/sessions/', { title })
      return data
    } catch {
      return { id: Date.now(), title, created_at: new Date().toISOString() }
    }
  },

  async getMessages(sessionId: string | number): Promise<ChatMessage[]> {
    try {
      // Messages are embedded on the session detail payload
      const { data } = await api.get(`/chat/sessions/${sessionId}/`)
      const msgs = data.messages ?? []
      return msgs.map((m: ChatMessage) => ({ ...m, session_id: sessionId }))
    } catch {
      return [
        {
          id: 1,
          role: 'assistant',
          content: "Hi! I'm your TrekVerse travel companion. Ask me anything about destinations, budgets, packing, or itineraries.",
          session_id: sessionId,
          created_at: new Date().toISOString(),
        },
      ]
    }
  },

  async sendMessage(sessionId: string | number, content: string): Promise<ChatMessage> {
    try {
      const { data } = await api.post(`/chat/sessions/${sessionId}/messages/`, { content })
      const msg = data.message ?? data.assistant_message ?? data
      return { ...msg, session_id: sessionId }
    } catch {
      await new Promise((r) => setTimeout(r, 600))
      return {
        id: Date.now(),
        role: 'assistant',
        content: mockReply(content),
        session_id: sessionId,
        created_at: new Date().toISOString(),
      }
    }
  },

  async getSuggestions(): Promise<string[]> {
    try {
      const { data } = await api.get('/chat/suggestions/')
      return Array.isArray(data) ? data : data.suggestions ?? mockSuggestions
    } catch {
      return mockSuggestions
    }
  },

  /** Simulate streaming by yielding chunks of the reply */
  async *streamReply(sessionId: string | number, content: string): AsyncGenerator<string> {
    let full: string
    try {
      const msg = await this.sendMessage(sessionId, content)
      full = msg.content
    } catch {
      full = mockReply(content)
    }
    const words = full.split(/(\s+)/)
    for (const w of words) {
      yield w
      await new Promise((r) => setTimeout(r, 18 + Math.random() * 25))
    }
  },
}

export default chatService
