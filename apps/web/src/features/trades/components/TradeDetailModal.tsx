'use client'

import { useState, useEffect } from 'react'
import { X, ArrowUpRight, ArrowDownRight, Clock, Tag, FileText, Trash2 } from 'lucide-react'
import { useTrade, useAnnotateTrade, useDeleteTrade } from '@/lib/hooks/use-trades'

interface Props {
  tradeId: string | null
  onClose: () => void
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))] last:border-0">
      <span className="text-xs text-[hsl(var(--foreground-soft))]">{label}</span>
      <span className="text-xs text-foreground font-mono">{value}</span>
    </div>
  )
}

function fmtDate(d: string | null) {
  if (!d) return <span className="text-[hsl(var(--foreground-soft))]/50 flex items-center gap-1"><Clock className="w-3 h-3" />En cours</span>
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function fmtPnl(pnl: string | null) {
  if (pnl == null) return '—'
  const n = Number(pnl)
  return (
    <span className={n >= 0 ? 'text-emerald-600' : 'text-red-500'}>
      {n >= 0 ? '+' : ''}{n.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
    </span>
  )
}

export function TradeDetailModal({ tradeId, onClose }: Props) {
  const { data: trade, isLoading } = useTrade(tradeId)
  const { mutate: annotate, isPending } = useAnnotateTrade()
  const { mutate: deleteTrade, isPending: isDeleting } = useDeleteTrade()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [strategyTag, setStrategyTag] = useState('')
  const [note, setNote]               = useState('')

  useEffect(() => {
    if (trade) {
      setStrategyTag(trade.strategyTag ?? '')
      setNote(trade.note ?? '')
    }
  }, [trade])

  if (!tradeId) return null

  const handleSave = () => {
    if (!trade) return
    annotate(
      { id: trade.id, ...(strategyTag ? { strategyTag } : {}), ...(note ? { note } : {}) },
      { onSuccess: onClose },
    )
  }

  const direction = trade?.direction

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white border border-[hsl(var(--border))] rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            {trade && (
              <>
                <div className="w-9 h-9 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center text-xs font-bold text-[hsl(var(--foreground-soft))]">
                  {trade.symbol.slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">{trade.symbol}</h2>
                  <div className={`inline-flex items-center gap-1 text-xs font-medium mt-0.5 ${direction === 'LONG' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {direction === 'LONG' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {direction}
                  </div>
                </div>
              </>
            )}
            {isLoading && <div className="animate-pulse bg-[hsl(var(--accent))] rounded h-9 w-32" />}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground-soft))] hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-5 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-[hsl(var(--accent))] rounded h-6" />
              ))}
            </div>
          ) : trade ? (
            <>
              {/* Données broker */}
              <div className="bg-[hsl(var(--accent))] rounded-xl p-4">
                <Row label="Ouverture"    value={fmtDate(trade.openTime)} />
                <Row label="Fermeture"   value={fmtDate(trade.closeTime)} />
                <Row label="Prix open"   value={Number(trade.openPrice).toFixed(5)} />
                <Row label="Prix close"  value={trade.closePrice ? Number(trade.closePrice).toFixed(5) : '—'} />
                <Row label="Lots"        value={Number(trade.lotSize).toFixed(2)} />
                <Row label="P&L"         value={fmtPnl(trade.pnl)} />
                <Row label="Swap"        value={Number(trade.swap).toFixed(2)} />
                <Row label="Commission"  value={Number(trade.commission).toFixed(2)} />
                <Row label="Statut"      value={
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${trade.status === 'OPEN' ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.25)]' : 'bg-[hsl(var(--accent))] text-[hsl(var(--foreground-soft))] border border-[hsl(var(--border))]'}`}>
                    {trade.status === 'OPEN' ? 'Live' : 'Clôturé'}
                  </span>
                } />
              </div>

              {/* Annotation */}
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[hsl(var(--foreground-soft))] uppercase tracking-wider mb-1.5">
                    <Tag className="w-3 h-3" /> Stratégie
                  </label>
                  <input
                    type="text"
                    value={strategyTag}
                    onChange={e => setStrategyTag(e.target.value)}
                    placeholder="ex: Breakout M15, Scalp news…"
                    maxLength={100}
                    className="w-full bg-white border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-xs text-foreground placeholder-[hsl(var(--foreground-soft))]/50 focus:outline-none focus:border-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[hsl(var(--foreground-soft))] uppercase tracking-wider mb-1.5">
                    <FileText className="w-3 h-3" /> Note
                  </label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Contexte, erreurs, leçons apprises…"
                    maxLength={2000}
                    rows={3}
                    className="w-full bg-white border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-xs text-foreground placeholder-[hsl(var(--foreground-soft))]/50 focus:outline-none focus:border-[hsl(var(--primary))] resize-none"
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 pb-5">
          {/* Suppression */}
          {trade && (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500">Confirmer la suppression ?</span>
                <button
                  onClick={() => deleteTrade(trade.id, { onSuccess: onClose })}
                  disabled={isDeleting}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                >
                  {isDeleting ? '…' : 'Oui, supprimer'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[hsl(var(--foreground-soft))] hover:bg-[hsl(var(--accent))] transition-colors"
                >
                  Non
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer
              </button>
            )
          )}
          {!trade && <span />}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-[hsl(var(--foreground-soft))] hover:text-foreground hover:bg-[hsl(var(--accent))] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || isLoading || !trade}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-[hsl(var(--primary))] hover:bg-[hsl(244_42%_44%)] text-white transition-colors disabled:opacity-50"
            >
              {isPending ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
