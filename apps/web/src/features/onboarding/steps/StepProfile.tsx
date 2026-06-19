'use client'

import { TrendingUp, AlertTriangle, Globe, Clock } from 'lucide-react'
import type { ProfilePayload } from '../api'

interface Props {
  data: ProfilePayload
  onChange: (patch: Partial<ProfilePayload>) => void
}

const STYLES = [
  { id: 'SCALPER', label: 'Scalper', desc: '< 15 min par trade' },
  { id: 'DAYTRADER', label: 'Day Trader', desc: 'Clôture le soir' },
  { id: 'SWINGTRADER', label: 'Swing Trader', desc: 'Quelques jours' },
  { id: 'INVESTOR', label: 'Investisseur', desc: 'Semaines / mois' },
] as const

const RISKS = [
  { id: 'LOW', label: 'Conservateur', color: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50' },
  { id: 'MEDIUM', label: 'Modéré', color: 'text-[hsl(var(--primary))]', border: 'border-[hsl(var(--primary)/0.2)]', bg: 'bg-[hsl(var(--primary)/0.08)]' },
  { id: 'HIGH', label: 'Dynamique', color: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50' },
  { id: 'AGGRESSIVE', label: 'Agressif', color: 'text-red-500', border: 'border-red-200', bg: 'bg-red-50' },
] as const

const MARKETS = ['Forex', 'Indices', 'Crypto', 'Actions', 'Matières premières', 'Obligations', 'Options', 'Futures']

export function StepProfile({ data, onChange }: Props) {
  const toggleMarket = (market: string) => {
    const current = data.markets ?? []
    const next = current.includes(market) ? current.filter((m) => m !== market) : [...current, market]
    onChange({ markets: next })
  }

  return (
    <div className="space-y-8">
      {/* Style de trading */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[hsl(var(--primary))]" />
          <span className="text-sm font-black text-foreground">Style de trading</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => onChange({ style: s.id })}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                data.style === s.id
                  ? 'border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.08)] ring-1 ring-[hsl(var(--primary)/0.25)]'
                  : 'border-[hsl(var(--border))] bg-background hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]'
              }`}
            >
              <p className="text-sm font-black text-foreground">{s.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Appétit au risque */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-black text-foreground">Appétit au risque</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {RISKS.map((r) => (
            <button
              key={r.id}
              onClick={() => onChange({ riskAppetite: r.id })}
              className={`p-3 rounded-xl border text-left transition-all ${
                data.riskAppetite === r.id
                  ? `${r.border} ${r.bg} ring-1 ring-current`
                  : 'border-[hsl(var(--border))] bg-background hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]'
              }`}
            >
              <p className={`text-sm font-semibold ${data.riskAppetite === r.id ? r.color : 'text-muted-foreground'}`}>
                {r.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Marchés */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-black text-foreground">Marchés tradés</span>
          <span className="text-[11px] text-muted-foreground/60">(plusieurs possibles)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {MARKETS.map((m) => {
            const active = (data.markets ?? []).includes(m)
            return (
              <button
                key={m}
                onClick={() => toggleMarket(m)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? 'border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                    : 'border-[hsl(var(--border))] text-muted-foreground hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]'
                }`}
              >
                {m}
              </button>
            )
          })}
        </div>
      </div>

      {/* Expérience */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-[hsl(var(--primary))]" />
          <span className="text-sm font-black text-foreground">Années d&apos;expérience</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[0, 1, 2, 3, 5, 7, 10, 15].map((y) => (
            <button
              key={y}
              onClick={() => onChange({ experienceYears: y })}
              className={`w-14 py-2 rounded-xl text-sm font-semibold border transition-all ${
                data.experienceYears === y
                  ? 'border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]'
                  : 'border-[hsl(var(--border))] text-muted-foreground hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]'
              }`}
            >
              {y === 15 ? '15+' : y === 0 ? '< 1' : y}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
