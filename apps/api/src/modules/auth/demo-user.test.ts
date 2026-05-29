import { describe, expect, it } from 'vitest'

import { buildApp } from '../../app.js'
import { getDemoUser } from './demo-user.js'

describe('demo auth', () => {
  it('exposes the local MERKURE demo user', () => {
    expect(getDemoUser()).toMatchObject({
      id: 'demo_user_merkure',
      email: 'demo@merkure.app',
      authMode: 'demo',
      plan: 'FREE',
    })
  })

  it('returns the demo user from /api/v1/me', async () => {
    const app = buildApp()

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/me',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      id: 'demo_user_merkure',
      authMode: 'demo',
    })

    await app.close()
  })
})
