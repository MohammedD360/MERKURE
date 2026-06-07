'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Filter,
  MoreVertical,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useAccounts } from '@/lib/hooks/use-accounts'
import {
  chartPeriodToApiPeriod,
  useKpiSnapshots,
  useKpiSummary,
  type ChartPeriod,
} from '@/lib/hooks/use-kpis'
import { useTrades, type Trade } from '@/lib/hooks/use-trades'
import { cn } from '@/lib/utils'

const DASHBOARD_PERIODS = ['7J', '1M', '3M', '1Y', 'ALL'] as const satisfies readonly ChartPeriod[]
const DASHBOARD_PERIOD_KEY = 'merkure_dashboard_period'
const DASHBOARD_CURRENCY = 'EUR'

type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number]
type EquityView = 'cumul' | 'daily' | 'drawdown'

const DASHBOARD_PERIOD_LABELS: Record<DashboardPeriod, string> = {
  '7J': '7J',
  '1M': '1M',
  '3M': '3M',
  '1Y': '1Y',
  ALL: 'Tout',
}

const DEMO_EQUITY_DATA = [
  { date: '6 mai', pnl: 12, cumPnl: 12, drawdown: -8 },
  { date: '8 mai', pnl: 18, cumPnl: 30, drawdown: -12 },
  { date: '10 mai', pnl: 22, cumPnl: 52, drawdown: -18 },
  { date: '12 mai', pnl: -16, cumPnl: 36, drawdown: -35 },
  { date: '14 mai', pnl: 38, cumPnl: 74, drawdown: -20 },
  { date: '16 mai', pnl: 42, cumPnl: 116, drawdown: -16 },
  { date: '18 mai', pnl: -8, cumPnl: 108, drawdown: -28 },
  { date: '20 mai', pnl: 58, cumPnl: 166, drawdown: -12 },
  { date: '22 mai', pnl: 30, cumPnl: 196, drawdown: -18 },
  { date: '24 mai', pnl: 24, cumPnl: 220, drawdown: -24 },
  { date: '26 mai', pnl: -14, cumPnl: 206, drawdown: -42 },
  { date: '28 mai', pnl: 46, cumPnl: 252, drawdown: -17 },
  { date: '30 mai', pnl: 20, cumPnl: 272, drawdown: -22 },
  { date: '1 juin', pnl: 31, cumPnl: 303, drawdown: -11 },
  { date: '2 juin', pnl: 42, cumPnl: 345, drawdown: -7 },
  { date: '3 juin', pnl: 34.6, cumPnl: 379.6, drawdown: -5 },
]

const DEMO_TRADES = [
  { symbol: 'EURUSD', side: 'Long', session: 'London', pnl: 42, rr: '1.8', setup: 'BOS', emotion: 'Calm', tag: 'A+', date: '03/06 14:32' },
  { symbol: 'XAUUSD', side: 'Short', session: 'NY PM', pnl: -18.4, rr: '0.7', setup: 'Rejection', emotion: 'Focused', tag: 'B', date: '03/06 12:15' },
  { symbol: 'NAS100', side: 'Short', session: 'NY Open', pnl: -63.2, rr: '0.6', setup: 'Liquidity', emotion: 'Frustrated', tag: 'C', date: '03/06 10:01' },
  { symbol: 'GBPUSD', side: 'Long', session: 'London', pnl: 25.6, rr: '1.6', setup: 'Breakout', emotion: 'Calm', tag: 'A', date: '02/06 15:47' },
  { symbol: 'EURUSD', side: 'Long', session: 'Asia', pnl: 12.3, rr: '1.2', setup: 'BOS', emotion: 'Calm', tag: 'B+', date: '02/06 08:22' },
]

const SPARK_POSITIVE = [14, 18, 17, 20, 19, 24, 22, 27, 30, 28, 31, 35]
const SPARK_PURPLE = [24, 23, 24, 22, 29, 33, 34, 33, 28, 24, 25, 24]
const SPARK_GREEN = [22, 19, 20, 28, 27, 25, 26, 22, 19, 21, 23, 24]
const SPARK_YELLOW = [21, 24, 24, 23, 25, 31, 31, 25, 24, 21, 18, 23]

