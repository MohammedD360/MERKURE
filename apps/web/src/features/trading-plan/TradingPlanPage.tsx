import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Download,
  Filter,
  Pencil,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type PlanCard = {
  number: string
  title: string
  icon: LucideIcon
  body: React.ReactNode
  action: string
}

type PlanRow = [label: string, value: string, highlighted?: boolean]

const tabs = ['Mon plan', 'Templates', 'Mes versions', 'Statistiques']

const objectives: PlanRow[] = [
  ['Objectif principal', 'Réussir mon challenge FTMO', true],
  ['Objectif de profit', '10%'],
  ['Horizon', '30 jours'],
  ['Focus principal', 'Discipline & Gestion du risque'],
  ['Métrique clé', 'Respect du plan > 90%'],
]

const strategyRows: PlanRow[] = [
  ['Style de trading', 'Swing intraday'],
  ['Marchés', 'Forex'],
  ['Unités de temps', 'H1 / M15'],
  ['Stratégie principale', 'Structure de marché + OB'],
  ['Stratégie secondaire', 'Rejet sur zones de liquidité'],
]

const entryRules = [
  'Tendance H1 définie',
  'Rejet sur Order Block / FVG',
  'Confluence avec niveau clé',
  'Confirmation sur M15',
  'Risque défini avant entrée',
]

const exitRules = [
  'TP1 : 50% de la position à +1R',
  'TP2 : Trailing stop à BE + 1 pip',
  'Sortie manuelle si structure invalide',
  'Sortie max : 4R',
]

const riskRows: PlanRow[] = [
  ['Risque par trade', '1%'],
  ['Risque max journalier', '3%'],
  ['Risque max hebdomadaire', '6%'],
  ['Drawdown max accepté', '5%'],
  ['Ratio RR minimum', '1:2'],
]

const filters = [
  'Pas de news majeures impact élevé',
  'Pas de trading en session asiatique',
  'Éviter le lundi matin',
  'Pas de trading après 2 pertes consécutives',
  'Liquidité suffisante sur l’actif',
]

const checklist = [
  'Ai-je analysé la tendance H1 ?',
  'Suis-je dans une zone clé ?',
  'Ai-je une confluence claire ?',
  'Le ratio risque/rendement est-il respecté ?',
  'Ai-je vérifié le calendrier économique ?',
  'Suis-je dans les meilleures conditions mentales ?',
  "Ai-je défini mon risque avant d’entrer ?",
]

const journalRows = [
  ['Raison de l’entrée', 'Résultat émotionnel'],
  ['Confiance (1-10)', 'Respect du plan (%)'],
  ['Scénario envisagé', 'Leçon apprise'],
]

const reminders = [
  'Je suis un exécutant, pas un prévisionniste.',
  'Un bon trade peut être une perte.',
  "La discipline aujourd’hui, la liberté demain.",
  'Protéger mon capital est ma priorité.',
  'Rester patient, les meilleures opportunités se présentent seules.',
]

function Card({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-xl border border-border bg-white shadow-sm', className)}>
      {children}
    </section>
  )
}

function StatusPill({ children, tone = 'purple' }: { children: React.ReactNode; tone?: 'purple' | 'green' | 'muted' }) {
  const classes = {
    purple: 'border-[hsl(var(--primary)/0.18)] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]',
    green:  'border-emerald-200 bg-emerald-50 text-emerald-700',
    muted:  'border-border bg-accent text-muted-foreground',
  }

  return (
    <span className={cn('inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-black', classes[tone])}>
      {children}
    </span>
  )
}

