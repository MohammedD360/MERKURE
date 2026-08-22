'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Check, Flame, Focus, Frown, Loader2, Meh, Rocket, Smile, ThumbsUp, Trash2,
  type LucideIcon,
} from 'lucide-react'
import { useJournalEntry, useUpsertJournalEntry, useDeleteJournalEntry } from '@/lib/hooks/use-journal'
import { cn } from '@/lib/utils'

/** Clés inchangées (compatibilité base) — icônes lucide au lieu des emojis. */
const MOODS: Array<{ key: string; label: string; icon: LucideIcon }> = [
  { key: 'serein',      label: 'Serein',      icon: Smile },
  { key: 'concentre',   label: 'Concentré',   icon: Focus },
  { key: 'confiant',    label: 'Confiant',    icon: ThumbsUp },
  { key: 'neutre',      label: 'Neutre',      icon: Meh },
  { key: 'stresse',     label: 'Stressé',     icon: Flame },
  { key: 'surconfiant', label: 'Surconfiant', icon: Rocket },
  { key: 'craintif',    label: 'Craintif',    icon: Frown },
]

const FIELDS: Array<{ key: 'planBefore' | 'notes' | 'reviewAfter'; label: string; hint: string; placeholder: string; rows: number }> = [
  {
    key: 'planBefore',
    label: 'Plan pré-marché',
    hint: 'Écrit avant la séance — c’est lui qui sert de référence à la revue.',
    placeholder: 'Instruments surveillés, niveaux clés, biais directionnel, conditions d’entrée, risque max de la journée…',
    rows: 4,
  },
  {
    key: 'notes',
    label: 'Notes de séance',
    hint: 'Au fil de l’eau : contexte marché, setups vus, hésitations.',
    placeholder: 'Ouverture nerveuse, setup raté sur EURUSD faute de confirmation, news 14h30…',
    rows: 3,
  },
  {
    key: 'reviewAfter',
    label: 'Revue & leçons',
    hint: 'Après clôture — ce que vous refaites demain, ce que vous arrêtez.',
    placeholder: 'Plan respecté ? Qu’est-ce qui a coûté le plus cher ? Une règle à ajouter ?',
    rows: 4,
  },
]

const AUTOSAVE_DELAY = 900

interface Props {
  date: string
}

export function JournalEntryEditor({ date }: Props) {
  const { data: entry, isLoading } = useJournalEntry(date)
  const upsert = useUpsertJournalEntry()
  const del    = useDeleteJournalEntry()

  const [mood,        setMood]        = useState<string | null>(null)
  const [planBefore,  setPlanBefore]  = useState('')
  const [reviewAfter, setReviewAfter] = useState('')
  const [notes,       setNotes]       = useState('')
  const [savedAt,     setSavedAt]     = useState<string | null>(null)

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dirty = useRef(false)

  // Rechargement du formulaire quand l'entrée arrive ou que le jour change
  useEffect(() => {
    setMood(entry?.mood ?? null)
    setPlanBefore(entry?.planBefore ?? '')
    setReviewAfter(entry?.reviewAfter ?? '')
    setNotes(entry?.notes ?? '')
    dirty.current = false
  }, [entry, date])

  // Un seul timer en vol, annulé au démontage / changement de jour
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [date])

  const scheduleSave = useCallback(
    (payload: { mood: string | null; planBefore: string; reviewAfter: string; notes: string }) => {
      dirty.current = true
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        upsert.mutate(
          {
            date,
            data: {
              mood: payload.mood,
              planBefore:  payload.planBefore  || null,
              reviewAfter: payload.reviewAfter || null,
              notes:       payload.notes       || null,
            },
          },
          {
            onSuccess: () => {
              dirty.current = false
              setSavedAt(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
            },
          },
        )
      }, AUTOSAVE_DELAY)
    },
    [date, upsert],
  )

  const update = (patch: Partial<{ mood: string | null; planBefore: string; reviewAfter: string; notes: string }>) => {
    const next = { mood, planBefore, reviewAfter, notes, ...patch }
    if (patch.mood !== undefined)        setMood(patch.mood)
    if (patch.planBefore !== undefined)  setPlanBefore(patch.planBefore)
    if (patch.reviewAfter !== undefined) setReviewAfter(patch.reviewAfter)
    if (patch.notes !== undefined)       setNotes(patch.notes)
    scheduleSave(next)
  }

  const values = { planBefore, notes, reviewAfter }

  const handleDelete = () => {
    if (!confirm('Supprimer l’entrée de journal de ce jour ?')) return
    if (timer.current) clearTimeout(timer.current)
    del.mutate(date, {
      onSuccess: () => {
        setMood(null); setPlanBefore(''); setReviewAfter(''); setNotes('')
        dirty.current = false
        setSavedAt(null)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-secondary" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-md bg-secondary" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-foreground">Journal de la séance</h3>
          <p className="text-sm text-muted-foreground">Plan, notes et revue — enregistrement automatique</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {upsert.isPending ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Enregistrement…</>
            ) : savedAt ? (
              <><Check className="h-3.5 w-3.5 text-green-500" /> Enregistré à {savedAt}</>
            ) : entry ? (
              <>Modifié à {new Date(entry.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</>
            ) : null}
          </span>
          {entry && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={del.isPending}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
              aria-label="Supprimer l’entrée"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* État d'esprit */}
      <div className="mb-6">
        <p className="mb-2 text-sm text-muted-foreground">État d’esprit</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(m => {
            const Icon = m.icon
            const active = mood === m.key
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => update({ mood: active ? null : m.key })}
                aria-pressed={active}
                className={cn(
                  'inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors',
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Plan / notes / revue */}
      <div className="space-y-5">
        {FIELDS.map(f => (
          <div key={f.key}>
            <label htmlFor={`journal-${f.key}`} className="block text-sm font-medium text-foreground">
              {f.label}
            </label>
            <p className="mb-2 text-xs text-muted-foreground">{f.hint}</p>
            <textarea
              id={`journal-${f.key}`}
              value={values[f.key]}
              onChange={e => update({ [f.key]: e.target.value })}
              rows={f.rows}
              placeholder={f.placeholder}
              className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
