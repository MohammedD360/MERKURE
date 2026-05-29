import { describe, expect, it } from 'vitest'
import { buildApp } from '../../app.js'

// STRIPE_WEBHOOK_SECRET is set in vitest.config.ts — tests validate request validation logic

describe('POST /api/webhooks/stripe', () => {
  it('returns 400 when stripe-signature header is missing', async () => {
    const app = buildApp()

    const res = await app.inject({
      method: 'POST',
      url: '/api/webhooks/stripe',
      headers: { 'content-type': 'application/json' },
      payload: '{}',
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().error).toBe('missing_signature')
    await app.close()
  })

  it('returns 400 when stripe-signature is invalid', async () => {
    const app = buildApp()

    const res = await app.inject({
      method: 'POST',
      url: '/api/webhooks/stripe',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 't=1234,v1=invalidsig',
      },
      payload: '{}',
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().error).toBe('invalid_signature')
    await app.close()
  })
})
