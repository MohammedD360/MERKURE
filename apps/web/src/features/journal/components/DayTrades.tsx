'use client'

import { useState } from 'react'
import { ChevronDown, Loader2, Tag } from 'lucide-react'
import type { Trade } from '@/lib/hooks/use-trades'
import { useAnnotateTrade } from '@/lib/hooks/use-trades'
import { useCurrency } from '@/lib/hooks/use-currency'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Gabarit de colonnes partagé par l'en-tête et les lignes.
 * Sous xl, les colonnes Entrée/Sortie sont masquées (`hidden xl:block`) :
 * la carte fait ~790px dans la colonne principale, les 9 colonnes n'y tiennent pas.
 */
const COLS =
  'grid items-center grid-cols-[36px_72px_minmax(76px,1fr)_86px_64px_minmax(96px,1.1fr)_112px]' +
  ' xl:grid-cols-[40px_80px_minmax(90px,1fr)_92px_72px_96px_96px_minmax(110px,1.1fr)_120px]'

function hhmm(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function price(value: string | null): string {
  if (value == null) return '—'
  const n = Number(value)
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 5 })
}

/** Ligne dépliable : annotation du trade (setup + note), façon Tradervue. */
function TradeAnnotation({ trade, onDone }: { trade: Trade; onDone: () => void }) {
  const annotate = useAnnotateTrade()
  const [strategyTag, setStrategyTag] = useState(trade.strategyTag ?? '')
  const [note, setNote] = useState(trade.note ?? '')

  const dirty = strategyTag !== (trade.strategyTag ?? '') || note !== (trade.note ?? '')

  return (
    <div className="space-y-3 border-t border-border bg-background/40 p-4">
      <div className="grid gap-3 sm:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground" htmlFor={`tag-${trade.id}`}>
            Setup / stratégie
          </label>
          <input
            id={`tag-${trade.id}`}
            value={strategyTag}
            onChange={e => setStrategyTag(e.target.value)}
            placeholder="Breakout, pullback, news…"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground" htmlFor={`note-${trade.id}`}>
            Note d'exécution
          </label>
          <textarea
            id={`note-${trade.id}`}
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            placeholder="Raison d'entrée, gestion, ce qui a marché ou non…"
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          Fermer
        </button>
        <button
          type="button"
          disabled={!dirty || annotate.isPending}
          onClick={() => annotate.mutate({ id: trade.id, strategyTag, note }, { onSuccess: onDone })}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {annotate.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer
        </button>
      </div>
    </div>
  )
}

export function DayTrades({ trades, isLoading }: { trades: Trade[]; isLoading: boolean }) {
  const currency = useCurrency()
  const [openId, setOpenId] = useState<string | null>(null)

  const sorted = [...trades].sort(
    (a, b) => new Date(a.closeTime ?? a.openTime).getTime() - new Date(b.closeTime ?? b.openTime).getTime(),
  )

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-foreground">Trades de la séance</h3>
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Chargement…' : `${sorted.length} trade${sorted.length > 1 ? 's' : ''} clôturé${sorted.length > 1 ? 's' : ''} ce jour`}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-11 animate-pulse rounded-md bg-secondary" />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
          <p className="text-sm font-medium text-foreground">Aucun trade ce jour</p>
          <p className="text-sm text-muted-foreground">
            Les trades synchronisés apparaîtront ici, avec leurs annotations.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <div className="min-w-[560px]">
            {/* En-tête — même gabarit de colonnes que les lignes */}
            <div className={cn(COLS, 'border-b border-border py-2.5 text-sm text-muted-foreground')}>
              <span />
              <span className="px-3">Heure</span>
              <span className="px-3">Symbole</span>
              <span className="px-3">Sens</span>
              <span className="px-3 text-right">Lots</span>
              <span className="hidden px-3 text-right xl:block">Entrée</span>
              <span className="hidden px-3 text-right xl:block">Sortie</span>
              <span className="px-3">Setup</span>
              <span className="px-3 text-right">P&L</span>
            </div>

            {sorted.map(t => {
              const pnl = t.pnl == null ? null : Number(t.pnl)
              const open = openId === t.id
              return (
                <div
                  key={t.id}
                  className={cn('border-b border-border last:border-0 transition-colors', open ? 'bg-secondary/40' : 'hover:bg-secondary/30')}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : t.id)}
                    className={cn(COLS, 'w-full py-2.5 text-left text-sm')}
                    aria-expanded={open}
                  >
                    <span className="flex justify-center text-muted-foreground">
                      <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
                    </span>
                    <span className="px-3 tabular-nums text-muted-foreground">{hhmm(t.closeTime)}</span>
                    <span className="truncate px-3 font-medium text-foreground">{t.symbol}</span>
                    <span className="px-3">
                      <span className={cn(
                        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                        t.direction === 'LONG'
                          ? 'border-green-500/30 bg-green-500/10 text-green-500'
                          : 'border-red-500/30 bg-red-500/10 text-red-500',
                      )}>
                        {t.direction === 'LONG' ? 'Achat' : 'Vente'}
                      </span>
                    </span>
                    <span className="px-3 text-right tabular-nums text-muted-foreground">
                      {Number(t.lotSize).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                    </span>
                    <span className="hidden px-3 text-right tabular-nums text-muted-foreground xl:block">{price(t.openPrice)}</span>
                    <span className="hidden px-3 text-right tabular-nums text-muted-foreground xl:block">{price(t.closePrice)}</span>
                    <span className="min-w-0 px-3">
                      {t.strategyTag ? (
                        <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                          <Tag className="h-3 w-3 shrink-0" />
                          <span className="truncate">{t.strategyTag}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">à taguer</span>
                      )}
                    </span>
                    <span className={cn(
                      'px-3 text-right font-medium tabular-nums',
                      pnl == null ? 'text-muted-foreground' : pnl >= 0 ? 'text-green-500' : 'text-red-500',
                    )}>
                      {pnl == null ? '—' : formatMoney(pnl, { currency, signed: true })}
                    </span>
                  </button>

                  {open && <TradeAnnotation trade={t} onDone={() => setOpenId(null)} />}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
