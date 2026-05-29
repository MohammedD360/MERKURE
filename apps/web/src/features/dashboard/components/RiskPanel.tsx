'use client'

import { useState } from 'react'
import { ShieldAlert, AlertTriangle } from 'lucide-react'
import { useRiskStatus, useUpdateRisk } from '@/lib/hooks/use-risk'

function PnlValue({ value }: { value: number }) {
  const positive = value >= 0
  return (
    <span className={positive ? 'text-[#38e476]' : 'text-[#ff5e70]'}>
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
          <div key={i} className="h-16 rounded-lg bg-white/[0.04]" />
        ))}
      </div>
      <div className="h-10 rounded-lg bg-white/[0.04]" />
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
    <div className="rounded-lg border border-slate-800 bg-[#0b111c] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.18)] lg:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Contrôle</p>
          <h3 className="mt-1 text-base font-black text-white">Gestion du risque</h3>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-red-400/20 bg-red-400/10 text-red-300">
          <ShieldAlert className="h-4 w-4" />
        </div>
      </div>

      {isLoading || !data ? (
        <Skeleton />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-slate-800 bg-[#071017] p-3">
              <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">P&L du jour</p>
              <p className="text-sm font-bold">
                <PnlValue value={data.todayPnl} />
              </p>
            </div>

            <div className="rounded-md border border-slate-800 bg-[#071017] p-3">
              <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">Trades aujourd&apos;hui</p>
              <p className="text-sm font-bold text-white">{data.todayTrades}</p>
            </div>

            <div className="rounded-md border border-slate-800 bg-[#071017] p-3">
              <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">Pertes consécutives</p>
              <p className={`text-sm font-bold ${data.consecutiveLosses >= 3 ? 'text-[#ff5e70]' : 'text-[#38e476]'}`}>
                {data.consecutiveLosses}
              </p>
            </div>

            <div className="rounded-md border border-slate-800 bg-[#071017] p-3">
              <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">P&L 7 jours</p>
              <p className="text-sm font-bold">
                <PnlValue value={data.weeklyPnl} />
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Risque par trade</p>
              <span className="text-sm font-bold text-white">{displayedRisk.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={10}
              step={0.1}
              value={displayedRisk}
              onChange={(e) => setLocalRisk(parseFloat(e.target.value))}
              className="w-full accent-[#ff5e70]"
            />
            {isDirty && (
              <button
                type="button"
                onClick={handleSave}
                disabled={mutation.isPending}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-md border border-[#ff5e70]/20 bg-[#ff5e70]/10 px-3 py-2 text-xs font-black text-[#ff5e70] transition-colors hover:bg-[#ff5e70]/20 disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#ff5e70] border-t-transparent" />
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
                  className="flex items-start gap-2 rounded-md border border-[#ff5e70]/20 bg-[#ff5e70]/10 p-2.5"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#ff5e70]" />
                  <p className="text-[11px] text-red-300">{alert}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-md border border-[#38e476]/20 bg-[#38e476]/10 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#38e476]" />
              <span className="text-[10px] font-semibold text-[#38e476]">Tout est normal</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
