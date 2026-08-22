'use client'

import { Clock } from 'lucide-react'
import type { ReactNode } from 'react'

import { useAccounts } from '@/lib/hooks/use-accounts'
import { useKpiSummary } from '@/lib/hooks/use-kpis'
import { usePortfolioSummary } from '@/lib/hooks/use-portfolio'
import { useRiskStatus } from '@/lib/hooks/use-risk'
import { useCurrency } from '@/lib/hooks/use-currency'
import { formatMoney, formatPercent } from '@/lib/format'
import {
  KpiBadge, KpiCard, KpiLabel, KpiSkeleton, KpiSubMetrics, KpiValue,
} from '@/shared/components/KpiCard'
import { cn } from '@/lib/utils'

/** Fraîcheur de la synchro, en clair. */
function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  return `il y a ${Math.round(hours / 24)} j`
}

export function HeadlineKpis({ actions }: { actions?: ReactNode }) {
  const currency = useCurrency()
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolioSummary()
  const { data: allTime,  isLoading: allLoading }  = useKpiSummary('all')
  const { data: monthly }  = useKpiSummary('30d')
  const { data: weekly }   = useKpiSummary('7d')
  const { data: risk }     = useRiskStatus()
  const { data: accounts = [] } = useAccounts()

  const activeAccounts = accounts.filter(a => a.isActive)
  const lastSync = accounts
    .map(a => a.lastSyncAt)
    .filter((d): d is string => Boolean(d))
    .sort()
    .pop()

  // Variation du jour rapportée au capital de départ de la journée
  const equity = portfolio?.equity ?? null
  const todayPnl = risk?.todayPnl ?? null
  const todayPct =
    equity != null && todayPnl != null && equity - todayPnl !== 0
      ? (todayPnl / (equity - todayPnl)) * 100
      : null

  const winRatePct = allTime ? allTime.winRate * 100 : null
  const winners    = allTime ? Math.round(allTime.winRate * allTime.nbTrades) : null
  const losers     = allTime && winners != null ? allTime.nbTrades - winners : null

  const drawdownPct = allTime?.maxDrawdown != null ? Math.abs(allTime.maxDrawdown * 100) : null
  const consecutive = risk?.consecutiveLosses ?? null

  const riskState =
    drawdownPct == null
      ? { label: '—', tone: 'text-muted-foreground' }
      : drawdownPct <= 5 && (consecutive ?? 0) < 3
        ? { label: 'Sous contrôle', tone: 'text-green-500' }
        : drawdownPct <= 12 && (consecutive ?? 0) < 5
          ? { label: 'À surveiller', tone: 'text-amber-500' }
          : { label: 'Risque élevé', tone: 'text-red-500' }

  const loading = portfolioLoading || allLoading

  return (
    <div className="brand-glow space-y-4">
      {/* Ligne d'état — les filtres de période sont alignés à droite */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-sm">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              activeAccounts.length > 0 ? 'bg-green-500' : 'bg-muted-foreground',
            )}
          />
          <span className="text-muted-foreground">Statut :</span>
          <span className="font-medium text-foreground">
            {activeAccounts.length > 0
              ? `${activeAccounts.length} compte${activeAccounts.length > 1 ? 's' : ''} connecté${activeAccounts.length > 1 ? 's' : ''}`
              : 'Aucun compte connecté'}
          </span>
        </span>
        <span className="hidden h-4 w-px bg-border sm:block" />
        <span className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Dernière synchro :{' '}
          <span className="font-medium text-foreground">
            {lastSync ? relativeTime(lastSync) : 'jamais'}
          </span>
        </span>

        {actions && <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{actions}</div>}
      </div>

      {/* Les quatre KPI d'entrée */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <>
            <KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
          </>
        ) : (
          <>
            {/* 1 — Valeur du portefeuille */}
            <KpiCard>
              <KpiLabel>Valeur du portefeuille</KpiLabel>
              <KpiValue>{equity == null ? '—' : formatMoney(equity, { currency })}</KpiValue>
              {todayPct != null ? (
                <KpiBadge value={todayPct} suffix="aujourd’hui" format={v => formatPercent(v, 2)} />
              ) : (
                <KpiSubMetrics
                  items={[
                    { label: 'Solde', value: portfolio ? formatMoney(portfolio.balance, { currency }) : '—' },
                  ]}
                />
              )}
            </KpiCard>

            {/* 2 — Profit total */}
            <KpiCard>
              <KpiLabel>Profit total</KpiLabel>
              <KpiValue className={(allTime?.totalPnl ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}>
                {allTime == null ? '—' : formatMoney(allTime.totalPnl, { currency, signed: true })}
              </KpiValue>
              <KpiSubMetrics
                items={[
                  {
                    label: 'Mensuel',
                    value: monthly ? formatMoney(monthly.totalPnl, { currency, signed: true }) : '—',
                    ...(monthly ? { tone: monthly.totalPnl >= 0 ? 'up' as const : 'down' as const } : {}),
                  },
                  {
                    label: 'Hebdo',
                    value: weekly ? formatMoney(weekly.totalPnl, { currency, signed: true }) : '—',
                    ...(weekly ? { tone: weekly.totalPnl >= 0 ? 'up' as const : 'down' as const } : {}),
                  },
                ]}
              />
            </KpiCard>

            {/* 3 — Win rate */}
            <KpiCard>
              <KpiLabel>Win rate</KpiLabel>
              <KpiValue>{winRatePct == null ? '—' : formatPercent(winRatePct)}</KpiValue>
              <KpiSubMetrics
                items={[
                  { label: 'Gagnants', value: winners == null ? '—' : String(winners), tone: 'up' },
                  { label: 'Perdants', value: losers == null ? '—' : String(losers), tone: 'down' },
                ]}
              />
            </KpiCard>

            {/* 4 — État du risque */}
            <KpiCard>
              <KpiLabel>État du risque</KpiLabel>
              <KpiValue className={riskState.tone}>{riskState.label}</KpiValue>
              <KpiSubMetrics
                items={[
                  { label: 'Drawdown', value: drawdownPct == null ? '—' : `-${formatPercent(drawdownPct)}` },
                  { label: 'Pertes consécutives', value: consecutive == null ? '—' : String(consecutive) },
                ]}
              />
            </KpiCard>
          </>
        )}
      </div>
    </div>
  )
}