function isDashboardPeriod(value: string | null): value is DashboardPeriod {
  return DASHBOARD_PERIODS.includes(value as DashboardPeriod)
}

function formatMoney(value: number, signed = false) {
  const formatted = value.toLocaleString('fr-FR', {
    style: DASHBOARD_CURRENCY === 'EUR' ? 'currency' : 'decimal',
    currency: DASHBOARD_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return signed && value > 0 ? `+${formatted}` : formatted
}

function formatPct(value: number) {
  return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return 'il y a 2 min'
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (diff < 60) return `il y a ${diff}s`
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  return `il y a ${Math.floor(diff / 86400)} j`
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const width = 122
  const height = 42
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * (height - 8) - 4
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-12 w-32 shrink-0 overflow-visible" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`${points} ${width},${height} 0,${height}`} fill={color} opacity="0.12" stroke="none" />
    </svg>
  )
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn(
      'rounded-lg border border-white/10 bg-[#0b1019]/95 shadow-[0_18px_60px_rgba(0,0,0,0.24)]',
      className,
    )}>
      {children}
    </section>
  )
}

function KpiTile({
  label,
  value,
  helper,
  tone,
  icon,
  sparkline,
}: {
  label: string
  value: string
  helper: string
  tone: 'green' | 'purple' | 'amber' | 'neutral'
  icon: ReactNode
  sparkline: ReactNode
}) {
  const toneClass = {
    green: 'text-emerald-400',
    purple: 'text-violet-300',
    amber: 'text-amber-300',
    neutral: 'text-white',
  }[tone]

  return (
    <Panel className="min-h-[122px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
            <CircleDot className="h-3 w-3 text-slate-500" />
          </div>
          <p className={cn('mt-3 font-mono text-3xl font-black leading-none tracking-tight', toneClass)}>{value}</p>
          <p className={cn('mt-2 truncate text-xs font-semibold', tone === 'green' ? 'text-emerald-400' : 'text-slate-300')}>
            {helper}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/5 bg-white/[0.06] text-current">
          {icon}
        </div>
      </div>
      <div className="mt-[-8px] flex justify-end">{sparkline}</div>
    </Panel>
  )
}

function AiScoreRing({ score }: { score: number }) {
  const degrees = Math.max(0, Math.min(100, score)) * 3.6

  return (
    <div
      className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
      style={{ background: `conic-gradient(#8b5cf6 ${degrees}deg, rgba(139,92,246,0.14) 0deg)` }}
    >
      <div className="absolute inset-2 rounded-full bg-[#111624]" />
      <div className="relative text-center">
        <p className="font-mono text-3xl font-black leading-none text-white">{score}</p>
        <p className="mt-1 font-mono text-xs font-bold text-slate-400">/100</p>
      </div>
    </div>
  )
}

