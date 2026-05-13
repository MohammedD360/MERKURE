import { describe, expect, it } from 'vitest'
import { buildApp } from '../app.js'

describe('authenticate middleware — demo mode', () => {
  it('passes through with demo user on any protected route', async () => {
    const app = buildApp()

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/accounts',
    })

    // Demo mode injects a valid user — route should not return 401
    expect(res.statusCode).not.toBe(401)
    await app.close()
  })

  it('health endpoint is accessible without auth', async () => {
    const app = buildApp()

    const res = await app.inject({ method: 'GET', url: '/health' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ status: 'ok', service: 'merkure-api' })
    await app.close()
  })

  it('GET /api/v1/me returns demo user in demo mode', async () => {
    const app = buildApp()

    const res = await app.inject({ method: 'GET', url: '/api/v1/me' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body).toMatchObject({
      id: 'demo_user_merkure',
      email: 'demo@merkure.app',
      authMode: 'demo',
    })
    await app.close()
  })
})
