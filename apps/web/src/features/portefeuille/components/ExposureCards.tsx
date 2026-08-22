'use client'

import { usePortfolioSummary } from '@/lib/hooks/use-portfolio'
import { useCurrency } from '@/lib/hooks/use-currency'
import { formatMoney, formatPercent } from '@/lib/format'
import {
  KpiCard, KpiLabel, KpiSkeleton, KpiSubMetrics, KpiValue,
} from '@/shared/components/KpiCard'
import { cn } from '@/lib/utils'

/**
 * Bandeau d'entrée du portefeuille — mêmes primitives que la vue d'ensemble,
 * donc même échelle typographique : libellé 15px, valeur 32px, sous-ligne 14px.
 */
export function ExposureCards() {
  const { data, isLoading } = usePortfolioSummary()
  const currency = useCurrency()

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
      </div>
    )
  }

  const pnlOpen = data.totalPnlOpen
  const money = (v: number, signed = false) => formatMoney(v, { currency, signed })

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard>
        <KpiLabel>Équity</KpiLabel>
        <KpiValue>{money(data.equity)}</KpiValue>
        <KpiSubMetrics items={[{ label: 'Solde', value: money(data.balance) }]} />
      </KpiCard>

      <KpiCard>
        <KpiLabel>P&L flottant</KpiLabel>
        <KpiValue className={pnlOpen >= 0 ? 'text-green-500' : 'text-red-500'}>
          {money(pnlOpen, true)}
        </KpiValue>
        <KpiSubMetrics
          items={[{
            label: 'Risque engagé',
            value: formatPercent(data.riskPct),
            ...(data.riskPct > 5 ? { tone: 'down' as const } : {}),
          }]}
        />
      </KpiCard>

      <KpiCard>
        <KpiLabel>Positions ouvertes</KpiLabel>
        <KpiValue>{data.openPositionsCount}</KpiValue>
        <KpiSubMetrics
          items={[{ label: 'Exposition', value: `${data.totalExposureLots.toFixed(2)} lots` }]}
        />
      </KpiCard>

      <KpiCard>
        <KpiLabel>Capital engagé</KpiLabel>
        <KpiValue className={cn(data.riskPct > 5 && 'text-amber-500')}>
          {formatPercent(data.riskPct)}
        </KpiValue>
        <KpiSubMetrics
          items={[{ label: 'Marge libre', value: formatPercent(Math.max(0, 100 - data.riskPct)) }]}
        />
      </KpiCard>
    </div>
  )
}
