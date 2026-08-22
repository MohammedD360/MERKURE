'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { useRevengeTradingAlerts } from '@/lib/hooks/use-performance'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'
import { PlanGateBanner } from '@/shared/components/PlanGateBanner'

interface Props {
  period:     KpiPeriod
  accountId?: string
}

const BADGE_STYLES: Record<'fast_reentry' | 'lot_increase' | 'both', string> = {
  fast_reentry: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  lot_increase: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  both:         'bg-red-500/10 text-red-500 border-red-500/30',
}

const BADGE_LABELS: Record<'fast_reentry' | 'lot_increase' | 'both', string> = {
  fast_reentry: 'Ré-entrée rapide',
  lot_increase: 'Hausse lotSize',
  both:         'Les deux',
}

export function RevengeTradingPanel({ period }: Props) {
  const [timeThreshold, setTimeThreshold] = useState(30)
  const [lotPct, setLotPct]               = useState(20)

  const query = useRevengeTradingAlerts(
    period,
    { timeThresholdMin: timeThreshold, lotIncreasePct: lotPct },
  )

  const alerts = query.data ?? []

  return (
    <PlanGateBanner required="PRO" featureName="Détection Revenge Trading">
      <div className="space-y-4 rounded-lg border border-border bg-background p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <h2 className="text-sm font-semibold text-foreground">Revenge Trading</h2>
          {alerts.length > 0 && (
            <span className="ml-auto rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-500">
              {alerts.length} alerte{alerts.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--accent))] p-3 sm:grid-cols-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Seuil temps entre trades</span>
              <span className="tabular-nums font-semibold text-[hsl(var(--primary))]">{timeThreshold} min</span>
            </div>
            <input
              type="range"
              min={1}
              max={120}
              value={timeThreshold}
              onChange={(e) => setTimeThreshold(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer rounded-full accent-[hsl(var(--primary))]"
            />
            <div className="flex justify-between text-xs text-muted-foreground/60">
              <span>1 min</span>
              <span>120 min</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Augmentation lotSize min.</span>
              <span className="tabular-nums font-semibold text-[hsl(var(--primary))]">{lotPct} %</span>
            </div>
            <input
              type="range"
              min={5}
              max={200}
              value={lotPct}
              onChange={(e) => setLotPct(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer rounded-full accent-[hsl(var(--primary))]"
            />
            <div className="flex justify-between text-xs text-muted-foreground/60">
              <span>5 %</span>
              <span>200 %</span>
            </div>
          </div>
        </div>

        {query.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-accent/70" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-500">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>Aucun comportement de revenge trading détecté</span>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-background px-3 py-2.5"
              >
                <span className={`text-xs font-bold border px-2 py-0.5 rounded-full shrink-0 ${BADGE_STYLES[alert.type]}`}>
                  {BADGE_LABELS[alert.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground tabular-nums">{alert.symbol}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.openTime).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{alert.minutesBetweenTrades} min entre trades</span>
                    <span className="text-orange-600 tabular-nums">
                      Lots : {alert.prevLotSize.toFixed(2)} → {alert.currLotSize.toFixed(2)}
                      <span className="ml-1 text-orange-500">(+{alert.lotSizeDelta.toFixed(2)})</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PlanGateBanner>
  )
}
