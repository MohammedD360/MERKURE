import { describe, expect, it } from 'vitest'
import { buildApp } from '../../app.js'

// CLERK_WEBHOOK_SECRET is set in vitest.config.ts — tests validate request validation logic

describe('POST /api/webhooks/clerk', () => {
  it('returns 400 when svix headers are missing', async () => {
    const app = buildApp()

    const res = await app.inject({
      method: 'POST',
      url: '/api/webhooks/clerk',
      headers: { 'content-type': 'application/json' },
      payload: '{}',
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().error).toBe('missing_svix_headers')
    await app.close()
  })

  it('returns 400 when svix signature is invalid', async () => {
    const app = buildApp()

    const res = await app.inject({
      method: 'POST',
      url: '/api/webhooks/clerk',
      headers: {
        'content-type': 'application/json',
        'svix-id': 'msg_test',
        'svix-timestamp': String(Math.floor(Date.now() / 1000)),
        'svix-signature': 'v1,invalidsignature',
      },
      payload: JSON.stringify({ type: 'user.created', data: { id: 'user_test' } }),
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().error).toBe('invalid_signature')
    await app.close()
  })
})
