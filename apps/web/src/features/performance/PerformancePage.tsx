'use client'

import { useState } from 'react'
import { format, subDays } from 'date-fns'
import { FileDown, Loader2 } from 'lucide-react'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'
import { useAccounts } from '@/lib/hooks/use-accounts'
import { api } from '@/lib/api-client'
import { DetailedStats }       from './components/DetailedStats'
import { PnlDrawdownChart }    from './components/PnlDrawdownChart'
import { SessionStats }        from './components/SessionStats'
import { WeekdayStats }        from './components/WeekdayStats'
import { HeatmapGrid }         from './components/HeatmapGrid'
import { RevengeTradingPanel } from './components/RevengeTradingPanel'

const PERIODS: { label: string; value: KpiPeriod }[] = [
  { label: '7j',  value: '7d' },
  { label: '30j', value: '30d' },
  { label: '90j', value: '90d' },
  { label: '1an', value: '1y' },
]

function kpiPeriodToDates(p: KpiPeriod): { from: string; to: string } {
  const to   = new Date()
  let   from: Date
  switch (p) {
    case '7d':  from = subDays(to, 7);   break
    case '30d': from = subDays(to, 30);  break
    case '90d': from = subDays(to, 90);  break
    case '1y':  from = subDays(to, 365); break
    default:    from = new Date('2020-01-01')
  }
  return {
    from: format(from, 'yyyy-MM-dd'),
    to:   format(to,   'yyyy-MM-dd'),
  }
}

async function downloadWeeklyPdf() {
  const monday = new Date()
  const day = monday.getDay()
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1))
  const weekStart = format(monday, 'yyyy-MM-dd')

  const blob = await api.reports.weekly(weekStart)
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `rapport-MERKURE-${weekStart}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export function PerformancePage() {
  const [period,         setPeriod]         = useState<KpiPeriod>('30d')
  const [accountId,      setAccountId]      = useState<string | undefined>(undefined)
  const [downloading,    setDownloading]    = useState(false)

  const { data: accounts = [] } = useAccounts()
  const { from, to } = kpiPeriodToDates(period)

  const handleDownload = async () => {
    setDownloading(true)
    try { await downloadWeeklyPdf() } finally { setDownloading(false) }
  }

  return (
    <div className="px-5 py-4 space-y-4">
      {/* En-tête + contrôles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-white">Performance</h1>
          <p className="text-xs text-gray-500 mt-0.5">Analyse détaillée de vos résultats de trading</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sélecteur période */}
          <div className="flex bg-[#111827] border border-gray-800/60 rounded-lg p-0.5">
            {PERIODS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  period === value
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sélecteur compte */}
          {accounts.length > 0 && (
            <select
              value={accountId ?? ''}
              onChange={(e) => setAccountId(e.target.value || undefined)}
              className="bg-[#111827] border border-gray-800/60 text-gray-300 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500/60"
            >
              <option value="">Tous les comptes</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.label}</option>
              ))}
            </select>
          )}

          {/* Export PDF */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 rounded-lg border border-[#1e2f4a] bg-[#0b1527] px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-[#263a5b] hover:text-white disabled:opacity-60"
          >
            {downloading
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <FileDown className="h-3.5 w-3.5" />
            }
            Rapport PDF
          </button>
        </div>
      </div>

      {/* Stats détaillées (full width) */}
      <DetailedStats period={period} {...accountId !== undefined ? { accountId } : {}} />

      {/* P&L & Drawdown (full width) */}
      <PnlDrawdownChart from={from} to={to} {...accountId !== undefined ? { accountId } : {}} />

      {/* Sessions + Weekdays (côte à côte) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SessionStats period={period} {...accountId !== undefined ? { accountId } : {}} />
        <WeekdayStats period={period} {...accountId !== undefined ? { accountId } : {}} />
      </div>

      {/* Heatmap (full width) */}
      <HeatmapGrid period={period} {...accountId !== undefined ? { accountId } : {}} />

      {/* Revenge Trading (full width) */}
      <RevengeTradingPanel period={period} {...accountId !== undefined ? { accountId } : {}} />
    </div>
  )
}
