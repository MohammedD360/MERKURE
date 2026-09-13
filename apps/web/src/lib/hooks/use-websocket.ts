'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { resolveAuthToken } from '@/lib/api-client'

const WS_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001')
  .replace(/^http/, 'ws') + '/ws'

type WsEvent =
  | { type: 'connected';      data: { userId: string } }
  | { type: 'sync:complete';  data: { accountId: string; upsertCount: number } }
  | { type: 'sync:error';     data: { accountId: string; error: string } }
  | { type: 'alert:triggered'; data: unknown }

export function useWebSocket() {
  const queryClient = useQueryClient()
  const wsRef       = useRef<WebSocket | null>(null)
  const retryRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attemptRef  = useRef(0)

  useEffect(() => {
    let mounted = true

    async function connect() {
      if (!mounted) return

      const token = await resolveAuthToken()
      if (!mounted) return
      const url = token ? `${WS_URL}?token=${token}` : WS_URL
      const ws  = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => { attemptRef.current = 0 }

      ws.onmessage = (ev) => {
        try {
          const event = JSON.parse(ev.data as string) as WsEvent

          if (event.type === 'sync:complete') {
            // Invalide toutes les queries qui dépendent des données broker
            void queryClient.invalidateQueries({ queryKey: ['trades'] })
            void queryClient.invalidateQueries({ queryKey: ['kpis'] })
            void queryClient.invalidateQueries({ queryKey: ['accounts'] })
          }

          if (event.type === 'alert:triggered') {
            void queryClient.invalidateQueries({ queryKey: ['alerts'] })
          }
        } catch { /* ignore parse errors */ }
      }

      ws.onclose = () => {
        if (mounted) {
          // Backoff exponentiel avec jitter (1s, 2s, 4s... plafonné à 30s) : évite
          // qu'un incident API fasse retenter toutes les connexions ouvertes en
          // boucle serrée pendant que le service redémarre.
          const attempt = attemptRef.current++
          const base    = Math.min(30_000, 1_000 * 2 ** attempt)
          const jitter  = Math.random() * base * 0.3
          retryRef.current = setTimeout(() => { void connect() }, base + jitter)
        }
      }
    }

    void connect()

    return () => {
      mounted = false
      if (retryRef.current) clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [queryClient])
}
