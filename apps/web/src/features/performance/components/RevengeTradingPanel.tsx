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
  fast_reentry: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  lot_increase: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  both:         'bg-red-500/15 text-red-400 border-red-500/30',
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
      <div className="bg-[#111827] border border-gray-800/60 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-semibold text-white">Revenge Trading</h2>
          {alerts.length > 0 && (
            <span className="ml-auto text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
              {alerts.length} alerte{alerts.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#090d14] border border-gray-800/40 rounded-lg p-3">
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">Seuil temps entre trades</span>
              <span className="text-indigo-400 font-mono font-medium">{timeThreshold} min</span>
            </div>
            <input
              type="range"
              min={1}
              max={120}
              value={timeThreshold}
              onChange={(e) => setTimeThreshold(Number(e.target.value))}
              className="w-full h-1.5 rounded-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>1 min</span>
              <span>120 min</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">Augmentation lotSize min.</span>
              <span className="text-indigo-400 font-mono font-medium">{lotPct} %</span>
            </div>
            <input
              type="range"
              min={5}
              max={200}
              value={lotPct}
              onChange={(e) => setLotPct(Number(e.target.value))}
              className="w-full h-1.5 rounded-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>5 %</span>
              <span>200 %</span>
            </div>
          </div>
        </div>

        {query.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse bg-gray-800/60 rounded-lg" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/5 border border-green-500/20 rounded-lg px-4 py-3">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>Aucun comportement de revenge trading détecté</span>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="flex items-center gap-3 bg-[#090d14] border border-gray-800/40 rounded-lg px-3 py-2.5"
              >
                <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full shrink-0 ${BADGE_STYLES[alert.type]}`}>
                  {BADGE_LABELS[alert.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white font-mono">{alert.symbol}</span>
                    <span className="text-[11px] text-gray-500">
                      {new Date(alert.openTime).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-400">
                    <span>{alert.minutesBetweenTrades} min entre trades</span>
                    <span className="text-orange-400 font-mono">
                      Lots : {alert.prevLotSize.toFixed(2)} → {alert.currLotSize.toFixed(2)}
                      <span className="ml-1 text-orange-300">(+{alert.lotSizeDelta.toFixed(2)})</span>
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
