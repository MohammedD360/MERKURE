import * as SecureStore from 'expo-secure-store'

const API = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'
const TOKEN_KEY = 'merkure_token'

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY)
  } catch {
    return null
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = await getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const method = init?.method?.toUpperCase()
  const needsBody = method === 'POST' || method === 'PUT' || method === 'PATCH'
  const body: BodyInit | null =
    init?.body != null ? (init.body as BodyInit) : needsBody ? '{}' : null

  const res = await fetch(`${API}${path}`, {
    ...init,
    ...(body !== null ? { body } : {}),
    headers: { ...headers, ...init?.headers },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${res.status} ${path}: ${text}`)
  }

  if (res.status === 204) return undefined as T
  const contentType = res.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return res.json() as Promise<T>
  }
  return undefined as T
}

export interface KpiSummary {
  totalPnl: number
  winRate: number
  profitFactor: number | null
  nbTrades: number
  maxDrawdown: number | null
  bestDay: { date: string; pnl: number } | null
  worstDay: { date: string; pnl: number } | null
}

export interface KpiSnapshot {
  date: string
  totalPnl: string | null
  winRate: string | null
  profitFactor: string | null
  nbTrades: number | null
  balance: string | null
  equity: string | null
}

export interface KpiDetailedStats {
  winTrades: number
  lossTrades: number
  bestTrade: number
  worstTrade: number
  avgWin: number
  avgLoss: number
}

export interface KpiBreakdown {
  bySymbol: Array<{
    label: string
    pct: number
    pnl: number
    nbTrades: number
    color: string
  }>
  byStrategy: Array<{
    name: string
    pnl: number
    pct: number
    positive: boolean
    nbTrades: number
  }>
}

export interface AiScore {
  score: number
  label: 'Insuffisant' | 'Moyen' | 'Bon' | 'Excellent'
  nbTrades: number
  breakdown: {
    winRate: number
    profitFactor: number
    drawdown: number
    rrMoyen: number
    discipline: number
    consistency: number
  }
}

export interface AiJournalEntry {
  id: string
  date: string
  score: number | null
  aiAnalysis: string | null
  insights: { strengths: string[]; improvements: string[]; actions: string[] } | null
  createdAt: string
}

export interface Alert {
  id: string
  type: string
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  title: string
  body: string | null
  isRead: boolean
  triggeredAt: string
}

export interface CurrentUser {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  plan: string
  authMode: string
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ token: string; user: { id: string; email: string; plan: string } }>(
        '/api/v1/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      ),
    register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
      apiFetch<{ token: string; user: { id: string; email: string; plan: string } }>(
        '/api/v1/auth/register',
        { method: 'POST', body: JSON.stringify(data) },
      ),
  },
  me: () => apiFetch<CurrentUser>('/api/v1/me'),
  kpis: {
    summary: (period = '30d', accountId?: string) => {
      const qs = new URLSearchParams({ period })
      if (accountId) qs.set('accountId', accountId)
      return apiFetch<KpiSummary>(`/api/v1/kpis/summary?${qs}`)
    },
    snapshots: (from: string, to: string, accountId?: string) => {
      const qs = new URLSearchParams({ from, to })
      if (accountId) qs.set('accountId', accountId)
      return apiFetch<KpiSnapshot[]>(`/api/v1/kpis/snapshots?${qs}`)
    },
    stats: (period = '30d', accountId?: string) => {
      const qs = new URLSearchParams({ period })
      if (accountId) qs.set('accountId', accountId)
      return apiFetch<KpiDetailedStats>(`/api/v1/kpis/stats?${qs}`)
    },
    breakdown: (period = '30d', accountId?: string) => {
      const qs = new URLSearchParams({ period })
      if (accountId) qs.set('accountId', accountId)
      return apiFetch<KpiBreakdown>(`/api/v1/kpis/breakdown?${qs}`)
    },
    aiScore: (period = '30d') => apiFetch<AiScore>(`/api/v1/kpis/ai-score?period=${period}`),
    behavioral: (period = '30d') => apiFetch<unknown>(`/api/v1/kpis/behavioral?period=${period}`),
  },
  ai: {
    journal: (limit = 10) =>
      apiFetch<{ entries: AiJournalEntry[]; total: number }>(`/api/v1/ai/journal?limit=${limit}`),
    analyze: (date?: string, context?: string) =>
      apiFetch<AiJournalEntry>('/api/v1/ai/analysis', {
        method: 'POST',
        body: JSON.stringify({ date, context }),
      }),
  },
  alerts: {
    list: (unreadOnly = false) =>
      apiFetch<{ alerts: Alert[]; total: number }>(`/api/v1/alerts?unreadOnly=${unreadOnly}`),
    markRead: (id: string) =>
      apiFetch<Alert>(`/api/v1/alerts/${id}/read`, { method: 'PATCH' }),
    markAllRead: () =>
      apiFetch<{ updated: number }>('/api/v1/alerts/read-all', { method: 'PATCH' }),
  },
  accounts: {
    list: () => apiFetch<BrokerAccount[]>('/api/v1/accounts'),
    create: (body: CreateAccountBody) =>
      apiFetch<BrokerAccount>('/api/v1/accounts', { method: 'POST', body: JSON.stringify(body) }),
  },
  trades: {
    list: (qs: string) => apiFetch<TradesResponse>(`/api/v1/trades?${qs}`),
    get: (id: string) => apiFetch<Trade>(`/api/v1/trades/${id}`),
  },
  journal: {
    calendar: (year: number, month: number) =>
      apiFetch<CalendarDay[]>(`/api/v1/journal/calendar?year=${year}&month=${month}`),
    entry: (date: string) => apiFetch<JournalEntry | null>(`/api/v1/journal/entry/${date}`),
    upsert: (date: string, data: JournalEntryPayload) =>
      apiFetch<JournalEntry>(`/api/v1/journal/entry/${date}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
  performance: {
    weekdays: (period = '30d', accountId?: string) => {
      const qs = new URLSearchParams({ period })
      if (accountId) qs.set('accountId', accountId)
      return apiFetch<WeekdayStat[]>(`/api/v1/performance/weekdays?${qs}`)
    },
    sessions: (period = '30d', accountId?: string) => {
      const qs = new URLSearchParams({ period })
      if (accountId) qs.set('accountId', accountId)
      return apiFetch<SessionStat[]>(`/api/v1/performance/sessions?${qs}`)
    },
    heatmap: (period = '30d', accountId?: string) => {
      const qs = new URLSearchParams({ period })
      if (accountId) qs.set('accountId', accountId)
      return apiFetch<HeatmapCell[]>(`/api/v1/performance/heatmap?${qs}`)
    },
    revenge: (period = '30d') => {
      const qs = new URLSearchParams({ period, threshold: '30', lotPct: '20' })
      return apiFetch<RevengeAlert[]>(`/api/v1/performance/revenge-trading?${qs}`)
    },
    advancedStats: (period = '30d', accountId?: string) => {
      const qs = new URLSearchParams({ period })
      if (accountId) qs.set('accountId', accountId)
      return apiFetch<AdvancedStats>(`/api/v1/performance/stats?${qs}`)
    },
  },
  onboarding: {
    profile: (payload: ProfilePayload) =>
      apiFetch<void>('/api/v1/onboarding/profile', { method: 'POST', body: JSON.stringify(payload) }),
    complete: () => apiFetch<void>('/api/v1/onboarding/complete', { method: 'POST', body: '{}' }),
  },
}

export type BrokerType = 'MT4' | 'MT5' | 'BINANCE' | 'IB' | 'CTRADER' | 'TRADOVATE'
export type AccountType = 'LIVE' | 'DEMO' | 'PROP_FUNDED' | 'PROP_CHALLENGE'
export type SyncStatus = 'PENDING' | 'SYNCING' | 'SUCCESS' | 'ERROR'

export interface BrokerAccount {
  id: string
  brokerType: BrokerType
  accountType: AccountType
  accountId: string
  label: string
  isActive: boolean
  syncStatus: SyncStatus
  syncError: string | null
  lastSyncAt: string | null
  createdAt: string
}

export interface CreateAccountBody {
  brokerType: BrokerType
  accountType: AccountType
  accountId: string
  label: string
  credentials?: Record<string, string>
}

export interface Trade {
  id: string
  brokerAccountId: string
  symbol: string
  direction: 'LONG' | 'SHORT'
  status: 'OPEN' | 'CLOSED'
  openTime: string
  closeTime: string | null
  openPrice: string
  closePrice: string | null
  lotSize: string
  pnl: string | null
  pnlPct: string | null
  swap: string
  commission: string
  strategyTag: string | null
  note: string | null
  createdAt: string
}

export interface TradesResponse {
  items: Trade[]
  total: number
  page: number
  limit: number
}

export interface CalendarDay {
  date: string
  hasEntry: boolean
  mood: string | null
  dailyPnl: number | null
  tradeCount: number
}

export interface JournalEntry {
  id: string
  date: string
  mood: string | null
  planBefore: string | null
  reviewAfter: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface JournalEntryPayload {
  mood?: string | null
  planBefore?: string | null
  reviewAfter?: string | null
  notes?: string | null
}

export interface WeekdayStat {
  day: number
  label: string
  nbTrades: number
  totalPnl: number
  winRate: number
}

export interface SessionStat {
  session: string
  nbTrades: number
  totalPnl: number
  winRate: number
}

export interface HeatmapCell {
  dayOfWeek: number
  hour: number
  count: number
  pnl: number
}

export interface RevengeAlert {
  id: string
  type: string
  symbol: string
  openTime: string
  minutesBetweenTrades: number
  lotSizeDelta: number
}

export interface AdvancedStats {
  winRate: number | null
  avgRR: number | null
  avgDurationMs: number | null
  profitFactor: number | null
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