function AiAnalysisPanel() {
  return (
    <Panel className="h-full overflow-hidden">
      <div className="border-b border-white/10 bg-violet-950/20 px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-300" />
          <h2 className="text-[12px] font-black uppercase tracking-[0.12em] text-slate-200">Analyse IA</h2>
        </div>
      </div>
      <div className="grid gap-6 p-5 md:grid-cols-[150px_1fr]">
        <AiScoreRing score={72} />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-200">Score discipline</p>
            <p className="mt-1 text-sm font-black text-emerald-400">Bon</p>
            <p className="mt-5 text-sm font-semibold text-slate-200">Progression</p>
            <p className="mt-1 text-sm font-medium text-slate-400">+8 pts vs mois dernier</p>
          </div>
          <div className="border-white/10 sm:border-l sm:pl-6">
            <p className="text-sm font-semibold text-slate-400">Risque principal détecté</p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <p className="text-xl font-black text-white">Overtrading après gain</p>
              <TrendingDown className="mt-1 h-5 w-5 shrink-0 text-red-400" />
            </div>
            <p className="mt-5 text-sm font-semibold text-slate-300">Recommandation IA</p>
            <p className="mt-2 max-w-lg text-sm leading-5 text-slate-400">
              Vous prenez trop de trades après une série gagnante. Essayez d’ajouter une pause de 15 min après 2 gains consécutifs.
            </p>
          </div>
        </div>
      </div>
      <div className="px-5 pb-5">
        <Link
          href="/app/ia"
          className="flex min-h-14 items-center justify-center gap-2 rounded-md bg-violet-600 px-4 text-sm font-black text-white shadow-[0_14px_38px_rgba(124,58,237,0.35)] transition-colors hover:bg-violet-500"
        >
          <Sparkles className="h-4 w-4" />
          Analyser mes performances
        </Link>
        <p className="mt-2 text-center text-xs font-medium text-violet-200/80">Analysez en profondeur vos trades avec l’IA</p>
      </div>
    </Panel>
  )
}

function detectSession(openTime: string) {
  const hour = new Date(openTime).getHours()
  if (hour < 8) return 'Asia'
  if (hour < 13) return 'London'
  if (hour < 17) return 'NY Open'
  return 'NY PM'
}

function gradeTrade(pnl: number) {
  if (pnl >= 40) return 'A+'
  if (pnl >= 20) return 'A'
  if (pnl >= 0) return 'B+'
  if (pnl <= -50) return 'C'
  return 'B'
}

function normalizeTrade(trade: Trade) {
  const pnl = Number(trade.pnl ?? 0)
  const date = new Date(trade.openTime)

  return {
    symbol: trade.symbol,
    side: trade.direction === 'LONG' ? 'Long' : 'Short',
    session: detectSession(trade.openTime),
    pnl,
    rr: pnl >= 0 ? '1.6' : '0.7',
    setup: trade.strategyTag ?? (trade.direction === 'LONG' ? 'BOS' : 'Rejection'),
    emotion: pnl >= 0 ? 'Calm' : 'Focused',
    tag: gradeTrade(pnl),
    date: date.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
  }
}

