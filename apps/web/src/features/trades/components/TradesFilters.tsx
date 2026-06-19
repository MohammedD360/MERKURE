'use client'

import { Search, X } from 'lucide-react'
import type { TradesFilters } from '@/lib/hooks/use-trades'
import type { BrokerAccount } from '@/lib/hooks/use-accounts'

interface Props {
  filters:   TradesFilters
  accounts:  BrokerAccount[]
  onChange:  (f: Partial<TradesFilters>) => void
  onReset:   () => void
}

const btnBase   = 'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border'
const btnActive = 'bg-[hsl(var(--primary))] border-[hsl(var(--primary))] text-white'
const btnIdle   = 'bg-white border-[hsl(var(--border))] text-[hsl(var(--foreground-soft))] hover:text-foreground hover:bg-[hsl(var(--accent))]'

export function TradesFilters({ filters, accounts, onChange, onReset }: Props) {
  const hasActive = Boolean(
    filters.symbol || filters.direction || filters.status ||
    filters.accountId || filters.dateFrom || filters.dateTo
  )

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Recherche symbole */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--foreground-soft))] pointer-events-none" />
        <input
          type="text"
          placeholder="Symbole…"
          value={filters.symbol ?? ''}
          onChange={e => { const v = e.target.value.toUpperCase(); onChange(v ? { symbol: v, page: 1 } : { page: 1 }) }}
          className="bg-white border border-[hsl(var(--border))] rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder-[hsl(var(--foreground-soft))]/60 focus:outline-none focus:border-[hsl(var(--primary))] w-32"
        />
      </div>

      {/* Direction */}
      <div className="flex gap-1">
        {(['', 'LONG', 'SHORT'] as const).map(d => (
          <button
            key={d || 'all'}
            onClick={() => onChange({ direction: d, page: 1 })}
            className={`${btnBase} ${(filters.direction ?? '') === d ? btnActive : btnIdle}`}
          >
            {d || 'Tout'}
          </button>
        ))}
      </div>

      {/* Statut */}
      <div className="flex gap-1">
        {(['', 'CLOSED', 'OPEN'] as const).map(s => (
          <button
            key={s || 'all'}
            onClick={() => onChange({ status: s, page: 1 })}
            className={`${btnBase} ${(filters.status ?? '') === s ? btnActive : btnIdle}`}
          >
            {s === 'CLOSED' ? 'Clôturé' : s === 'OPEN' ? 'Ouvert' : 'Tout'}
          </button>
        ))}
      </div>

      {/* Compte broker */}
      {accounts.length > 0 && (
        <select
          value={filters.accountId ?? ''}
          onChange={e => { const v = e.target.value; onChange(v ? { accountId: v, page: 1 } : { page: 1 }) }}
          className="bg-white border border-[hsl(var(--border))] rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-[hsl(var(--primary))]"
        >
          <option value="">Tous les comptes</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      )}

      {/* Plage de dates */}
      <input
        type="date"
        value={filters.dateFrom?.slice(0, 10) ?? ''}
        onChange={e => { const v = e.target.value; onChange(v ? { dateFrom: `${v}T00:00:00+00:00`, page: 1 } : { page: 1 }) }}
        className="bg-white border border-[hsl(var(--border))] rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-[hsl(var(--primary))]"
      />
      <span className="text-[hsl(var(--foreground-soft))]/50 text-xs">→</span>
      <input
        type="date"
        value={filters.dateTo?.slice(0, 10) ?? ''}
        onChange={e => { const v = e.target.value; onChange(v ? { dateTo: `${v}T23:59:59+00:00`, page: 1 } : { page: 1 }) }}
        className="bg-white border border-[hsl(var(--border))] rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-[hsl(var(--primary))]"
      />

      {/* Reset */}
      {hasActive && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-red-500 hover:text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
        >
          <X className="w-3 h-3" /> Réinitialiser
        </button>
      )}
    </div>
  )
}
