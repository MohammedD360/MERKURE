'use client'

import { ArrowRight } from 'lucide-react'
import { PROP_FIRMS, type PropFirm } from '../data/prop-firms'
import { cn } from '@/lib/utils'

export function FirmLogo({ id, size = 'md' }: { id: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'h-14 w-14 text-lg' : size === 'sm' ? 'h-8 w-8 text-[10px]' : 'h-11 w-11 text-xs'
  const bg = id === 'ftmo' ? '#1a1a2e' : '#0f4c75'
  const label = id === 'ftmo' ? 'FTMO' : 'APEX'
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-xl font-black tracking-tight text-white', sz)}
      style={{ background: bg }}
    >
      {label}
    </div>
  )
}

function FirmCard({ firm, selected, onSelect }: { firm: PropFirm; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative w-full rounded-xl border-2 bg-white p-5 text-left transition-all duration-200',
        selected
          ? 'border-[hsl(var(--primary))] shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]'
          : 'border-border hover:border-[hsl(var(--primary)/0.4)] hover:shadow-sm',
      )}
    >
      {selected && (
        <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))]">
          <svg viewBox="0 0 12 10" className="h-3 w-3 fill-none stroke-white stroke-2">
            <path d="M1 5l3 4L11 1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}

      <div className="flex items-start gap-4">
        <FirmLogo id={firm.id} />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-black text-foreground">{firm.name}</h3>
          <p className="mt-0.5 text-xs font-semibold text-[hsl(var(--primary))]">{firm.tagline}</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{firm.description}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {firm.stats.map(s => (
          <div key={s.label} className="rounded-lg bg-[hsl(var(--accent))] px-3 py-2">
            <p className="text-[10px] font-semibold text-muted-foreground">{s.label}</p>
            <p className="mt-0.5 text-xs font-black text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground">
          {firm.challenges.length} challenge{firm.challenges.length > 1 ? 's' : ''} disponible{firm.challenges.length > 1 ? 's' : ''}
        </span>
        <span className={cn(
          'inline-flex items-center gap-1 text-[11px] font-bold transition-colors',
          selected ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground group-hover:text-[hsl(var(--primary))]',
        )}>
          Sélectionner <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </button>
  )
}

interface Props {
  selectedFirmId: string | null
  onSelect: (firmId: string) => void
  onNext: () => void
}

export function StepFirmSelect({ selectedFirmId, onSelect, onNext }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-foreground">Choisissez votre Prop Firm</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sélectionnez la prop firm avec laquelle vous réalisez votre challenge.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {PROP_FIRMS.map(firm => (
          <FirmCard
            key={firm.id}
            firm={firm}
            selected={selectedFirmId === firm.id}
            onSelect={() => onSelect(firm.id)}
          />
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={!selectedFirmId}
          onClick={onNext}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-6 text-sm font-bold text-white shadow-[0_4px_14px_hsl(244_42%_51%/0.25)] transition-colors hover:bg-[hsl(244_42%_44%)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Suivant <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
