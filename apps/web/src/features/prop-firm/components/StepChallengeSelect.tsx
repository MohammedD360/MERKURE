'use client'

import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { getPropFirm, type PropFirmChallenge } from '../data/prop-firms'
import { FirmLogo } from './StepFirmSelect'
import { cn } from '@/lib/utils'

function ChallengeCard({
  challenge,
  selected,
  onSelect,
}: {
  challenge: PropFirmChallenge
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative w-full rounded-xl border-2 bg-white p-5 text-left transition-all duration-200',
        selected
          ? 'border-[hsl(var(--primary))] shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]'
          : 'border-border hover:border-[hsl(var(--primary)/0.4)]',
      )}
    >
      {selected && (
        <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))]">
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-black text-foreground">{challenge.name}</h3>
        <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold', challenge.badgeColor)}>
          {challenge.badge}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{challenge.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {challenge.rules.slice(0, 3).map(r => (
          <span key={r.id} className="rounded-md border border-border bg-[hsl(var(--accent))] px-2 py-1 text-[10px] font-semibold text-muted-foreground">
            {r.label}: {r.limit}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span>{challenge.sizes.length} tailles disponibles</span>
        <span>·</span>
        <span>Split jusqu'à {Math.max(...challenge.sizes.map(s => s.profitSplit))}%</span>
      </div>
    </button>
  )
}

interface Props {
  firmId: string
  selectedChallengeId: string | null
  selectedSize: number | null
  onSelectChallenge: (id: string) => void
  onSelectSize: (size: number) => void
  onNext: () => void
  onBack: () => void
}

export function StepChallengeSelect({
  firmId,
  selectedChallengeId,
  selectedSize,
  onSelectChallenge,
  onSelectSize,
  onNext,
  onBack,
}: Props) {
  const firm = getPropFirm(firmId)
  if (!firm) return null

  const selectedChallenge = firm.challenges.find(c => c.id === selectedChallengeId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FirmLogo id={firmId} size="sm" />
        <div>
          <h2 className="text-xl font-black text-foreground">Choisissez votre challenge</h2>
          <p className="text-sm text-muted-foreground">{firm.name} — sélectionnez le type et la taille du compte.</p>
        </div>
      </div>

      {/* Challenge types */}
      <div className="grid gap-4 md:grid-cols-2">
        {firm.challenges.map(c => (
          <ChallengeCard
            key={c.id}
            challenge={c}
            selected={selectedChallengeId === c.id}
            onSelect={() => { onSelectChallenge(c.id); onSelectSize(0) }}
          />
        ))}
      </div>

      {/* Account size selector */}
      {selectedChallenge && (
        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
            Taille du compte
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedChallenge.sizes.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => onSelectSize(s.value)}
                className={cn(
                  'rounded-lg border px-4 py-2.5 text-sm font-bold transition-colors',
                  selectedSize === s.value
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]'
                    : 'border-border bg-[hsl(var(--accent))] text-foreground hover:border-[hsl(var(--primary)/0.4)]',
                )}
              >
                <span className="block">{s.label}</span>
                <span className="block text-[10px] font-semibold opacity-60">Frais {s.fee}$</span>
              </button>
            ))}
          </div>
          {selectedSize !== null && selectedSize > 0 && (
            <p className="mt-3 text-[11px] text-muted-foreground">
              Split des profits :{' '}
              <span className="font-bold text-emerald-600">
                {selectedChallenge.sizes.find(s => s.value === selectedSize)?.profitSplit}%
              </span>{' '}
              pour vous
            </p>
          )}
        </div>
      )}

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
          disabled={!selectedChallengeId || !selectedSize}
          onClick={onNext}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-6 text-sm font-bold text-white shadow-[0_4px_14px_hsl(244_42%_51%/0.25)] transition-colors hover:bg-[hsl(244_42%_44%)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Suivant <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
