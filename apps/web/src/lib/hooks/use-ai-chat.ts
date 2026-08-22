'use client'

import { useCallback, useRef, useState } from 'react'
import { getToken } from '@/lib/api-client'

export interface ChatMessage {
  id:      string
  role:    'user' | 'assistant'
  content: string
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

let nextId = 0
function makeId(): string {
  nextId += 1
  return `msg_${nextId}`
}

export function useAiChat() {
  const [messages, setMessages]     = useState<ChatMessage[]>([])
  const [isStreaming, setStreaming] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const send = useCallback(async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || isStreaming) return

    setError(null)
    const userMessage: ChatMessage      = { id: makeId(), role: 'user', content: trimmed }
    const assistantMessage: ChatMessage = { id: makeId(), role: 'assistant', content: '' }
    const history = [...messages, userMessage]
    setMessages([...history, assistantMessage])
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const token = getToken()
      const res = await fetch(`${API}/api/v1/ai/chat`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body:   JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => '')
        throw new Error(detail || `Erreur ${res.status}`)
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages((prev) => prev.map((m) =>
          m.id === assistantMessage.id ? { ...m, content: m.content + chunk } : m,
        ))
      }
    } catch (err) {
      if (controller.signal.aborted) return
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      setMessages((prev) => prev.map((m) =>
        m.id === assistantMessage.id && m.content === ''
          ? { ...m, content: "Désolé, une erreur s'est produite. Réessaie dans un instant." }
          : m,
      ))
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }, [messages, isStreaming])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const reset = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, send, stop, reset, isStreaming, error }
}
