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

    // Ni 401 ni 404 : /health n'exige pas d'authentification. Le code varie
    // selon la disponibilité réelle de Postgres/Redis dans l'environnement de
    // test (200 = ok, 503 = degraded), les deux sont des réponses valides ici.
    expect([200, 503]).toContain(res.statusCode)
    expect(res.json()).toMatchObject({ service: 'merkure-api' })
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
