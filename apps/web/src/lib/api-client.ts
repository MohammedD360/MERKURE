const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const TOKEN_KEY = 'merkure_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  document.cookie = 'merkure_session=1; path=/; max-age=604800; SameSite=Lax'
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  document.cookie = 'merkure_session=; path=/; max-age=0'
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...headers, ...init?.headers },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`${res.status} ${path}: ${body}`)
  }

  return res.json() as Promise<T>
}

// ── Types des réponses API ────────────────────────────────────────────────────

export interface KpiSummary {
  totalPnl:     number
  winRate:      number
  profitFactor: number | null
  nbTrades:     number
  maxDrawdown:  number | null
  bestDay:      { date: string; pnl: number } | null
  worstDay:     { date: string; pnl: number } | null
}

export interface KpiSnapshot {
  date:         string
  totalPnl:     string | null
  winRate:      string | null
  profitFactor: string | null
  nbTrades:     number | null
  balance:      string | null
  equity:       string | null
}

export interface KpiDetailedStats {
  winTrades:  number
  lossTrades: number
  bestTrade:  number
  worstTrade: number
  avgWin:     number
  avgLoss:    number
}

export interface KpiBreakdown {
  bySymbol: {
    label:    string
    pct:      number
    pnl:      number
    nbTrades: number
    color:    string
  }[]
  byStrategy: {
    name:     string
    pnl:      number
    pct:      number
    positive: boolean
    nbTrades: number
  }[]
}

export interface AiJournalEntry {
  id:         string
  date:       string
  score:      number | null
  aiAnalysis: string | null
  insights:   { strengths: string[]; improvements: string[]; actions: string[] } | null
  createdAt:  string
}

export interface BillingPlan {
  id: string
  name: string
  priceMonthly: number
  currency: string
  features: string[]
}

export interface Subscription {
  plan: string
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

// ── API methods ───────────────────────────────────────────────────────────────

export const api = {
  kpis: {
    summary: (period = '30d') =>
      apiFetch<KpiSummary>(`/api/v1/kpis/summary?period=${period}`),

    snapshots: (from: string, to: string, accountId?: string) => {
      const qs = new URLSearchParams({ from, to })
      if (accountId) qs.set('accountId', accountId)
      return apiFetch<KpiSnapshot[]>(`/api/v1/kpis/snapshots?${qs.toString()}`)
    },

    stats: (period = '30d', accountId?: string) => {
      const qs = new URLSearchParams({ period })
      if (accountId) qs.set('accountId', accountId)
      return apiFetch<KpiDetailedStats>(`/api/v1/kpis/stats?${qs.toString()}`)
    },

    breakdown: (period = '30d', accountId?: string) => {
      const qs = new URLSearchParams({ period })
      if (accountId) qs.set('accountId', accountId)
      return apiFetch<KpiBreakdown>(`/api/v1/kpis/breakdown?${qs.toString()}`)
    },
  },

  ai: {
    journal: (limit = 1) =>
      apiFetch<{ entries: AiJournalEntry[]; total: number }>(`/api/v1/ai/journal?limit=${limit}`),

    analyze: (date?: string, context?: string) =>
      apiFetch<AiJournalEntry>('/api/v1/ai/analysis', {
        method: 'POST',
        body: JSON.stringify({ date, context }),
      }),
  },

  billing: {
    plans: () => apiFetch<BillingPlan[]>('/api/v1/billing/plans'),
    subscription: () => apiFetch<Subscription>('/api/v1/billing/subscription'),
    checkout: (plan: string) => apiFetch<{ url: string }>('/api/v1/billing/checkout', { method: 'POST', body: JSON.stringify({ plan }) }),
    portal: () => apiFetch<{ url: string }>('/api/v1/billing/portal', { method: 'POST', body: JSON.stringify({}) }),
  },
}
