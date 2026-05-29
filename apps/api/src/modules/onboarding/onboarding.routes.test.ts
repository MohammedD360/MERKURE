import { describe, expect, it, vi, beforeEach } from 'vitest'
import { buildApp } from '../../app.js'

// Mock Prisma so onboarding routes don't require a live DB in unit tests
vi.mock('../../infrastructure/database/client.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue({
        onboarded: false,
        profile: null,
      }),
      update: vi.fn().mockResolvedValue({ id: 'demo_user_merkure', onboarded: true }),
    },
    traderProfile: {
      upsert: vi.fn().mockResolvedValue({ userId: 'demo_user_merkure' }),
    },
    $transaction: vi.fn().mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops)),
  },
}))

describe('GET /api/v1/onboarding/status', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns onboarded status for demo user', async () => {
    const app = buildApp()

    const res = await app.inject({ method: 'GET', url: '/api/v1/onboarding/status' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body).toHaveProperty('onboarded')
    await app.close()
  })
})

describe('POST /api/v1/onboarding/profile', () => {
  beforeEach(() => vi.clearAllMocks())

  it('accepts a valid profile payload', async () => {
    const app = buildApp()

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/onboarding/profile',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({
        style: 'DAYTRADER',
        riskAppetite: 'MEDIUM',
        markets: ['Forex', 'Indices'],
        experienceYears: 3,
      }),
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ ok: true })
    await app.close()
  })

  it('rejects an invalid style enum value', async () => {
    const app = buildApp()

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/onboarding/profile',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({ style: 'INVALID_STYLE' }),
    })

    expect(res.statusCode).toBe(400)
    await app.close()
  })

  it('rejects experienceYears > 50', async () => {
    const app = buildApp()

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/onboarding/profile',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({ experienceYears: 99 }),
    })

    expect(res.statusCode).toBe(400)
    await app.close()
  })
})

describe('POST /api/v1/onboarding/complete', () => {
  it('marks the user as onboarded', async () => {
    const app = buildApp()

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/onboarding/complete',
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ ok: true })
    await app.close()
  })
})
