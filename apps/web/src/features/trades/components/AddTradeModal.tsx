'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useCreateTrade, type CreateTradePayload } from '@/lib/hooks/use-trades'
import { useAccounts } from '@/lib/hooks/use-accounts'

interface Props {
  open:    boolean
  onClose: () => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-semibold text-[hsl(var(--foreground-soft))] uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-white border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-xs text-foreground placeholder-[hsl(var(--foreground-soft))]/50 focus:outline-none focus:border-[hsl(var(--primary))]'

function toIso(local: string) {
  if (!local) return ''
  return new Date(local).toISOString()
}

export function AddTradeModal({ open, onClose }: Props) {
  const { data: accounts = [] } = useAccounts()
  const { mutate: createTrade, isPending, error } = useCreateTrade()

  const [form, setForm] = useState({
    brokerAccountId: '',
    symbol:          '',
    direction:       'LONG' as 'LONG' | 'SHORT',
    status:          'CLOSED' as 'OPEN' | 'CLOSED',
    openTime:        '',
    closeTime:       '',
    openPrice:       '',
    closePrice:      '',
    lotSize:         '',
    pnl:             '',
    swap:            '0',
    commission:      '0',
    strategyTag:     '',
    note:            '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.brokerAccountId || !form.symbol || !form.openTime || !form.openPrice || !form.lotSize) return

    const isClosed = form.status === 'CLOSED'

    const payload: CreateTradePayload = {
      brokerAccountId: form.brokerAccountId,
      symbol:          form.symbol.toUpperCase(),
      direction:       form.direction,
      status:          form.status,
      openTime:        toIso(form.openTime),
      closeTime:       isClosed && form.closeTime ? toIso(form.closeTime) : null,
      openPrice:       Number(form.openPrice),
      closePrice:      isClosed && form.closePrice ? Number(form.closePrice) : null,
      lotSize:         Number(form.lotSize),
      pnl:             form.pnl !== '' ? Number(form.pnl) : null,
      swap:            Number(form.swap) || 0,
      commission:      Number(form.commission) || 0,
      strategyTag:     form.strategyTag || null,
      note:            form.note || null,
    }

    createTrade(payload, {
      onSuccess: () => {
        setForm({
          brokerAccountId: form.brokerAccountId,
          symbol: '', direction: 'LONG', status: 'CLOSED',
          openTime: '', closeTime: '', openPrice: '', closePrice: '',
          lotSize: '', pnl: '', swap: '0', commission: '0',
          strategyTag: '', note: '',
        })
        onClose()
      },
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white border border-[hsl(var(--border))] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
              <Plus className="w-4 h-4 text-[hsl(var(--primary))]" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Ajouter un trade</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground-soft))] hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-5 space-y-4">

            {/* Compte */}
            <Field label="Compte broker">
              <select
                required
                value={form.brokerAccountId}
                onChange={e => set('brokerAccountId', e.target.value)}
                className={inputCls}
              >
                <option value="">Sélectionner un compte…</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </Field>

            {/* Symbol + Direction */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Instrument">
                <input
                  required
                  type="text"
                  placeholder="ex: NAS100, EURUSD…"
                  value={form.symbol}
                  onChange={e => set('symbol', e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Direction">
                <select value={form.direction} onChange={e => set('direction', e.target.value as 'LONG' | 'SHORT')} className={inputCls}>
                  <option value="LONG">LONG ↑</option>
                  <option value="SHORT">SHORT ↓</option>
                </select>
              </Field>
            </div>

            {/* Statut */}
            <Field label="Statut">
              <div className="flex gap-2">
                {(['CLOSED', 'OPEN'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set('status', s)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      form.status === s
                        ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                        : 'bg-white text-[hsl(var(--foreground-soft))] border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
                    }`}
                  >
                    {s === 'CLOSED' ? 'Clôturé' : 'En cours'}
                  </button>
                ))}
              </div>
            </Field>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date ouverture">
                <input
                  required
                  type="datetime-local"
                  value={form.openTime}
                  onChange={e => set('openTime', e.target.value)}
                  className={inputCls}
                />
              </Field>
              {form.status === 'CLOSED' && (
                <Field label="Date fermeture">
                  <input
                    type="datetime-local"
                    value={form.closeTime}
                    onChange={e => set('closeTime', e.target.value)}
                    className={inputCls}
                  />
                </Field>
              )}
            </div>

            {/* Prix */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Prix d'entrée">
                <input
                  required
                  type="number"
                  step="any"
                  placeholder="0.00000"
                  value={form.openPrice}
                  onChange={e => set('openPrice', e.target.value)}
                  className={inputCls}
                />
              </Field>
              {form.status === 'CLOSED' && (
                <Field label="Prix de sortie">
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00000"
                    value={form.closePrice}
                    onChange={e => set('closePrice', e.target.value)}
                    className={inputCls}
                  />
                </Field>
              )}
            </div>

            {/* Lots + P&L */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Taille (lots/contrats)">
                <input
                  required
                  type="number"
                  step="any"
                  min="0"
                  placeholder="1"
                  value={form.lotSize}
                  onChange={e => set('lotSize', e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="P&L ($)">
                <input
                  type="number"
                  step="any"
                  placeholder="ex: 125.50 ou -80"
                  value={form.pnl}
                  onChange={e => set('pnl', e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Swap + Commission */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Swap">
                <input type="number" step="any" value={form.swap} onChange={e => set('swap', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Commission">
                <input type="number" step="any" value={form.commission} onChange={e => set('commission', e.target.value)} className={inputCls} />
              </Field>
            </div>

            {/* Stratégie */}
            <Field label="Stratégie (optionnel)">
              <input
                type="text"
                placeholder="ex: ICT Setup, Breakout M15…"
                maxLength={100}
                value={form.strategyTag}
                onChange={e => set('strategyTag', e.target.value)}
                className={inputCls}
              />
            </Field>

            {/* Note */}
            <Field label="Note (optionnel)">
              <textarea
                placeholder="Contexte, raison d'entrée, leçons…"
                maxLength={2000}
                rows={3}
                value={form.note}
                onChange={e => set('note', e.target.value)}
                className={`${inputCls} resize-none`}
              />
            </Field>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {String(error)}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 pb-5 border-t border-[hsl(var(--border))] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-[hsl(var(--foreground-soft))] hover:text-foreground hover:bg-[hsl(var(--accent))] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-[hsl(var(--primary))] hover:bg-[hsl(244_42%_44%)] text-white transition-colors disabled:opacity-50"
            >
              {isPending ? 'Ajout…' : 'Ajouter le trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
