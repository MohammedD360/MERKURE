'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

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

  useEffect(() => {
    let mounted = true

    function connect() {
      if (!mounted) return

      const token = (window as unknown as Record<string, unknown>).__clerkToken as string | undefined
      const url   = token ? `${WS_URL}?token=${token}` : WS_URL
      const ws    = new WebSocket(url)
      wsRef.current = ws

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
          // Reconnexion avec backoff exponentiel (max 30s)
          retryRef.current = setTimeout(connect, Math.min(30_000, 3_000))
        }
      }
    }

    connect()

    return () => {
      mounted = false
      if (retryRef.current) clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [queryClient])
}
