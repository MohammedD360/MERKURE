'use client'

import { useState } from 'react'
import { ShieldAlert, AlertTriangle } from 'lucide-react'
import { useRiskStatus, useUpdateRisk } from '@/lib/hooks/use-risk'

function PnlValue({ value }: { value: number }) {
  const positive = value >= 0
  return (
    <span className={positive ? 'text-emerald-600' : 'text-red-500'}>
      {positive ? '+' : ''}
      {value.toFixed(2)}€
    </span>
  )
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-[hsl(var(--accent))]" />
        ))}
      </div>
      <div className="h-10 rounded-lg bg-[hsl(var(--accent))]" />
    </div>
  )
}

export function RiskPanel() {
  const { data, isLoading } = useRiskStatus()
  const mutation = useUpdateRisk()

  const [localRisk, setLocalRisk] = useState<number | null>(null)

  const currentRisk = data?.riskPerTrade ?? 1
  const displayedRisk = localRisk ?? currentRisk
  const isDirty = localRisk !== null && localRisk !== currentRisk

  function handleSave() {
    if (localRisk === null) return
    mutation.mutate(localRisk, {
      onSuccess: () => setLocalRisk(null),
    })
  }

  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm lg:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Contrôle</p>
          <h3 className="mt-1 text-base font-black text-foreground">Gestion du risque</h3>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-500">
          <ShieldAlert className="h-4 w-4" />
        </div>
      </div>

      {isLoading || !data ? (
        <Skeleton />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-border bg-white p-3">
              <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">P&L du jour</p>
              <p className="text-sm font-bold">
                <PnlValue value={data.todayPnl} />
              </p>
            </div>

            <div className="rounded-md border border-border bg-white p-3">
              <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Trades aujourd&apos;hui</p>
              <p className="text-sm font-bold text-foreground">{data.todayTrades}</p>
            </div>

            <div className="rounded-md border border-border bg-white p-3">
              <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">Pertes consécutives</p>
              <p className={`text-sm font-bold ${data.consecutiveLosses >= 3 ? 'text-red-500' : 'text-emerald-600'}`}>
                {data.consecutiveLosses}
              </p>
            </div>

            <div className="rounded-md border border-border bg-white p-3">
              <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">P&L 7 jours</p>
              <p className="text-sm font-bold">
                <PnlValue value={data.weeklyPnl} />
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Risque par trade</p>
              <span className="text-sm font-bold text-foreground">{displayedRisk.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={10}
              step={0.1}
              value={displayedRisk}
              onChange={(e) => setLocalRisk(parseFloat(e.target.value))}
              className="w-full accent-red-500"
            />
            {isDirty && (
              <button
                type="button"
                onClick={handleSave}
                disabled={mutation.isPending}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-500 transition-colors hover:bg-red-100 disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                ) : null}
                Enregistrer
              </button>
            )}
          </div>

          {data.alerts.length > 0 ? (
            <div className="space-y-2">
              {data.alerts.map((alert, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2.5"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                  <p className="text-[11px] text-red-600">{alert}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-600">Tout est normal</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
