'use client'

import { useState, useEffect } from 'react'
import { Save, Trash2, Loader2 } from 'lucide-react'
import { useJournalEntry, useUpsertJournalEntry, useDeleteJournalEntry } from '@/lib/hooks/use-journal'

const MOODS = [
  { key: 'serein',      emoji: '😌', label: 'Serein' },
  { key: 'concentre',   emoji: '💪', label: 'Concentré' },
  { key: 'confiant',    emoji: '😊', label: 'Confiant' },
  { key: 'neutre',      emoji: '😐', label: 'Neutre' },
  { key: 'stresse',     emoji: '😰', label: 'Stressé' },
  { key: 'surconfiant', emoji: '🤑', label: 'Surconfiant' },
  { key: 'craintif',    emoji: '😨', label: 'Craintif' },
]

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]
const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

function formatDateFr(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

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
  const [dirty,       setDirty]       = useState(false)

  // Sync form when entry loads or date changes
  useEffect(() => {
    setMood(entry?.mood ?? null)
    setPlanBefore(entry?.planBefore ?? '')
    setReviewAfter(entry?.reviewAfter ?? '')
    setNotes(entry?.notes ?? '')
    setDirty(false)
  }, [entry, date])

  const markDirty = () => setDirty(true)

  const handleSave = () => {
    upsert.mutate(
      { date, data: { mood, planBefore: planBefore || null, reviewAfter: reviewAfter || null, notes: notes || null } },
      { onSuccess: () => setDirty(false) },
    )
  }

  const handleDelete = () => {
    if (!confirm('Supprimer cette entrée ?')) return
    del.mutate(date, {
      onSuccess: () => {
        setMood(null); setPlanBefore(''); setReviewAfter(''); setNotes(''); setDirty(false)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Date header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white capitalize">{formatDateFr(date)}</h2>
          {entry && (
            <p className="text-[11px] text-gray-500 mt-0.5">
              Dernière mise à jour : {new Date(entry.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {entry && (
            <button
              onClick={handleDelete}
              disabled={del.isPending}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-red-400/80 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={upsert.isPending || !dirty}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              dirty
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
                : 'text-gray-600 border border-transparent cursor-default'
            }`}
          >
            {upsert.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {upsert.isPending ? 'Sauvegarde…' : dirty ? 'Sauvegarder' : 'Sauvegardé'}
          </button>
        </div>
      </div>

      {/* Mood */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Humeur du jour</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(m => (
            <button
              key={m.key}
              onClick={() => { setMood(mood === m.key ? null : m.key); markDirty() }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                mood === m.key
                  ? 'bg-indigo-500/20 text-white border border-indigo-500/40 ring-1 ring-indigo-500/20'
                  : 'text-gray-400 border border-gray-800/60 hover:border-gray-700 hover:text-foreground'
              }`}
            >
              <span className="text-sm">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plan pré-marché */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
          Plan pré-marché
        </label>
        <textarea
          value={planBefore}
          onChange={e => { setPlanBefore(e.target.value); markDirty() }}
          rows={4}
          placeholder="Quelles paires surveilles-tu ? Niveaux clés, biais directionnel, conditions d'entrée…"
          className="w-full resize-none rounded-xl border border-gray-800/60 bg-gray-900/40 px-4 py-3 text-sm text-gray-200 placeholder-gray-700 outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {/* Revue post-séance */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
          Revue post-séance
        </label>
        <textarea
          value={reviewAfter}
          onChange={e => { setReviewAfter(e.target.value); markDirty() }}
          rows={4}
          placeholder="Comment s'est passée la séance ? As-tu respecté ton plan ? Qu'est-ce qui t'a surpris ?"
          className="w-full resize-none rounded-xl border border-gray-800/60 bg-gray-900/40 px-4 py-3 text-sm text-gray-200 placeholder-gray-700 outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {/* Notes libres */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
          Notes libres
        </label>
        <textarea
          value={notes}
          onChange={e => { setNotes(e.target.value); markDirty() }}
          rows={3}
          placeholder="Observations du marché, setups ratés, leçons apprises, idées pour demain…"
          className="w-full resize-none rounded-xl border border-gray-800/60 bg-gray-900/40 px-4 py-3 text-sm text-gray-200 placeholder-gray-700 outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
      </div>
    </div>
  )
}