function PlanRows({ rows }: { rows: PlanRow[] }) {
  return (
    <div className="space-y-3">
      {rows.map(([label, value, highlighted]) => (
        <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground">{label}</span>
          <span
            className={cn(
              'max-w-[220px] truncate text-right text-sm font-black text-foreground',
              highlighted && 'rounded-md bg-[hsl(var(--primary)/0.08)] px-3 py-1 text-[hsl(var(--primary))]',
            )}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}

function CheckedList({ items, dense = false }: { items: string[]; dense?: boolean }) {
  return (
    <ul className={cn('space-y-3', dense && 'space-y-2.5')}>
      {items.map(item => (
        <li key={item} className="flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span className="text-xs font-black leading-5 text-foreground">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function PlanCard({ number, title, icon: Icon, body, action }: PlanCard) {
  return (
    <Card className="flex min-h-[272px] flex-col p-5">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
        <h2 className="text-xs font-black uppercase tracking-[0.16em] text-foreground">
          {number}. {title}
        </h2>
      </div>
      <div className="min-w-0 flex-1">{body}</div>
      <button type="button" className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[hsl(var(--primary))]">
        {action}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </Card>
  )
}

function ChecklistCard() {
  return (
    <Card className="p-5">
      <div className="mb-5 flex items-center gap-2">
        <ClipboardCheck className="h-5 w-5 text-[hsl(var(--primary))]" />
        <h2 className="text-xs font-black uppercase tracking-[0.16em] text-foreground">
          7. Checklist avant chaque trade
        </h2>
      </div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {checklist.map(item => (
          <label key={item} className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
            <span className="h-4 w-4 rounded border border-[hsl(var(--border))] bg-white" />
            {item}
          </label>
        ))}
      </div>
      <button type="button" className="mt-6 inline-flex items-center gap-2 text-xs font-black text-[hsl(var(--primary))]">
        <Download className="h-3.5 w-3.5" />
        Imprimer la checklist
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </Card>
  )
}

function JournalCard() {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <BookOpenCheck className="h-5 w-5 text-[hsl(var(--primary))]" />
        <h2 className="text-xs font-black uppercase tracking-[0.16em] text-foreground">
          8. Journal de trading
        </h2>
      </div>
      <p className="text-xs font-semibold leading-5 text-muted-foreground">
        Notez vos réflexions avant et après chaque trade. C’est ici que vous progressez.
      </p>
      <div className="mt-5 overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-2 bg-accent text-center text-[11px] font-black text-muted-foreground">
          <div className="border-r border-border px-3 py-2">Avant le trade</div>
          <div className="px-3 py-2">Après le trade</div>
        </div>
        {journalRows.map(([before, after]) => (
          <div key={before} className="grid grid-cols-2 border-t border-border text-xs font-semibold text-muted-foreground">
            <div className="border-r border-border px-3 py-3">{before}</div>
            <div className="px-3 py-3">{after}</div>
          </div>
        ))}
      </div>
      <button type="button" className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[hsl(var(--primary))]">
        Ouvrir mon journal
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </Card>
  )
}

function SummaryIllustration() {
  return (
    <div className="relative mt-7 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-[hsl(var(--primary)/0.04)]">
      <div className="absolute h-24 w-24 rounded-full border border-[hsl(var(--primary)/0.18)]" />
      <div className="absolute h-16 w-16 rounded-full border border-[hsl(var(--primary)/0.12)]" />
      <Target className="absolute left-11 top-16 h-10 w-10 text-[hsl(var(--primary)/0.35)]" />
      <Zap className="absolute right-10 top-16 h-9 w-9 rotate-12 text-[hsl(var(--primary)/0.28)]" />
      <div className="relative w-24 rounded-xl border-4 border-[hsl(var(--primary)/0.62)] bg-white p-3 shadow-[0_18px_50px_hsl(var(--primary)/0.16)]">
        <div className="mx-auto -mt-5 mb-2 h-5 w-10 rounded-md bg-[hsl(var(--primary)/0.35)]" />
        {[0, 1, 2, 3].map(item => (
          <div key={item} className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
            <div className="h-1.5 flex-1 rounded-full bg-[hsl(var(--primary)/0.18)]" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ScoreRing({ value }: { value: number }) {
  const size = 116
  const stroke = 11
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative h-[116px] w-[116px] shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--primary)/0.14)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-3xl font-black text-foreground">{value}%</span>
      </div>
    </div>
  )
}

const cards: PlanCard[] = [
  {
    number: '1',
    title: 'Mes objectifs',
    icon: Target,
    body: <PlanRows rows={objectives} />,
    action: 'Voir le détail des objectifs',
  },
  {
    number: '2',
    title: 'Ma stratégie',
    icon: Zap,
    body: <PlanRows rows={strategyRows} />,
    action: 'Voir ma stratégie complète',
  },
  {
    number: '3',
    title: 'Mes règles d’entrée',
    icon: BarChart3,
    body: <CheckedList items={entryRules} />,
    action: 'Voir toutes les règles',
  },
  {
    number: '4',
    title: 'Mes règles de sortie',
    icon: Upload,
    body: <CheckedList items={exitRules} />,
    action: 'Voir toutes les règles',
  },
  {
    number: '5',
    title: 'Gestion du risque',
    icon: ShieldCheck,
    body: <PlanRows rows={riskRows} />,
    action: 'Voir le détail',
  },
  {
    number: '6',
    title: 'Filtres de trading',
    icon: Filter,
    body: <CheckedList items={filters} dense />,
    action: 'Voir tous les filtres',
  },
]

export function TradingPlanPage() {
  return (
    <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-border pb-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-wrap gap-8">
          {tabs.map(tab => (
            <button
              key={tab}
              type="button"
              className={cn(
                'relative pb-3 text-sm font-black transition-colors',
                tab === 'Mon plan' ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab}
              {tab === 'Mon plan' && <span className="absolute inset-x-0 -bottom-[17px] h-0.5 rounded-full bg-[hsl(var(--primary))]" />}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="inline-flex h-11 min-w-[210px] items-center justify-between gap-4 rounded-lg border border-border bg-white px-4 text-left shadow-sm">
            <span>
              <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">Version actuelle</span>
              <span className="block text-sm font-black text-foreground">v2.1 - 12 Mai 2024</span>
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-white px-5 text-sm font-black text-foreground shadow-sm transition hover:bg-accent">
            <Download className="h-4 w-4" />
            Exporter
          </button>
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-6 text-sm font-black text-white shadow-[0_12px_30px_hsl(var(--primary)/0.22)] transition hover:bg-[hsl(var(--primary)/0.9)]">
            <Pencil className="h-4 w-4" />
            Modifier le plan
          </button>
        </div>
      </div>

      <p className="text-right text-xs font-semibold text-muted-foreground">
        Dernière mise à jour : 12 Mai 2024 à 14:30
      </p>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="space-y-5">
          <Card className="overflow-hidden">
            <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
              <div className="flex items-center gap-5 bg-[hsl(var(--primary)/0.04)] p-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground">Un plan clair. Une exécution parfaite.</h2>
                  <p className="mt-2 text-xs font-semibold leading-5 text-muted-foreground">
                    Votre plan de trading est votre avantage. Définissez vos règles, respectez-les et laissez les résultats venir.
                  </p>
                </div>
              </div>
              <div className="flex items-center border-t border-border p-6 md:border-l md:border-t-0">
                <blockquote className="text-right text-sm font-semibold italic leading-6 text-muted-foreground">
                  “Le succès en trading ne vient pas de ce que vous savez faire occasionnellement, mais de ce que vous faites systématiquement.”
                  <span className="mt-2 block font-black not-italic text-foreground">- Mark Douglas</span>
                </blockquote>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            {cards.slice(0, 3).map(card => (
              <PlanCard key={card.number} {...card} />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {cards.slice(3, 6).map(card => (
              <PlanCard key={card.number} {...card} />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <ChecklistCard />
            <JournalCard />
          </div>

          <Card className="flex flex-col gap-4 bg-[hsl(var(--primary)/0.06)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground">Conseil IA</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">
                  Votre plan est très solide. Continuez à travailler votre patience en évitant les trades en dehors de vos sessions favorites.
                </p>
              </div>
            </div>
            <button type="button" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[hsl(var(--primary)/0.22)] bg-white px-4 text-xs font-black text-[hsl(var(--primary))] shadow-sm transition hover:bg-[hsl(var(--primary)/0.05)]">
              Voir mes axes d’amélioration
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Card>
        </main>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-xs font-black uppercase tracking-[0.16em] text-foreground">Résumé de mon plan</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Plan actif</span>
                <StatusPill tone="green">En cours</StatusPill>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Version</span>
                <span className="text-sm font-black text-foreground">v2.1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Créé le</span>
                <span className="text-sm font-black text-foreground">28 Avr. 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Dernière mise à jour</span>
                <span className="text-sm font-black text-foreground">12 Mai 2024</span>
              </div>
            </div>
            <SummaryIllustration />
          </Card>

          <Card className="p-5">
            <h2 className="text-xs font-black uppercase tracking-[0.16em] text-foreground">Score d’alignement</h2>
            <div className="mt-6 flex items-center gap-6">
              <ScoreRing value={92} />
              <div>
                <p className="text-lg font-black text-foreground">Très bon</p>
                <p className="mt-3 text-xs font-semibold leading-5 text-muted-foreground">
                  Basé sur vos trades des 7 derniers jours
                </p>
              </div>
            </div>
            <button type="button" className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[hsl(var(--primary))]">
              Voir l’analyse complète
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Card>

          <Card className="p-5">
            <div className="mb-5 flex items-center gap-2">
              <Brain className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h2 className="text-xs font-black uppercase tracking-[0.16em] text-foreground">Rappels psychologiques</h2>
            </div>
            <ul className="space-y-4">
              {reminders.map(reminder => (
                <li key={reminder} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                  <span className="text-xs font-semibold leading-5 text-muted-foreground">{reminder}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-[hsl(var(--primary))]" />
              <div>
                <p className="text-sm font-black text-foreground">Revue hebdomadaire</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">Dimanche · 18:00</p>
              </div>
            </div>
            <button type="button" className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-white text-xs font-black text-foreground transition hover:bg-accent">
              Préparer la revue
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Card>
        </aside>
      </div>
    </div>
  )
}
