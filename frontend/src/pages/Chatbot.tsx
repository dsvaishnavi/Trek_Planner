import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import { FiMenu, FiPlus, FiSend } from 'react-icons/fi'
import type { ChatMessage, ChatSession } from '../types'
import chatService from '../services/chatService'
import GradientButton from '../components/common/GradientButton'

export default function Chatbot() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeId, setActiveId] = useState<string | number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void (async () => {
      const [s, sug] = await Promise.all([
        chatService.getSessions(),
        chatService.getSuggestions(),
      ])
      setSessions(s)
      setSuggestions(sug)
      if (s[0]) {
        setActiveId(s[0].id)
        const msgs = await chatService.getMessages(s[0].id)
        setMessages(msgs)
      }
    })()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText])

  async function selectSession(id: string | number) {
    setActiveId(id)
    setSidebarOpen(false)
    const msgs = await chatService.getMessages(id)
    setMessages(msgs)
  }

  async function newChat() {
    const session = await chatService.createSession('New chat')
    setSessions((prev) => [session, ...prev])
    setActiveId(session.id)
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: "Hi! I'm your TrekVerse travel companion. Where do you want to go?",
        session_id: session.id,
      },
    ])
    setSidebarOpen(false)
  }

  async function send(content: string) {
    if (!content.trim() || streaming) return
    let sessionId = activeId
    if (!sessionId) {
      const session = await chatService.createSession(content.slice(0, 40))
      setSessions((prev) => [session, ...prev])
      sessionId = session.id
      setActiveId(sessionId)
    }

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: content.trim(),
      session_id: sessionId,
      created_at: new Date().toISOString(),
    }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setStreaming(true)
    setStreamText('')

    let full = ''
    try {
      for await (const chunk of chatService.streamReply(sessionId, content.trim())) {
        full += chunk
        setStreamText(full)
      }
    } finally {
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: full || 'Sorry, I could not generate a reply.',
          session_id: sessionId!,
          created_at: new Date().toISOString(),
        },
      ])
      setStreamText('')
      setStreaming(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void send(input)
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send(input)
    }
  }

  return (
    <div className="chat-layout position-relative" style={{ background: 'var(--tv-bg)' }}>
      <aside
        className={`chat-sidebar border-end d-flex flex-column ${sidebarOpen ? 'open' : ''}`}
        style={{ borderColor: 'var(--tv-border)', background: 'var(--tv-bg-elevated)' }}
      >
        <div className="p-3 border-bottom d-flex gap-2" style={{ borderColor: 'var(--tv-border)' }}>
          <GradientButton className="flex-fill btn-sm" onClick={() => void newChat()}>
            <FiPlus className="me-1" /> New chat
          </GradientButton>
        </div>
        <div className="flex-grow-1 overflow-auto p-2">
          {sessions.map((s) => (
            <button
              key={s.id}
              type="button"
              className="w-100 text-start border-0 rounded-3 px-3 py-2 mb-1"
              style={{
                background: activeId === s.id ? 'color-mix(in srgb, var(--tv-primary) 15%, transparent)' : 'transparent',
                color: 'var(--tv-text)',
                fontSize: '0.9rem',
              }}
              onClick={() => void selectSession(s.id)}
            >
              {s.title}
            </button>
          ))}
        </div>
      </aside>

      <div className="d-flex flex-column" style={{ minHeight: 0 }}>
        <div className="d-flex align-items-center gap-2 px-3 py-2 border-bottom d-md-none" style={{ borderColor: 'var(--tv-border)' }}>
          <button type="button" className="btn btn-sm" onClick={() => setSidebarOpen((v) => !v)}>
            <FiMenu />
          </button>
          <strong>TrekVerse Chat</strong>
        </div>

        <div className="flex-grow-1 overflow-auto px-3 px-md-4 py-4">
          <div className="mx-auto" style={{ maxWidth: 760 }}>
            {messages.map((m) => (
              <div key={m.id} className={`mb-3 d-flex ${m.role === 'user' ? 'justify-content-end' : ''}`}>
                <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  {m.role === 'assistant' ? (
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {streaming && (
              <div className="mb-3">
                <div className="chat-bubble-ai">
                  {streamText ? (
                    <ReactMarkdown>{streamText}</ReactMarkdown>
                  ) : (
                    <span className="typing-dots"><span /><span /><span /></span>
                  )}
                </div>
              </div>
            )}
            {!messages.length && !streaming && (
              <div className="text-center py-5">
                <div className="brand-logo justify-content-center mb-3">🌍 TrekVerse AI</div>
                <p className="text-muted-tv">Ask anything about travel planning</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {suggestions.length > 0 && messages.length <= 1 && (
          <div className="px-3 pb-2">
            <div className="mx-auto d-flex flex-wrap gap-2 justify-content-center" style={{ maxWidth: 760 }}>
              {suggestions.map((s) => (
                <button key={s} type="button" className="tv-chip" onClick={() => void send(s)} disabled={streaming}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="p-3 border-top" style={{ borderColor: 'var(--tv-border)' }}>
          <div className="mx-auto d-flex gap-2 align-items-end" style={{ maxWidth: 760 }}>
            <textarea
              className="tv-textarea"
              rows={1}
              placeholder="Message TrekVerse AI…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              style={{ resize: 'none', minHeight: 48 }}
            />
            <GradientButton type="submit" disabled={!input.trim() || streaming} aria-label="Send">
              <FiSend />
            </GradientButton>
          </div>
        </form>
      </div>
    </div>
  )
}
