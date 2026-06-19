'use client'

import { useMemo, useState, type ReactNode } from 'react'
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Download,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  chartPeriodToApiPeriod,
  useKpiBreakdown,
  useKpiSummary,
  type ChartPeriod,
} from '@/lib/hooks/use-kpis'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { KpiCards } from '@/features/dashboard/components/KpiCards'
import { EquityChart } from '@/features/dashboard/components/EquityChart'
import { RiskPanel } from '@/features/dashboard/components/RiskPanel'
import { TradesTable } from '@/features/dashboard/components/TradesTable'
import { AiAnalysisBanner } from '@/features/dashboard/components/AiAnalysisBanner'
import { AssetBreakdown } from '@/features/dashboard/components/AssetBreakdown'
import { StatsCles, StrategyPerformance } from '@/features/dashboard/components/StatsAndStrategy'
import { EconomicCalendar } from '@/features/dashboard/components/EconomicCalendar'
import { RightPanel } from '@/features/dashboard/components/RightPanel'

const PERIODS: Array<{ label: string; value: ChartPeriod; description: string }> = [
  { label: '7J',  value: '7J',  description: 'court terme' },
  { label: '1M',  value: '1M',  description: '30 derniers jours' },
  { label: '3M',  value: '3M',  description: 'trimestre' },
  { label: 'YTD', value: 'YTD', description: 'année en cours' },
  { label: 'ALL', value: 'ALL', description: 'historique complet' },
]

function formatMoney(value: number | null | undefined) {
  if (value == null) return '—'
  return value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  })
}

function formatPct(value: number | null | undefined) {
  if (value == null) return '—'
  return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

function Panel({
  title,
  eyebrow,
  action,
  children,
  className,
}: {
  title: string
  eyebrow?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-lg border border-border bg-white p-5 shadow-sm lg:p-6', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-1 text-base font-bold text-foreground">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function StatusTile({
  icon,
  label,
  value,
  helper,
  tone = 'neutral',
}: {
  icon: ReactNode
  label: string
  value: string
  helper: string
  tone?: 'neutral' | 'good' | 'warning'
}) {
  return (
    <div className="rounded-lg border border-border bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border',
            tone === 'good' && 'border-emerald-200 bg-emerald-50 text-emerald-600',
            tone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-600',
            tone === 'neutral' && 'border-border bg-[hsl(var(--accent))] text-muted-foreground',
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p>
        </div>
      </div>
    </div>
  )
}

function PeriodSelector({
  value,
  onChange,
}: {
  value: ChartPeriod
  onChange: (period: ChartPeriod) => void
}) {
  return (
    <div className="inline-flex rounded-md border border-border bg-white p-1">
      {PERIODS.map((period) => (
        <button
          key={period.value}
          type="button"
          onClick={() => onChange(period.value)}
          className={cn(
            'h-8 rounded px-3 text-xs font-bold transition-colors',
            value === period.value
              ? 'bg-foreground text-white'
              : 'text-muted-foreground hover:bg-[hsl(var(--accent))] hover:text-foreground',
          )}
          title={period.description}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}

export function DashboardPage() {
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('1M')
  const kpiPeriod = chartPeriodToApiPeriod(chartPeriod)
  const { data: user } = useCurrentUser()
  const summaryQuery = useKpiSummary(kpiPeriod)
  const breakdownQuery = useKpiBreakdown(kpiPeriod)

  const firstName = user?.firstName ?? 'Alex'
  const summary = summaryQuery.data

  const operatingRead = useMemo(() => {
    const pnl = summary?.totalPnl ?? null
    const trades = summary?.nbTrades ?? 0
    const winRate = summary ? summary.winRate * 100 : null
    const profitFactor = summary?.profitFactor ?? null

    if (!summary || trades === 0) {
      return {
        title: 'Données à consolider',
        description: 'Importez ou synchronisez vos trades pour obtenir une lecture exploitable.',
        tone: 'warning' as const,
      }
    }

    if ((pnl ?? 0) >= 0 && (profitFactor ?? 0) >= 1.2 && (winRate ?? 0) >= 50) {
      return {
        title: 'Cadre sain',
        description: 'Performance positive, risque lisible et régularité acceptable sur la période.',
        tone: 'good' as const,
      }
    }

    return {
      title: 'À surveiller',
      description: 'La période demande une revue du risque, des setups et des pertes répétées.',
      tone: 'warning' as const,
    }
  }, [summary])

  return (
    <div className="min-h-screen bg-[#f6f7f9] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <section className="rounded-lg border border-border bg-white p-5 shadow-sm lg:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Tableau de bord
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                Bonjour {firstName}, voici votre synthèse de trading.
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Une vue opérationnelle pour suivre la performance, le risque, les actifs travaillés
                et les actions prioritaires sans surcharger l’interface.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PeriodSelector value={chartPeriod} onChange={setChartPeriod} />
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-3 text-xs font-bold text-muted-foreground transition-colors hover:bg-[hsl(var(--accent))] hover:text-foreground"
              >
                <RefreshCw className="h-4 w-4" />
                Synchroniser
              </button>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-3 text-xs font-bold text-muted-foreground transition-colors hover:bg-[hsl(var(--accent))] hover:text-foreground"
              >
                <Download className="h-4 w-4" />
                Exporter
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <StatusTile
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="État du compte"
              value={operatingRead.title}
              helper={operatingRead.description}
              tone={operatingRead.tone}
            />
            <StatusTile
              icon={<TrendingUp className="h-4 w-4" />}
              label="Performance"
              value={formatMoney(summary?.totalPnl)}
              helper={`${summary?.nbTrades ?? 0} trades analysés sur ${PERIODS.find(p => p.value === chartPeriod)?.description ?? 'la période'}.`}
              tone={(summary?.totalPnl ?? 0) >= 0 ? 'good' : 'warning'}
            />
            <StatusTile
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Qualité d'exécution"
              value={formatPct(summary ? summary.winRate * 100 : null)}
              helper={`Profit factor ${summary?.profitFactor?.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) ?? '—'} · lecture consolidée.`}
              tone={(summary?.winRate ?? 0) >= 0.5 ? 'good' : 'neutral'}
            />
          </div>
        </section>

        <KpiCards period={kpiPeriod} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-5">
            <EquityChart
              period={chartPeriod}
              onPeriodChange={setChartPeriod}
              periods={PERIODS.map(period => period.value)}
            />

            <AiAnalysisBanner />

            <div className="grid gap-5 2xl:grid-cols-2">
              <AssetBreakdown
                data={breakdownQuery.data}
                isLoading={breakdownQuery.isLoading}
              />
              <StrategyPerformance
                data={breakdownQuery.data}
                isLoading={breakdownQuery.isLoading}
              />
            </div>

            <TradesTable />
          </div>

          <aside className="min-w-0 space-y-5">
            <RiskPanel />
            <StatsCles period={kpiPeriod} />
            <RightPanel />
            <Panel
              eyebrow="Contexte"
              title="Agenda et filtres"
              action={<SlidersHorizontal className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="grid gap-3">
                <div className="flex items-start gap-3 rounded-md border border-border bg-[#f8fafc] p-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Période active</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Les widgets utilisent le filtre {PERIODS.find(p => p.value === chartPeriod)?.description ?? 'actif'}.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border border-border bg-[#f8fafc] p-3">
                  <Activity className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Lecture prioritaire</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Commencez par le risque, puis validez les trades récents et les stratégies.
                    </p>
                  </div>
                </div>
              </div>
            </Panel>
            <EconomicCalendar />
          </aside>
        </div>
      </div>
    </div>
  )
}
