'use client'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function getToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  try {
    const { useAuth } = await import('@clerk/nextjs')
    void useAuth
  } catch { /* demo mode */ }
  return null
}

async function apiFetch(path: string, init?: RequestInit) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  if (typeof window !== 'undefined') {
    const token = (window as unknown as Record<string, unknown>).__clerkToken as string | undefined
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(`${API}${path}`, { ...init, headers: { ...headers, ...init?.headers } })
}

export interface ProfilePayload {
  style?: 'SCALPER' | 'DAYTRADER' | 'SWINGTRADER' | 'INVESTOR'
  riskAppetite?: 'LOW' | 'MEDIUM' | 'HIGH' | 'AGGRESSIVE'
  markets?: string[]
  experienceYears?: number
  timezone?: string
  currency?: string
  riskPerTrade?: number
}

export interface BrokerPayload {
  brokerType: string
  accountType: string
  accountId: string
  label: string
  credentials?: Record<string, string>
}

export async function saveProfile(payload: ProfilePayload) {
  const res = await apiFetch('/api/v1/onboarding/profile', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('save_profile_failed')
}

export async function connectBroker(payload: BrokerPayload) {
  const res = await apiFetch('/api/v1/accounts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('connect_broker_failed')
}

export async function completeOnboarding() {
  const res = await apiFetch('/api/v1/onboarding/complete', { method: 'POST' })
  if (!res.ok) throw new Error('complete_failed')
}
