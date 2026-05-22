'use client'

import { useState, useEffect } from 'react'
import { Settings, Check, X } from 'lucide-react'
import type { KpiPeriod } from '@/lib/hooks/use-kpis'
import { KpiCards }                         from './components/KpiCards'
import { EquityChart }                       from './components/EquityChart'
import { AssetBreakdown }                    from './components/AssetBreakdown'
import { StatsCles, StrategyPerformance }    from './components/StatsAndStrategy'
import { EconomicCalendar }                  from './components/EconomicCalendar'
import { RiskPanel }                          from './components/RiskPanel'

const PERIODS: { label: string; value: KpiPeriod }[] = [
  { label: '7J',   value: '7d'  },
  { label: '30J',  value: '30d' },
  { label: '90J',  value: '90d' },
  { label: '1 AN', value: '1y'  },
  { label: 'TOUT', value: 'all' },
]

const WIDGETS = [
  { id: 'kpi',      label: 'KPIs — Performance globale' },
  { id: 'equity',   label: 'Graphique de performance' },
  { id: 'assets',   label: 'Répartition des actifs' },
  { id: 'stats',    label: 'Statistiques clés' },
  { id: 'strategy', label: 'Performance par stratégie' },
  { id: 'calendar', label: 'Calendrier économique' },
  { id: 'risk',     label: 'Gestion du risque' },
]

function loadVisibility(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('dashboard-widgets') ?? '{}') } catch { return {} }
}

export function DashboardPage() {
  const [period, setPeriod] = useState<KpiPeriod>('30d')
  const [showCheckoutBanner, setShowCheckoutBanner] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [visible, setVisible] = useState<Record<string, boolean>>(loadVisibility)

  function toggleWidget(id: string) {
    setVisible(prev => {
      const next = { ...prev, [id]: !(prev[id] ?? true) }
      localStorage.setItem('dashboard-widgets', JSON.stringify(next))
      return next
    })
  }

  const show = (id: string) => visible[id] ?? true

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('checkout') === 'success') {
        setShowCheckoutBanner(true)
        window.history.replaceState({}, '', '/app/dashboard')
      }
    }
  }, [])

  return (
    <div className="space-y-4 px-6 py-5">
      {/* ── Checkout success banner ────────────────────────────────────────── */}
      {showCheckoutBanner && (
        <div className="mx-6 mt-4 flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20">
              <Check className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300">Abonnement activé !</p>
              <p className="text-xs text-emerald-500">Votre plan est maintenant actif. Profitez de toutes les fonctionnalités.</p>
            </div>
          </div>
          <button onClick={() => setShowCheckoutBanner(false)} className="text-emerald-600 hover:text-emerald-400 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Period picker + customize button ─────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1b2a42] pt-4">
        <div className="inline-flex rounded-xl border border-[#20314d] bg-[#07101f] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`min-w-[4rem] rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                period === p.value
                  ? 'bg-[#6d4cff] text-white shadow-[0_10px_24px_rgba(109,76,255,0.32)]'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setCustomizeOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#7c5cff]/70 bg-[#7c5cff]/5 px-4 py-2.5 text-xs font-semibold text-[#b9a8ff] transition-colors hover:bg-[#7c5cff]/10"
        >
          <Settings className="h-4 w-4" />
          Personnaliser le dashboard
        </button>
      </div>

      {/* ── Widgets ───────────────────────────────────────────────────────── */}
      {show('kpi') && <KpiCards period={period} />}

      {(show('equity') || show('assets')) && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          {show('equity') && (
            <div className="xl:col-span-7 2xl:col-span-7">
              <EquityChart />
            </div>
          )}
          {show('assets') && (
            <div className={show('equity') ? 'xl:col-span-5 2xl:col-span-5' : 'xl:col-span-12'}>
              <AssetBreakdown period={period} />
            </div>
          )}
        </div>
      )}

      {(show('stats') || show('strategy') || show('calendar')) && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {show('stats')    && <StatsCles period={period} />}
          {show('strategy') && <StrategyPerformance period={period} />}
          {show('calendar') && <EconomicCalendar />}
        </div>
      )}

      {show('risk') && <RiskPanel />}

      {/* ── Customize slide-over ──────────────────────────────────────────── */}
      {customizeOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setCustomizeOpen(false)}
          />
          <div className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-[#1e2f4a] bg-[#0b1527] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e2f4a] px-6 py-5">
              <div>
                <h3 className="text-base font-bold text-white">Personnaliser</h3>
                <p className="mt-0.5 text-xs text-slate-500">Afficher ou masquer les sections</p>
              </div>
              <button
                onClick={() => setCustomizeOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-2">
                {WIDGETS.map(w => (
                  <label
                    key={w.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-[#1e2f4a] bg-[#07101f] px-4 py-3 transition-colors hover:bg-[#0d1a2d]"
                  >
                    <span className="text-sm text-slate-300">{w.label}</span>
                    <div
                      onClick={() => toggleWidget(w.id)}
                      className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
                        show(w.id) ? 'bg-[#7c5cff]' : 'bg-[#1e2f4a]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          show(w.id) ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-[#1e2f4a] px-6 py-4">
              <button
                onClick={() => {
                  const reset: Record<string, boolean> = {}
                  WIDGETS.forEach(w => { reset[w.id] = true })
                  setVisible(reset)
                  localStorage.setItem('dashboard-widgets', JSON.stringify(reset))
                }}
                className="w-full rounded-xl border border-[#1e2f4a] py-2.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-200"
              >
                Réinitialiser l&apos;affichage
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