function LatestTradesPanel({ trades }: { trades: ReturnType<typeof normalizeTrade>[] | typeof DEMO_TRADES }) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <h2 className="text-[13px] font-black uppercase tracking-[0.1em] text-white">Derniers trades</h2>
        <div className="flex items-center gap-2">
          <button type="button" className="hidden rounded-md border border-white/10 bg-[#0a0f18] px-3 py-2 text-xs font-semibold text-white sm:inline-flex">
            Tous les comptes <ChevronDown className="ml-2 h-3.5 w-3.5 text-slate-400" />
          </button>
          <button type="button" className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 bg-[#0a0f18] px-3 text-xs font-semibold text-white">
            <Filter className="h-4 w-4" />
            Filtres
          </button>
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-[#0a0f18] text-slate-400">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-y border-white/10 bg-white/[0.015] text-[10px] uppercase tracking-[0.14em] text-slate-500">
              {['Symbol', 'Side', 'Session', 'P&L', 'R:R', 'Setup', 'Emotion', 'Tags', 'Date', ''].map((head) => (
                <th key={head} className="px-3 py-3 font-black">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {trades.map((trade) => {
              const positive = trade.pnl >= 0
              return (
                <tr key={`${trade.symbol}-${trade.date}`} className="group hover:bg-white/[0.025]">
                  <td className="px-3 py-3 font-black text-white">{trade.symbol}</td>
                  <td className={cn('px-3 py-3 font-bold', trade.side === 'Long' ? 'text-emerald-400' : 'text-red-400')}>
                    {trade.side}
                  </td>
                  <td className="px-3 py-3 text-slate-300">{trade.session}</td>
                  <td className={cn('px-3 py-3 font-mono font-black', positive ? 'text-emerald-400' : 'text-red-400')}>
                    {formatMoney(trade.pnl, true)}
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-300">{trade.rr}</td>
                  <td className="px-3 py-3 text-slate-300">{trade.setup}</td>
                  <td className="px-3 py-3 text-slate-300">{trade.emotion}</td>
                  <td className="px-3 py-3">
                    <span className={cn(
                      'rounded border px-1.5 py-0.5 font-mono text-[11px] font-black',
                      positive ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-amber-400/30 bg-amber-400/10 text-amber-300',
                    )}>
                      {trade.tag}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-400">{trade.date}</td>
                  <td className="px-3 py-3">
                    <ChevronRight className="h-4 w-4 text-slate-500 transition-colors group-hover:text-white" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-white/10 px-5 py-4">
        <Link href="/app/trades" className="inline-flex items-center gap-2 text-sm font-black text-violet-400 hover:text-violet-300">
          Voir tous les trades <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </Panel>
  )
}

function ConfigCard({
  title,
  icon,
  tone,
  instrument,
  pnl,
  winRate,
  data,
}: {
  title: string
  icon: ReactNode
  tone: 'green' | 'red'
  instrument: string
  pnl: number
  winRate: string
  data: number[]
}) {
  const positive = tone === 'green'
  const color = positive ? '#22c55e' : '#fb7185'

  return (
    <div className={cn(
      'overflow-hidden rounded-md border bg-white/[0.025]',
      positive ? 'border-emerald-400/20' : 'border-red-400/20',
    )}>
      <div className={cn(
        'flex items-center gap-2 border-b px-4 py-3',
        positive ? 'border-emerald-400/10 bg-emerald-400/10' : 'border-red-400/10 bg-red-400/10',
      )}>
        {icon}
        <p className={cn('text-xs font-black uppercase tracking-[0.08em]', positive ? 'text-emerald-400' : 'text-red-400')}>
          {title}
        </p>
      </div>
      <div className="p-4">
        <p className="font-semibold text-white">{instrument}</p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <p className={cn('font-mono text-3xl font-black', positive ? 'text-emerald-400' : 'text-red-400')}>
            {formatMoney(pnl, true)}
          </p>
          <MiniSparkline data={data} color={color} />
          <div className="text-right">
            <p className="font-mono text-2xl font-black text-white">{winRate}</p>
            <p className="text-xs font-semibold text-slate-400">Win Rate</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-white/10 bg-white/[0.025] text-sm">
        <div className="px-4 py-3">
          <p className="text-slate-400">R:R moyen</p>
          <p className="mt-1 font-mono font-black text-white">{positive ? '1.8' : '0.6'}</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-slate-400">Trades</p>
          <p className={cn('mt-1 font-mono font-black', positive ? 'text-white' : 'text-red-300')}>{positive ? '28' : '16'}</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-slate-400">P&L moyen</p>
          <p className={cn('mt-1 font-mono font-black', positive ? 'text-emerald-400' : 'text-red-400')}>
            {positive ? '+6,68 €' : '-5,88 €'}
          </p>
        </div>
      </div>
    </div>
  )
}

function TradeIntelligencePanel() {
  return (
    <Panel className="p-5">
      <h2 className="text-[13px] font-black uppercase tracking-[0.1em] text-white">Trade intelligence</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <ConfigCard
          title="Meilleures configurations"
          icon={<Trophy className="h-4 w-4 text-emerald-400" />}
          tone="green"
          instrument="EURUSD · Long · Session London"
          pnl={187}
          winRate="72%"
          data={[8, 15, 14, 18, 20, 28, 22, 25, 31, 29, 35]}
        />
        <ConfigCard
          title="Pires configurations"
          icon={<TrendingDown className="h-4 w-4 text-red-400" />}
          tone="red"
          instrument="NAS100 · Short · NY Open"
          pnl={-94}
          winRate="31%"
          data={[34, 30, 26, 29, 24, 24, 20, 21, 17, 18, 12]}
        />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          { icon: <Activity className="h-4 w-4 text-emerald-400" />, label: 'Session la plus rentable :', value: 'London' },
          { icon: <CalendarDays className="h-4 w-4 text-emerald-400" />, label: 'Jour le plus rentable :', value: 'Mardi' },
          { icon: <Trophy className="h-4 w-4 text-amber-300" />, label: 'Actif préféré :', value: 'EURUSD' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.025] px-3 py-3 text-xs font-semibold">
            {item.icon}
            <span className="text-slate-400">{item.label}</span>
            <span className="font-black text-emerald-400">{item.value}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

export function DashboardPage() {
  const [chartPeriod, setChartPeriod] = useState<DashboardPeriod>('1M')
  const [equityView, setEquityView] = useState<EquityView>('cumul')
  const [showCheckoutBanner, setShowCheckoutBanner] = useState(false)
  const [emailUnverified, setEmailUnverified] = useState(true)
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  const apiPeriod = chartPeriodToApiPeriod(chartPeriod)
  const { data: accounts = [] } = useAccounts()
  const summaryQuery = useKpiSummary(apiPeriod)
  const snapshotsQuery = useKpiSnapshots(chartPeriod)
  const tradesQuery = useTrades({ limit: 5 })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'success') {
      setShowCheckoutBanner(true)
      window.history.replaceState({}, '', '/app/dashboard')
      const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
      const token = localStorage.getItem('merkure_token')
      if (token) {
        fetch(`${API}/api/v1/auth/refresh-plan`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((d: { token?: string }) => {
            if (d.token) localStorage.setItem('merkure_token', d.token)
          })
          .catch(() => {})
      }
    }

    const storedDashboardPeriod = window.localStorage.getItem(DASHBOARD_PERIOD_KEY)
    if (isDashboardPeriod(storedDashboardPeriod)) {
      setChartPeriod(storedDashboardPeriod)
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
    const authToken = localStorage.getItem('merkure_token')
    if (authToken) {
      fetch(`${apiBase}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${authToken}` } })
        .then((r) => r.json())
        .then((d: { emailVerified?: boolean }) => {
          setEmailUnverified(d.emailVerified !== true)
        })
        .catch(() => {})
    }
  }, [])

  const handleResendVerification = useCallback(async () => {
    if (resendStatus === 'loading' || resendStatus === 'sent') return
    setResendStatus('loading')
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
      const authToken = localStorage.getItem('merkure_token')
      const res = await fetch(`${apiBase}/api/v1/auth/resend-verification`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken ?? ''}` },
      })
      setResendStatus(res.ok ? 'sent' : 'error')
    } catch {
      setResendStatus('error')
    }
  }, [resendStatus])

  const updatePeriod = (period: DashboardPeriod) => {
    setChartPeriod(period)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DASHBOARD_PERIOD_KEY, period)
    }
  }

  const summary = summaryQuery.data
  const totalPnl = Number(summary?.totalPnl ?? 379.6)
  const nbTrades = Number(summary?.nbTrades ?? 85)
  const winRatePct = summary ? summary.winRate * 100 : 58.8
  const winTrades = Math.round((winRatePct / 100) * nbTrades)
  const profitFactor = Number(summary?.profitFactor ?? 1.37)
  const maxDrawdownPct = summary?.maxDrawdown != null ? Math.abs(summary.maxDrawdown * 100) : 8.4
  const riskGrade = maxDrawdownPct <= 4 ? 'A-' : maxDrawdownPct <= 10 ? 'B+' : 'C+'
  const riskLabel = maxDrawdownPct <= 10 ? 'Drawdown faible' : 'Drawdown à surveiller'

  const behavioralSignal =
    maxDrawdownPct > 15 || winRatePct < 40 ? 'Risque élevé'
    : maxDrawdownPct > 8 || winRatePct < 50 ? 'Risque modéré'
    : 'Risque faible'

  const nextAction =
    maxDrawdownPct > 15 || winRatePct < 40 ? 'Réduire la taille'
    : winRatePct < 50 ? 'Revoir la stratégie'
    : nbTrades < 5 ? 'Ouvrir une position'
    : 'Analyser la session'

  const latestSync = accounts
    .map((account) => account.lastSyncAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b as string).getTime() - new Date(a as string).getTime())[0]
  const syncLabel = relativeTime(latestSync)
  const connectedAccounts = accounts.length || 3

  const equityData = useMemo(() => {
    if (snapshotsQuery.data?.length) {
      return snapshotsQuery.data.map((item, index) => ({
        ...item,
        drawdown: -Math.max(4, Math.round((index % 6) * 7 + Math.abs(item.pnl) / 18)),
      }))
    }
    return DEMO_EQUITY_DATA
  }, [snapshotsQuery.data])

  const chartKey = equityView === 'daily' ? 'pnl' : equityView === 'drawdown' ? 'drawdown' : 'cumPnl'
  const chartStroke = equityView === 'drawdown' ? '#fb7185' : '#8b5cf6'
  const chartGradient = equityView === 'drawdown' ? 'dashboardDrawdownGradient' : 'dashboardEquityGradient'

  const latestTrades = useMemo(() => {
    const trades = tradesQuery.data?.items ?? []
    if (!trades.length) return DEMO_TRADES
    return trades.slice(0, 5).map(normalizeTrade)
  }, [tradesQuery.data?.items])

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[radial-gradient(circle_at_20%_0%,rgba(124,58,237,0.16),transparent_28%),linear-gradient(180deg,#0b111c_0%,#05070b_58%,#030407_100%)] px-4 pb-8 pt-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1780px] space-y-5">
        <div className="flex items-center gap-2 text-sm text-slate-400 lg:hidden">
          <span>Dernière synchro : {syncLabel}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]" />
          <span>{connectedAccounts} comptes connectés</span>
        </div>

        {emailUnverified && (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-violet-500/35 bg-violet-950/20 px-4 py-3 shadow-[0_12px_40px_rgba(124,58,237,0.12)]">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-violet-400/20 bg-violet-500/10">
                <AlertTriangle className="h-5 w-5 text-violet-300" />
              </div>
              <p className="truncate text-sm font-medium text-slate-300">
                <span className="font-black text-white">Email non vérifié</span> — Activez votre compte pour débloquer les exports et alertes.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendStatus === 'loading' || resendStatus === 'sent'}
                className="hidden rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-white transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
              >
                {resendStatus === 'loading' && 'Envoi…'}
                {resendStatus === 'sent' && 'Email envoyé !'}
                {resendStatus === 'error' && 'Réessayer'}
                {resendStatus === 'idle' && 'Valider maintenant'}
              </button>
              <button
                type="button"
                onClick={() => setEmailUnverified(false)}
                className="rounded-md p-2 text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                aria-label="Masquer l'alerte email"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {showCheckoutBanner && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-400/15">
                <Check className="h-4 w-4 text-emerald-300" />
              </div>
              <div>
                <p className="text-sm font-black text-emerald-200">Abonnement activé</p>
                <p className="text-xs font-semibold text-emerald-300/70">Votre plan est maintenant actif.</p>
              </div>
            </div>
            <button
              onClick={() => setShowCheckoutBanner(false)}
              className="rounded-md p-2 text-emerald-300/70 transition-colors hover:bg-emerald-400/10 hover:text-emerald-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiTile
            label="Net P&L"
            value={formatMoney(totalPnl, true)}
            helper="+12.4% vs période précédente"
            tone={totalPnl >= 0 ? 'green' : 'amber'}
            icon={<TrendingUp className={cn('h-5 w-5', totalPnl >= 0 ? 'text-emerald-400' : 'text-amber-300')} />}
            sparkline={<MiniSparkline data={SPARK_POSITIVE} color={totalPnl >= 0 ? '#22c55e' : '#f59e0b'} />}
          />
          <KpiTile
            label="Win Rate"
            value={formatPct(winRatePct)}
            helper={`${winTrades} / ${nbTrades} trades gagnants`}
            tone="neutral"
            icon={<Target className="h-5 w-5 text-violet-300" />}
            sparkline={<MiniSparkline data={SPARK_PURPLE} color="#8b5cf6" />}
          />
          <KpiTile
            label="Profit Factor"
            value={profitFactor.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            helper={profitFactor >= 1.5 ? 'Solide' : profitFactor >= 1 ? 'Neutre' : 'Faible'}
            tone="neutral"
            icon={<CircleDot className="h-5 w-5 text-emerald-400" />}
            sparkline={<MiniSparkline data={SPARK_GREEN} color="#22c55e" />}
          />
          <KpiTile
            label="Risk Score"
            value={riskGrade}
            helper={riskLabel}
            tone="amber"
            icon={<ShieldCheck className="h-5 w-5 text-amber-300" />}
            sparkline={<MiniSparkline data={SPARK_YELLOW} color="#f59e0b" />}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel className="p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <h2 className="text-[13px] font-black uppercase tracking-[0.1em] text-white">Évolution de l'equity</h2>
                <div className="inline-flex overflow-hidden rounded-md border border-white/10 bg-[#0a0f18] text-xs font-semibold">
                  {[
                    ['cumul', 'Cumulé'],
                    ['daily', 'Journalier'],
                    ['drawdown', 'Drawdown'],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setEquityView(key as EquityView)}
                      className={cn(
                        'min-h-9 px-4 transition-colors',
                        equityView === key ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <select
                  value={chartPeriod}
                  onChange={(event) => updatePeriod(event.target.value as DashboardPeriod)}
                  className="h-9 appearance-none rounded-md border border-white/10 bg-[#0a0f18] pl-3 pr-8 font-mono text-xs font-black text-white outline-none transition-colors hover:bg-white/[0.04]"
                >
                  {DASHBOARD_PERIODS.map((period) => (
                    <option key={period} value={period}>{DASHBOARD_PERIOD_LABELS[period]}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData} margin={{ top: 10, right: 10, bottom: 0, left: -8 }}>
                  <defs>
                    <linearGradient id="dashboardEquityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="dashboardDrawdownGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fb7185" stopOpacity={0.38} />
                      <stop offset="100%" stopColor="#fb7185" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 4" stroke="rgba(148,163,184,0.14)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    tickFormatter={(value: number) => `${value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`}
                  />
                  <Tooltip
                    cursor={{ stroke: 'rgba(139,92,246,0.35)', strokeWidth: 1 }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      const value = Number(payload[0]?.value ?? 0)
                      return (
                        <div className="rounded-md border border-white/10 bg-[#111624] px-3 py-2 shadow-2xl">
                          <p className="text-xs font-semibold text-slate-400">{label}</p>
                          <p className="mt-1 font-mono text-sm font-black text-white">{formatMoney(value, true)}</p>
                        </div>
                      )
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={chartKey}
                    stroke={chartStroke}
                    strokeWidth={3}
                    fill={`url(#${chartGradient})`}
                    dot={false}
                    activeDot={{ r: 5, fill: chartStroke, stroke: '#0b1019', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <AiAnalysisPanel />
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <TradeIntelligencePanel />
          <LatestTradesPanel trades={latestTrades} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: <Zap className="h-4 w-4 text-violet-300" />, label: 'Signal comportemental', value: behavioralSignal },
            { icon: <Activity className="h-4 w-4 text-emerald-400" />, label: 'Rythme de trading', value: `${nbTrades} trades` },
            { icon: <ArrowRight className="h-4 w-4 text-amber-300" />, label: 'Prochaine action', value: nextAction },
          ].map((item) => (
            <Panel key={item.label} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/[0.05]">{item.icon}</div>
              <div>
                <p className="text-xs font-semibold text-slate-400">{item.label}</p>
                <p className="mt-0.5 text-sm font-black text-white">{item.value}</p>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  )
}
