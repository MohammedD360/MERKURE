const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function getClerkToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as unknown as Record<string, unknown>).__clerkToken as string | undefined
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getClerkToken()
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
}
