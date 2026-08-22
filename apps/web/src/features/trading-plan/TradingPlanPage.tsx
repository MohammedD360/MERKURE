'use client'

import { useEffect, useState, type ReactNode } from 'react'
import {
  BookOpenCheck, Brain, CheckCircle2, Download, Filter, Loader2, Pencil, Plus,
  ShieldCheck, Sparkles, Target, Trash2, Upload, X, type LucideIcon,
} from 'lucide-react'

import {
  EMPTY_PLAN, normalizePlan, planCompletion, useSaveTradingPlan, useTradingPlan,
  type TradingPlanData,
} from '@/lib/hooks/use-trading-plan'
import { PLAN_TEMPLATES } from './plan-templates'
import { cn } from '@/lib/utils'

/* ── Primitives ──────────────────────────────────────────────────────────── */

function Card({ icon: Icon, title, hint, children }: {
  icon: LucideIcon
  title: string
  hint: string
  children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 space-y-1.5">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{hint}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

const INPUT_CLS =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary'

/** Liste de paires libellé / valeur — lecture ou édition selon le mode. */
function FieldRows({
  editing,
  rows,
  onChange,
}: {
  editing: boolean
  rows: Array<{ key: string; label: string; value: string; placeholder: string }>
  onChange: (key: string, value: string) => void
}) {
  return (
    <div className="space-y-3">
      {rows.map(row => (
        <div key={row.key} className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">{row.label}</span>
          {editing ? (
            <input
              value={row.value}
              onChange={e => onChange(row.key, e.target.value)}
              placeholder={row.placeholder}
              aria-label={row.label}
              className={cn(INPUT_CLS, 'max-w-[260px]')}
            />
          ) : (
            <span className={cn('text-sm font-medium', row.value ? 'text-foreground' : 'text-muted-foreground')}>
              {row.value || 'à définir'}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

/** Liste de règles — puces en lecture, éditeur ligne à ligne en édition. */
function RuleList({
  editing,
  items,
  onChange,
  placeholder,
}: {
  editing: boolean
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
}) {
  if (!editing) {
    if (items.length === 0) {
      return <p className="text-sm text-muted-foreground">Aucune règle définie.</p>
    }
    return (
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={`${item}-${i}`} className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            <span className="text-sm leading-6 text-foreground">{item}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={e => onChange(items.map((v, j) => (j === i ? e.target.value : v)))}
            placeholder={placeholder}
            aria-label={`Règle ${i + 1}`}
            className={INPUT_CLS}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label={`Supprimer la règle ${i + 1}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-dashed border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Ajouter une règle
      </button>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export function TradingPlanPage() {
  const { data: record, isLoading } = useTradingPlan()
  const save = useSaveTradingPlan()

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<TradingPlanData>(EMPTY_PLAN)

  // Le brouillon suit la base tant qu'on n'est pas en train d'éditer
  useEffect(() => {
    if (!editing) setDraft(normalizePlan(record?.data))
  }, [record, editing])

  const plan = editing ? draft : normalizePlan(record?.data)
  const completion = planCompletion(plan)
  const version = record?.version ?? 0

  const setField = (section: 'objectives' | 'strategy' | 'risk') => (key: string, value: string) =>
    setDraft(d => ({ ...d, [section]: { ...d[section], [key]: value } }))

  const setList = (key: 'entryRules' | 'exitRules' | 'filters' | 'checklist' | 'mindset') =>
    (items: string[]) => setDraft(d => ({ ...d, [key]: items }))

  const handleSave = () => {
    // On ne persiste pas les lignes vides laissées par l'éditeur
    const cleaned: TradingPlanData = {
      ...draft,
      entryRules: draft.entryRules.map(s => s.trim()).filter(Boolean),
      exitRules:  draft.exitRules.map(s => s.trim()).filter(Boolean),
      filters:    draft.filters.map(s => s.trim()).filter(Boolean),
      checklist:  draft.checklist.map(s => s.trim()).filter(Boolean),
      mindset:    draft.mindset.map(s => s.trim()).filter(Boolean),
    }
    save.mutate(cleaned, { onSuccess: () => setEditing(false) })
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `merkure-plan-de-trading-v${version}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const btnSecondary =
    'inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50'
  const btnPrimary =
    'inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded-lg bg-secondary" />
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-secondary" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── État du plan + actions ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full', completion >= 60 ? 'bg-green-500' : completion > 0 ? 'bg-amber-500' : 'bg-muted-foreground')} />
            <span className="text-muted-foreground">Plan rempli à</span>
            <span className="font-medium text-foreground">{completion} %</span>
          </span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span className="text-muted-foreground">
            {version === 0 ? 'Jamais enregistré' : <>Révision <span className="font-medium text-foreground">n° {version}</span></>}
          </span>
          {record?.updatedAt && (
            <>
              <span className="hidden h-4 w-px bg-border sm:block" />
              <span className="text-muted-foreground">
                Mis à jour le{' '}
                <span className="font-medium text-foreground">
                  {new Date(record.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {editing ? (
            <>
              <button type="button" onClick={() => setEditing(false)} className={btnSecondary}>
                <X className="h-4 w-4" />
                Annuler
              </button>
              <button type="button" onClick={handleSave} disabled={save.isPending} className={btnPrimary}>
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Enregistrer le plan
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={handleExport} className={btnSecondary}>
                <Download className="h-4 w-4" />
                Exporter
              </button>
              <button type="button" onClick={() => setEditing(true)} className={btnPrimary}>
                <Pencil className="h-4 w-4" />
                Modifier le plan
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Barre de complétion ─────────────────────────────────────────── */}
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', completion >= 60 ? 'bg-green-500' : 'bg-amber-500')}
          style={{ width: `${completion}%` }}
        />
      </div>

      {/* ── Modèles de départ (édition seulement) ───────────────────────── */}
      {editing && (
        <div className="rounded-lg border border-dashed border-border p-4">
          <p className="text-sm text-muted-foreground">
            Partir d’un modèle — il remplace le contenu du formulaire, rien n’est enregistré tant que vous ne validez pas.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PLAN_TEMPLATES.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => setDraft(t.plan)}
                title={t.description}
                className={btnSecondary}
              >
                <Sparkles className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Sections ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card icon={Target} title="Objectifs" hint="Ce que vous cherchez à atteindre, et comment vous le mesurez">
          <FieldRows
            editing={editing}
            onChange={setField('objectives')}
            rows={[
              { key: 'main',         label: 'Objectif principal', value: plan.objectives.main,         placeholder: 'Rester constant sur 3 mois' },
              { key: 'profitTarget', label: 'Objectif de profit', value: plan.objectives.profitTarget, placeholder: '5 % par mois' },
              { key: 'horizon',      label: 'Horizon',            value: plan.objectives.horizon,      placeholder: '3 mois' },
              { key: 'focus',        label: 'Axe de travail',     value: plan.objectives.focus,        placeholder: 'Discipline' },
              { key: 'keyMetric',    label: 'Métrique clé',       value: plan.objectives.keyMetric,    placeholder: 'Respect du plan > 90 %' },
            ]}
          />
        </Card>

        <Card icon={Sparkles} title="Stratégie" hint="Ce que vous tradez, quand, et avec quelle approche">
          <FieldRows
            editing={editing}
            onChange={setField('strategy')}
            rows={[
              { key: 'style',      label: 'Style',             value: plan.strategy.style,      placeholder: 'Intraday' },
              { key: 'markets',    label: 'Marchés',           value: plan.strategy.markets,    placeholder: 'Forex majeures' },
              { key: 'timeframes', label: 'Unités de temps',   value: plan.strategy.timeframes, placeholder: 'H1 / M15' },
              { key: 'primary',    label: 'Setup principal',   value: plan.strategy.primary,    placeholder: 'Cassure de range' },
              { key: 'secondary',  label: 'Setup secondaire',  value: plan.strategy.secondary,  placeholder: 'Retour à la moyenne' },
            ]}
          />
        </Card>

        <Card icon={BookOpenCheck} title="Règles d’entrée" hint="Les conditions à réunir avant de prendre position">
          <RuleList editing={editing} items={plan.entryRules} onChange={setList('entryRules')} placeholder="Biais H1 défini avant l’ouverture" />
        </Card>

        <Card icon={Upload} title="Règles de sortie" hint="Comment vous prenez vos gains et coupez vos pertes">
          <RuleList editing={editing} items={plan.exitRules} onChange={setList('exitRules')} placeholder="Break-even après +1R" />
        </Card>

        <Card icon={ShieldCheck} title="Gestion du risque" hint="Vos limites chiffrées — elles priment sur tout le reste">
          <FieldRows
            editing={editing}
            onChange={setField('risk')}
            rows={[
              { key: 'perTrade',    label: 'Risque par trade',    value: plan.risk.perTrade,    placeholder: '0,5 %' },
              { key: 'daily',       label: 'Perte max journée',   value: plan.risk.daily,       placeholder: '1,5 %' },
              { key: 'weekly',      label: 'Perte max semaine',   value: plan.risk.weekly,      placeholder: '3 %' },
              { key: 'maxDrawdown', label: 'Drawdown maximum',    value: plan.risk.maxDrawdown, placeholder: '6 %' },
              { key: 'minRR',       label: 'Ratio R/R minimum',   value: plan.risk.minRR,       placeholder: '1:2' },
            ]}
          />
        </Card>

        <Card icon={Filter} title="Filtres" hint="Les situations dans lesquelles vous ne tradez pas">
          <RuleList editing={editing} items={plan.filters} onChange={setList('filters')} placeholder="Pas de trade autour d’une news à impact élevé" />
        </Card>

        <Card icon={CheckCircle2} title="Checklist avant trade" hint="Les questions à se poser, dans l’ordre, avant de cliquer">
          <RuleList editing={editing} items={plan.checklist} onChange={setList('checklist')} placeholder="Mon risque est-il calculé et saisi ?" />
        </Card>

        <Card icon={Brain} title="Rappels psychologiques" hint="Ce que vous relisez quand la séance dérape">
          <RuleList editing={editing} items={plan.mindset} onChange={setList('mindset')} placeholder="Une perte respectant le plan est un bon trade" />
        </Card>
      </div>

      {save.isError && (
        <p className="text-sm text-red-500">
          L’enregistrement a échoué. Vos modifications sont toujours à l’écran, réessayez.
        </p>
      )}
    </div>
  )
}
