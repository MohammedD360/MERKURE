import type { FastifyInstance } from 'fastify'
import type { WebSocket } from '@fastify/websocket'
import { verifyToken } from '@clerk/backend'
import { env } from '../config/env.js'
import { getDemoUser } from '../modules/auth/demo-user.js'

export type WsEventType =
  | 'connected'
  | 'sync:complete'
  | 'sync:error'
  | 'alert:triggered'
  | 'position:update'
  | 'position:close'
  | 'bot:decision'
  | 'bot:circuit_breaker'

export type WsEvent = {
  type: WsEventType
  data: unknown
}

// userId → active WebSocket connection
// One connection per user (last one wins on reconnect)
const connections = new Map<string, WebSocket>()

export function wsNotify(userId: string, event: WsEvent): void {
  const ws = connections.get(userId)
  if (ws?.readyState === 1 /* OPEN */) {
    ws.send(JSON.stringify(event))
  }
}

export async function registerWsHandler(app: FastifyInstance): Promise<void> {
  app.get('/ws', { websocket: true }, async (socket, request) => {
    // Auth via query param token (Bearer header not available on WS upgrade)
    const token = (request.query as Record<string, string | undefined>)['token']
    let userId: string

    if (env.AUTH_MODE === 'demo') {
      userId = getDemoUser().id
    } else if (token && env.CLERK_SECRET_KEY) {
      try {
        const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY })
        userId = payload.sub
      } catch {
        socket.close(1008, 'Unauthorized')
        return
      }
    } else {
      socket.close(1008, 'Unauthorized')
      return
    }

    connections.set(userId, socket)
    socket.send(JSON.stringify({ type: 'connected', data: { userId } } satisfies WsEvent))

    socket.on('close', () => connections.delete(userId))
  })
}
