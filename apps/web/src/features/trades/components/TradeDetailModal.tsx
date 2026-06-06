'use client'

import { useState, useEffect } from 'react'
import { X, ArrowUpRight, ArrowDownRight, Clock, Tag, FileText } from 'lucide-react'
import { useTrade, useAnnotateTrade } from '@/lib/hooks/use-trades'

interface Props {
  tradeId: string | null
  onClose: () => void
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800/60 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs text-white font-mono">{value}</span>
    </div>
  )
}

function fmtDate(d: string | null) {
  if (!d) return <span className="text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" />En cours</span>
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function fmtPnl(pnl: string | null) {
  if (pnl == null) return '—'
  const n = Number(pnl)
  return (
    <span className={n >= 0 ? 'text-green-400' : 'text-red-400'}>
      {n >= 0 ? '+' : ''}{n.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' })}
    </span>
  )
}

export function TradeDetailModal({ tradeId, onClose }: Props) {
  const { data: trade, isLoading } = useTrade(tradeId)
  const { mutate: annotate, isPending } = useAnnotateTrade()

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-gray-700/60 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800/60">
          <div className="flex items-center gap-3">
            {trade && (
              <>
                <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-200">
                  {trade.symbol.slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">{trade.symbol}</h2>
                  <div className={`inline-flex items-center gap-1 text-xs font-medium mt-0.5 ${direction === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                    {direction === 'LONG' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {direction}
                  </div>
                </div>
              </>
            )}
            {isLoading && <div className="animate-pulse bg-gray-700 rounded h-9 w-32" />}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-5 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-800 rounded h-6" />
              ))}
            </div>
          ) : trade ? (
            <>
              {/* Données broker */}
              <div className="bg-gray-800/30 rounded-xl p-4">
                <Row label="Ouverture"    value={fmtDate(trade.openTime)} />
                <Row label="Fermeture"   value={fmtDate(trade.closeTime)} />
                <Row label="Prix open"   value={Number(trade.openPrice).toFixed(5)} />
                <Row label="Prix close"  value={trade.closePrice ? Number(trade.closePrice).toFixed(5) : '—'} />
                <Row label="Lots"        value={Number(trade.lotSize).toFixed(2)} />
                <Row label="P&L"         value={fmtPnl(trade.pnl)} />
                <Row label="Swap"        value={Number(trade.swap).toFixed(2)} />
                <Row label="Commission"  value={Number(trade.commission).toFixed(2)} />
                <Row label="Statut"      value={
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${trade.status === 'OPEN' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-gray-700 text-gray-400'}`}>
                    {trade.status === 'OPEN' ? 'Live' : 'Clôturé'}
                  </span>
                } />
              </div>

              {/* Annotation */}
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    <Tag className="w-3 h-3" /> Stratégie
                  </label>
                  <input
                    type="text"
                    value={strategyTag}
                    onChange={e => setStrategyTag(e.target.value)}
                    placeholder="ex: Breakout M15, Scalp news…"
                    maxLength={100}
                    className="w-full bg-gray-800/60 border border-gray-700/60 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    <FileText className="w-3 h-3" /> Note
                  </label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Contexte, erreurs, leçons apprises…"
                    maxLength={2000}
                    rows={3}
                    className="w-full bg-gray-800/60 border border-gray-700/60 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-foreground hover:bg-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || isLoading || !trade}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
          >
            {isPending ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
