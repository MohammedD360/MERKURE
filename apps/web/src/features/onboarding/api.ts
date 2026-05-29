'use client'

async function apiFetch(path: string, init?: RequestInit) {
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('merkure_token')
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

export async function connectBroker(payload: BrokerPayload): Promise<{ id: string }> {
  const res = await apiFetch('/api/v1/accounts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('connect_broker_failed')
  return res.json() as Promise<{ id: string }>
}

export async function completeOnboarding() {
  const res = await apiFetch('/api/v1/onboarding/complete', { method: 'POST', body: '{}' })
  if (!res.ok) throw new Error('complete_failed')
}
