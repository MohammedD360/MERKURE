'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  WalletCards,
  X,
} from 'lucide-react'
import { useAccounts } from '@/lib/hooks/use-accounts'
import { chartPeriodToApiPeriod, useKpiBreakdown, type ChartPeriod } from '@/lib/hooks/use-kpis'
import { KpiCards }                         from './components/KpiCards'
import { EquityChart }                       from './components/EquityChart'
import { AssetBreakdown }                    from './components/AssetBreakdown'
import { StatsCles, StrategyPerformance }    from './components/StatsAndStrategy'
import { RiskPanel }                         from './components/RiskPanel'
import { TradesTable }                       from './components/TradesTable'
import { AiAnalysisBanner }                  from './components/AiAnalysisBanner'
import { RightPanel }                        from './components/RightPanel'

const DASHBOARD_PERIODS = ['7J', '1M', '3M', '1Y', 'ALL'] as const satisfies readonly ChartPeriod[]
type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number]
const DASHBOARD_PERIOD_KEY = 'merkure_dashboard_period'

const DASHBOARD_PERIOD_LABELS: Record<DashboardPeriod, string> = {
  '7J': '7J',
  '1M': '1M',
  '3M': '3M',
  '1Y': '1Y',
  ALL: 'Tout',
}

function isDashboardPeriod(value: string | null): value is DashboardPeriod {
  return DASHBOARD_PERIODS.includes(value as DashboardPeriod)
}

function OnboardingStrip({
  hasAccounts,
  onDismiss,
}: {
  hasAccounts: boolean
  onDismiss: () => void
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#0b111c] p-3 shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Actions rapides</p>
          <p className="mt-1 text-sm font-semibold text-white">Gardez les tâches opérationnelles à portée de main.</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md p-2 text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-white"
          aria-label="Masquer les actions rapides"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Link
          href="/app/accounts"
          className="group rounded-lg border border-slate-800 bg-[#071017] p-4 transition-colors hover:border-slate-700 hover:bg-[#0f1724]"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-blue-400/20 bg-blue-400/10 text-blue-300">
              <WalletCards className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white">{hasAccounts ? 'Synchronisation broker' : 'Connecter un broker'}</p>
              <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                {hasAccounts ? 'Contrôlez la fraîcheur des données importées.' : 'Importez vos trades en lecture seule pour alimenter le dashboard.'}
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-white" />
          </div>
        </Link>

        <Link
          href="/app/journal"
          className="group rounded-lg border border-slate-800 bg-[#071017] p-4 transition-colors hover:border-slate-700 hover:bg-[#0f1724]"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <Activity className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white">Revue de session</p>
              <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                Documentez vos erreurs récurrentes et vos setups propres.
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-white" />
          </div>
        </Link>

        <Link
          href="/app/alerts"
          className="group rounded-lg border border-slate-800 bg-[#071017] p-4 transition-colors hover:border-slate-700 hover:bg-[#0f1724]"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-amber-400/20 bg-amber-400/10 text-amber-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white">Alertes de risque</p>
              <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                Surveillez drawdown, séries de pertes et anomalies de synchronisation.
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-white" />
          </div>
        </Link>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('1M')
  const [accountId, setAccountId] = useState<string | undefined>()
  const period = chartPeriodToApiPeriod(chartPeriod)
  const [showCheckoutBanner, setShowCheckoutBanner] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [emailUnverified, setEmailUnverified] = useState(false)
  const { data: accounts = [] } = useAccounts()
  const breakdownQuery = useKpiBreakdown(period, accountId)

  const dismissQuickActions = () => {
    setShowQuickActions(false)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('dashboard-quick-actions-dismissed', '1')
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('checkout') === 'success') {
        setShowCheckoutBanner(true)
        window.history.replaceState({}, '', '/app/dashboard')
        // Refresh le JWT avec le plan mis à jour par le webhook Stripe
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

      if (window.localStorage.getItem('dashboard-quick-actions-dismissed') === '1') {
        setShowQuickActions(false)
      }

      const storedDashboardPeriod = window.localStorage.getItem(DASHBOARD_PERIOD_KEY)
      if (isDashboardPeriod(storedDashboardPeriod)) {
        setChartPeriod(storedDashboardPeriod)
      }

      // Check email verification
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
      const authToken = localStorage.getItem('merkure_token')
      if (authToken) {
        fetch(`${apiBase}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${authToken}` } })
          .then((r) => r.json())
          .then((d: { emailVerified?: boolean }) => {
            if (d.emailVerified === false) setEmailUnverified(true)
          })
          .catch(() => {})
      }
    }
  }, [])

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      {emailUnverified && (
        <div className="flex items-center justify-between rounded-lg border border-amber-400/25 bg-amber-400/[0.08] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-400/15">
              <AlertTriangle className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <p className="text-sm font-black text-amber-200">Email non vérifié</p>
              <p className="text-xs font-semibold text-amber-300/70">Vérifiez votre boîte mail pour confirmer votre adresse.</p>
            </div>
          </div>
          <button onClick={() => setEmailUnverified(false)} className="rounded-md p-2 text-amber-300/70 transition-colors hover:bg-amber-400/10 hover:text-amber-200">
            <X className="h-4 w-4" />
          </button>
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
          <button onClick={() => setShowCheckoutBanner(false)} className="rounded-md p-2 text-emerald-300/70 transition-colors hover:bg-emerald-400/10 hover:text-emerald-200">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 border-b border-slate-800/80 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Période d&apos;analyse</span>
          <div className="grid grid-cols-5 overflow-hidden rounded-md border border-slate-800 bg-[#071017] text-xs font-black sm:inline-flex">
            {DASHBOARD_PERIODS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setChartPeriod(item)}
                className={`px-3 py-2 transition-colors ${
                  chartPeriod === item
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
                }`}
              >
                {DASHBOARD_PERIOD_LABELS[item]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="dashboard-account" className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            Compte
          </label>
          <select
            id="dashboard-account"
            value={accountId ?? ''}
            onChange={(event) => setAccountId(event.target.value || undefined)}
            className="min-w-0 rounded-md border border-slate-800 bg-[#071017] px-3 py-2 text-xs font-semibold text-slate-300 outline-none transition-colors hover:bg-[#0f1724] focus:border-blue-500 sm:min-w-48"
          >
            <option value="">Tous les comptes</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.label}</option>
            ))}
          </select>
        </div>
      </div>

      <KpiCards period={period} accountId={accountId} />

      <AiAnalysisBanner />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <EquityChart
            period={chartPeriod}
            onPeriodChange={setChartPeriod}
            periods={DASHBOARD_PERIODS}
            accountId={accountId}
            hideAccountSelect
            showPeriodControls={false}
          />
        </div>
        <div className="space-y-5 xl:col-span-4">
          <AssetBreakdown
            data={breakdownQuery.data}
            isLoading={breakdownQuery.isLoading}
          />
          <RightPanel />
        </div>
      </div>

      <TradesTable />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <StatsCles period={period} accountId={accountId} />
        <StrategyPerformance
          data={breakdownQuery.data}
          isLoading={breakdownQuery.isLoading}
        />
      </div>

      {showQuickActions && (
        <OnboardingStrip
          hasAccounts={accounts.length > 0}
          onDismiss={dismissQuickActions}
        />
      )}

      <RiskPanel />
    </div>
  )
}
