'use client'

import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react'
import { getPropFirm, getChallenge } from '../data/prop-firms'
import { FirmLogo } from './StepFirmSelect'
import { cn } from '@/lib/utils'

interface FormState {
  accountType:  string
  currency:     string
  leverage:     string
  accountNumber: string
  startDate:    string
}

interface Props {
  firmId:      string
  challengeId: string
  accountSize: number
  form:        FormState
  onFormChange: (patch: Partial<FormState>) => void
  onNext:      () => void
  onBack:      () => void
}

function Select({
  label, value, options, onChange,
}: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-foreground">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-border bg-white px-3 py-2.5 pr-8 text-sm text-foreground outline-none transition-colors focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)]"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  )
}

function Input({
  label, placeholder, value, onChange, optional,
}: { label: string; placeholder: string; value: string; onChange: (v: string) => void; optional?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-foreground">
        {label}
        {optional && <span className="ml-1 text-[10px] font-normal text-muted-foreground">(optionnel)</span>}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)]"
      />
    </div>
  )
}

export function StepQuestionnaire({ firmId, challengeId, accountSize, form, onFormChange, onNext, onBack }: Props) {
  const firm      = getPropFirm(firmId)
  const challenge = getChallenge(firmId, challengeId)
  if (!firm || !challenge) return null

  const sizeInfo = challenge.sizes.find(s => s.value === accountSize)
  const canSubmit = form.accountType && form.currency && form.leverage

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      {/* ── Form ── */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-foreground">Questionnaire sur votre challenge</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Répondez à quelques questions pour personnaliser le suivi de votre challenge.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
            Informations générales
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {/* Read-only recap fields */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Prop Firm sélectionnée</label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-[hsl(var(--accent))] px-3 py-2.5">
                <FirmLogo id={firmId} size="sm" />
                <span className="text-sm font-bold text-foreground">{firm.name}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Challenge sélectionné</label>
              <div className="flex items-center justify-between rounded-lg border border-border bg-[hsl(var(--accent))] px-3 py-2.5">
                <span className="text-sm font-bold text-foreground">{challenge.name}</span>
                <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-bold', challenge.badgeColor)}>
                  {challenge.badge}
                </span>
              </div>
            </div>

            <Select
              label="Type de compte"
              value={form.accountType}
              options={challenge.accountTypes}
              onChange={v => onFormChange({ accountType: v })}
            />

            <Select
              label="Devise du compte"
              value={form.currency}
              options={challenge.currencies}
              onChange={v => onFormChange({ currency: v })}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Taille du compte</label>
              <div className="flex items-center rounded-lg border border-border bg-[hsl(var(--accent))] px-3 py-2.5">
                <span className="text-sm font-bold text-foreground">
                  {sizeInfo?.label ?? `$${accountSize.toLocaleString()}`}
                </span>
              </div>
            </div>

            <Select
              label="Effet de levier autorisé"
              value={form.leverage}
              options={challenge.leverages}
              onChange={v => onFormChange({ leverage: v })}
            />

            <Input
              label="Numéro de compte"
              placeholder="Ex : 123456789"
              value={form.accountNumber}
              onChange={v => onFormChange({ accountNumber: v })}
              optional
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">
                Date de début <span className="ml-1 text-[10px] font-normal text-muted-foreground">(optionnel)</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => onFormChange({ startDate: e.target.value })}
                className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-5 text-sm font-bold text-foreground transition-colors hover:bg-[hsl(var(--accent))]"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={onNext}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-6 text-sm font-bold text-white shadow-[0_4px_14px_hsl(244_42%_51%/0.25)] transition-colors hover:bg-[hsl(244_42%_44%)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Accéder au suivi <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Récapitulatif ── */}
      <aside className="rounded-xl border border-border bg-white p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">Récapitulatif</p>

        <div className="mt-4 flex items-center gap-3">
          <FirmLogo id={firmId} size="md" />
          <div>
            <p className="text-sm font-black text-foreground">{firm.name}</p>
            <p className="text-[11px] text-muted-foreground">{challenge.name}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {[
            { label: 'Challenge',    value: challenge.name },
            { label: 'Compte',       value: form.accountType || '—' },
            { label: 'Capital',      value: sizeInfo?.label ?? '—' },
            { label: 'Devise',       value: form.currency || '—' },
            { label: 'Levier',       value: form.leverage || '—' },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span className="text-xs font-bold text-foreground">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-[hsl(var(--primary)/0.06)] p-3 border border-[hsl(var(--primary)/0.15)]">
          <p className="text-[11px] font-bold text-[hsl(var(--primary))]">
            Partage des profits
          </p>
          <p className="mt-0.5 text-lg font-black text-[hsl(var(--primary))]">
            {sizeInfo?.profitSplit ?? '—'}%
          </p>
          <p className="text-[10px] text-muted-foreground">pour vous dès le premier paiement</p>
        </div>
      </aside>
    </div>
  )
}
