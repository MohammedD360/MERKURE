'use client'

import { AlertTriangle, CheckCircle2, Circle, Clock, Edit2, EyeOff, Lock, RefreshCw, ShieldAlert, Target, TrendingDown, TrendingUp } from 'lucide-react'
import { getPropFirm, getChallenge, type PropFirmRule, type HiddenRule, type RuleType } from '../data/prop-firms'
import { FirmLogo } from './StepFirmSelect'
import { usePropFirmCompliance } from '@/lib/hooks/use-kpis'
import { cn } from '@/lib/utils'

// ── Progress ring ─────────────────────────────────────────────────────────────

function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const r    = 58
  const half = Math.PI * r
  const offset = half - (Math.min(pct, 100) / 100) * half

  return (
    <svg viewBox="0 0 140 80" className="w-40">
      <path d={`M 10 70 A ${r} ${r} 0 0 1 130 70`} fill="none" stroke="hsl(var(--accent))" strokeWidth="10" strokeLinecap="round" />
      <path
        d={`M 10 70 A ${r} ${r} 0 0 1 130 70`}
        fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${half}`} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  )
}

// ── Rule icons ────────────────────────────────────────────────────────────────

const RULE_ICONS: Record<RuleType, React.ElementType> = {
  daily_drawdown: TrendingDown,
  max_drawdown:   ShieldAlert,
  profit_target:  Target,
  min_days:       Clock,
  consistency:    TrendingUp,
  news:           AlertTriangle,
}

// ── Status calculé depuis les données réelles ─────────────────────────────────

type RuleStatus = 'ok' | 'warning' | 'breach' | 'pending'

interface RuleMetrics {
  usedPct:  number
  current:  string
  label:    string
  status:   RuleStatus
}

function computeRuleMetrics(
  rule:        PropFirmRule,
  compliance:  { profitPct: number; dailyDdPct: number; maxDdPct: number; tradingDays: number; consistencyPct: number } | null,
): RuleMetrics {
  if (!compliance) return { usedPct: 0, current: '—', label: 'Données pas encore disponibles', status: 'pending' }

  switch (rule.type) {
    case 'daily_drawdown': {
      const used   = compliance.dailyDdPct
      const pct    = (used / rule.limitPct) * 100
      const status: RuleStatus = used >= rule.limitPct ? 'breach' : used >= rule.limitPct * 0.7 ? 'warning' : 'ok'
      return { usedPct: pct, current: `${used.toFixed(2)}%`, label: `Utilisé sur la limite de ${rule.limitPct}%`, status }
    }
    case 'max_drawdown': {
      const used   = compliance.maxDdPct
      const pct    = (used / rule.limitPct) * 100
      const status: RuleStatus = used >= rule.limitPct ? 'breach' : used >= rule.limitPct * 0.7 ? 'warning' : 'ok'
      return { usedPct: pct, current: `${used.toFixed(2)}%`, label: `Utilisé sur la limite de ${rule.limitPct}%`, status }
    }
    case 'profit_target': {
      const current = compliance.profitPct
      const pct     = (current / rule.limitPct) * 100
      const status: RuleStatus = current >= rule.limitPct ? 'ok' : 'pending'
      return { usedPct: pct, current: `${current.toFixed(2)}%`, label: `Objectif : ${rule.limitPct}% requis`, status }
    }
    case 'min_days': {
      const required = rule.limitPct > 0 ? rule.limitPct : 4
      const current  = compliance.tradingDays
      const pct      = (current / required) * 100
      const status: RuleStatus = current >= required ? 'ok' : 'pending'
      return { usedPct: pct, current: `${current} j`, label: `Minimum requis : ${required} jours`, status }
    }
    case 'consistency': {
      const used   = compliance.consistencyPct
      const pct    = (used / rule.limitPct) * 100
      const status: RuleStatus = used > rule.limitPct ? 'breach' : used >= rule.limitPct * 0.8 ? 'warning' : 'ok'
      return { usedPct: pct, current: `${used.toFixed(1)}%`, label: `Meilleur jour, max autorisé ${rule.limitPct}%`, status }
    }
    case 'news':
      return { usedPct: 0, current: '—', label: 'Aucune violation détectée', status: 'ok' }
  }
}

const STATUS_ACCENT: Record<RuleStatus, string> = {
  ok:      'border-l-emerald-400',
  warning: 'border-l-amber-400',
  breach:  'border-l-red-400',
  pending: 'border-l-border',
}

const STATUS_ICON_BG: Record<RuleStatus, string> = {
  ok:      'bg-green-500/10 text-green-500',
  warning: 'bg-amber-500/10 text-amber-500',
  breach:  'bg-red-500/10 text-red-500',
  pending: 'bg-[hsl(var(--accent))] text-muted-foreground',
}

const STATUS_LABEL: Record<RuleStatus, { text: string; badge: string }> = {
  ok:      { text: 'Respectée', badge: 'bg-green-500/10 text-green-400' },
  warning: { text: 'Attention', badge: 'bg-amber-500/10 text-amber-400'     },
  breach:  { text: 'Dépassée',  badge: 'bg-red-500/10 text-red-400'         },
  pending: { text: 'En cours',  badge: 'bg-[hsl(var(--accent))] text-muted-foreground' },
}

const STATUS_BAR: Record<RuleStatus, string> = {
  ok: 'bg-emerald-500', warning: 'bg-amber-500', breach: 'bg-red-500', pending: 'bg-[hsl(var(--primary))]',
}

function RuleCard({ rule, compliance }: { rule: PropFirmRule; compliance: Parameters<typeof computeRuleMetrics>[1] }) {
  const Icon    = RULE_ICONS[rule.type]
  const metrics = computeRuleMetrics(rule, compliance)
  const meta    = STATUS_LABEL[metrics.status]

  return (
    <div className={cn('rounded-lg border border-border border-l-4 bg-card p-4', STATUS_ACCENT[metrics.status])}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', STATUS_ICON_BG[metrics.status])}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <p className="text-[13px] font-bold text-foreground">{rule.label}</p>
        </div>
        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-bold', meta.badge)}>
          {meta.text}
        </span>
      </div>

      <p className="mt-2.5 text-[12px] leading-5 text-muted-foreground">{rule.description}</p>

      {rule.type !== 'news' ? (
        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <span className="tabular-nums text-lg font-bold text-foreground">{metrics.current}</span>
            <span className="text-xs text-muted-foreground">{metrics.label}</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--accent))]">
            <div
              className={cn('h-full rounded-full transition-all duration-700', STATUS_BAR[metrics.status])}
              style={{ width: `${Math.min(metrics.usedPct, 100)}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs font-semibold text-foreground">Limite : {rule.limit}</p>
      )}
    </div>
  )
}

// ── Next steps ────────────────────────────────────────────────────────────────

function NextStepItem({ done, label, value }: { done: boolean; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      {done
        ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
        : <Circle className="h-4 w-4 shrink-0 text-muted-foreground/30" />}
      <span className={cn('flex-1 text-xs', done ? 'text-muted-foreground line-through' : 'font-semibold text-foreground')}>
        {label}
      </span>
      <span className="text-xs font-bold text-muted-foreground">{value}</span>
    </div>
  )
}

// ── Hidden rules ─────────────────────────────────────────────────────────────

type ComplianceSnapshot = { consistencyPct: number; dailyDdPct: number; maxDdPct: number } | null

function computeHiddenStatus(rule: HiddenRule, c: ComplianceSnapshot): 'ok' | 'warning' | 'breach' | null {
  if (!c || !rule.metric || rule.threshold === undefined) return null
  const value =
    rule.metric === 'consistency' ? c.consistencyPct :
    rule.metric === 'daily_dd'    ? c.dailyDdPct :
    rule.metric === 'max_dd'      ? c.maxDdPct : null
  if (value === null) return null
  if (value >= rule.threshold)        return 'breach'
  if (value >= rule.threshold * 0.75) return 'warning'
  return 'ok'
}

const SEVERITY_ORDER: Record<HiddenRule['severity'], number> = { critique: 0, important: 1, info: 2 }

const SEVERITY_ACCENT: Record<HiddenRule['severity'], string> = {
  critique:  'border-l-red-400',
  important: 'border-l-amber-400',
  info:      'border-l-blue-300',
}

const SEVERITY_ICON_BG: Record<HiddenRule['severity'], string> = {
  critique:  'bg-red-500/10 text-red-500',
  important: 'bg-amber-500/10 text-amber-500',
  info:      'bg-blue-500/10 text-blue-500',
}

const SEVERITY_BADGE: Record<HiddenRule['severity'], string> = {
  critique:  'bg-red-500/10 text-red-400',
  important: 'bg-amber-500/10 text-amber-400',
  info:      'bg-blue-500/10 text-blue-400',
}

const SEVERITY_LABEL: Record<HiddenRule['severity'], string> = {
  critique:  'Critique',
  important: 'Attention',
  info:      'Info',
}

function HiddenRuleCard({ rule, compliance }: { rule: HiddenRule; compliance: ComplianceSnapshot }) {
  const rtStatus = computeHiddenStatus(rule, compliance)

  const rtColor =
    rtStatus === 'breach'  ? 'bg-red-500' :
    rtStatus === 'warning' ? 'bg-amber-500' :
    rtStatus === 'ok'      ? 'bg-emerald-500' : ''

  const rtLabel =
    rtStatus === 'breach'  ? 'Violation détectée' :
    rtStatus === 'warning' ? 'Risque élevé' :
    rtStatus === 'ok'      ? 'Respectée' : null

  return (
    <div className={cn('flex flex-col rounded-lg border border-border border-l-4 bg-card p-4', SEVERITY_ACCENT[rule.severity])}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', SEVERITY_ICON_BG[rule.severity])}>
            <Lock className="h-3.5 w-3.5" />
          </div>
          <p className="text-[13px] font-bold leading-snug text-foreground">{rule.title}</p>
        </div>
        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-bold', SEVERITY_BADGE[rule.severity])}>
          {SEVERITY_LABEL[rule.severity]}
        </span>
      </div>

      <p className="mt-2.5 text-[12px] leading-5 text-muted-foreground">{rule.description}</p>

      <div className="mt-3 border-l-2 border-border pl-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground/70">Le piège</p>
        <p className="mt-1 text-[12px] italic leading-5 text-foreground/90">{rule.trap}</p>
      </div>

      <div className="mt-2.5 flex items-start gap-1.5">
        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-5 text-muted-foreground">
          <span className="font-bold text-foreground">Conséquence : </span>{rule.consequence}
        </p>
      </div>

      <div className="mt-auto pt-3">
        {rtStatus !== null ? (
          <div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--accent))]">
              <div
                className={cn('h-full rounded-full transition-all duration-700', rtColor)}
                style={{ width: `${Math.min((rule.metric === 'consistency' ? (compliance?.consistencyPct ?? 0) : rule.metric === 'daily_dd' ? (compliance?.dailyDdPct ?? 0) : (compliance?.maxDdPct ?? 0)) / rule.threshold! * 100, 100)}%` }}
              />
            </div>
            <p className={cn('mt-1 text-xs font-bold',
              rtStatus === 'breach'  ? 'text-red-500' :
              rtStatus === 'warning' ? 'text-amber-500' : 'text-green-500',
            )}>
              {rtLabel}
            </p>
          </div>
        ) : (
          <p className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <EyeOff className="h-3 w-3" /> À vérifier manuellement
          </p>
        )}
      </div>
    </div>
  )
}

function HiddenRulesSection({ hiddenRules, compliance }: { hiddenRules: HiddenRule[]; compliance: ComplianceSnapshot }) {
  if (hiddenRules.length === 0) return null

  const sorted = [...hiddenRules].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
  const counts = hiddenRules.reduce(
    (acc, r) => ({ ...acc, [r.severity]: acc[r.severity] + 1 }),
    { critique: 0, important: 0, info: 0 } as Record<HiddenRule['severity'], number>,
  )

  return (
    <div className="mt-2">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Règles cachées à ne pas enfreindre</p>
            <p className="text-[12px] text-muted-foreground">
              Rarement expliquées clairement, elles provoquent la majorité des disqualifications.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {counts.critique > 0 && <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', SEVERITY_BADGE.critique)}>{counts.critique} critique{counts.critique > 1 ? 's' : ''}</span>}
          {counts.important > 0 && <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', SEVERITY_BADGE.important)}>{counts.important} attention</span>}
          {counts.info > 0 && <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', SEVERITY_BADGE.info)}>{counts.info} info</span>}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map(rule => (
          <HiddenRuleCard key={rule.id} rule={rule} compliance={compliance} />
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Config {
  firmId:      string
  challengeId: string
  accountSize: number
  accountType: string
  currency:    string
  leverage:    string
  startDate:   string
}

interface Props {
  config:  Config
  /** Compte broker suivi — la conformité est calculée sur ses trades uniquement. */
  accountId?: string
  onEdit:  () => void
  onReset: () => void
}

export function StepDashboard({ config, accountId, onEdit, onReset }: Props) {
  const firm      = getPropFirm(config.firmId)
  const challenge = getChallenge(config.firmId, config.challengeId)

  const { data: compliance, isLoading, refetch } = usePropFirmCompliance(
    config.accountSize,
    config.startDate || undefined,
    accountId,
  )

  if (!firm || !challenge) return null

  const sizeInfo     = challenge.sizes.find(s => s.value === config.accountSize)
  const profitTarget = challenge.rules.find(r => r.type === 'profit_target')?.limitPct ?? 10
  const profitGoal   = config.accountSize * profitTarget / 100

  const progressPct = compliance
    ? Math.min(Math.max((compliance.profitPct / profitTarget) * 100, 0), 100)
    : 0

  const progressColor =
    progressPct >= 80 ? '#10b981' :
    progressPct >= 50 ? '#6366f1' :
    progressPct >= 25 ? '#f59e0b' : '#ef4444'

  const minDaysRule = challenge.rules.find(r => r.type === 'min_days')
  const minDaysRequired = minDaysRule ? (minDaysRule.limitPct > 0 ? minDaysRule.limitPct : 4) : 0

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">

      {/* ── Main ── */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FirmLogo id={config.firmId} size="sm" />
            <div>
              <p className="text-sm font-semibold text-foreground">{challenge.name}</p>
              <p className="text-xs text-muted-foreground">
                {sizeInfo?.label} · {config.accountType} · {config.currency} · {config.leverage}
                {config.startDate && ` · depuis le ${new Date(config.startDate).toLocaleDateString('fr-FR')}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-bold text-muted-foreground transition-colors hover:bg-[hsl(var(--accent))]"
            >
              <Edit2 className="h-3.5 w-3.5" /> Modifier
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-bold text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-500"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Réinitialiser
            </button>
          </div>
        </div>

        {/* Rules */}
        <div>
          <p className="mb-1 text-xs text-muted-foreground">
            Règles de votre challenge
          </p>
          <p className="mb-4 text-xs text-muted-foreground">
            Calculé à partir de vos trades réels
            {config.startDate ? ` depuis le ${new Date(config.startDate).toLocaleDateString('fr-FR')}` : ''}.
          </p>

          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {challenge.rules.map(r => (
                <div key={r.id} className="h-28 animate-pulse rounded-xl bg-[hsl(var(--accent))]" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {challenge.rules.map(rule => (
                <RuleCard key={rule.id} rule={rule} compliance={compliance ?? null} />
              ))}
            </div>
          )}
        </div>

        {/* Hidden rules */}
        {challenge.hiddenRules.length > 0 && (
          <HiddenRulesSection
            hiddenRules={challenge.hiddenRules}
            compliance={compliance ?? null}
          />
        )}

        <p className="text-xs text-muted-foreground/60">
          ⓘ Mise à jour automatique toutes les 2 minutes en fonction de vos trades.
        </p>
      </div>

      {/* ── Sidebar ── */}
      <aside className="space-y-4">

        {/* Progress gauge */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Suivi en temps réel
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-green-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> En direct
              </span>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-muted-foreground hover:text-foreground"
                title="Actualiser"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="relative mt-4 flex flex-col items-center">
            <ProgressRing pct={progressPct} color={progressColor} />
            <div className="absolute bottom-0 flex flex-col items-center">
              <span className="text-3xl font-semibold text-foreground">
                {isLoading ? '…' : `${Math.round(progressPct)}%`}
              </span>
              <span className="text-xs text-muted-foreground">Progression</span>
              <span className="text-xs font-bold text-muted-foreground">
                {compliance
                  ? `$${Math.round(compliance.profitAmount).toLocaleString('fr-FR')} / $${Math.round(profitGoal).toLocaleString('fr-FR')}`
                  : `— / $${Math.round(profitGoal).toLocaleString('fr-FR')}`}
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-2 border-t border-border pt-4">
            {[
              {
                label: 'Profit actuel',
                value: compliance ? `$${compliance.profitAmount.toLocaleString('fr-FR')}` : '—',
                color: compliance && compliance.profitAmount >= 0 ? 'text-green-500' : 'text-red-500',
              },
              {
                label: 'Jours de trading',
                value: compliance ? `${compliance.tradingDays}${minDaysRequired > 0 ? ` / ${minDaysRequired} min` : ''}` : '—',
              },
              {
                label: "Trades aujourd'hui",
                value: compliance ? String(compliance.tradesToday) : '—',
              },
              {
                label: 'Trades analysés',
                value: compliance ? String(compliance.nbTrades) : '—',
              },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <span className={cn('text-xs font-bold', row.color ?? 'text-foreground')}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next steps */}
        {compliance && (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">
              Prochaines étapes
            </p>
            <div className="mt-4 space-y-3">
              <NextStepItem
                done={compliance.profitPct >= profitTarget * 0.5}
                label={`Atteindre 50% de l'objectif`}
                value={`$${Math.round(profitGoal * 0.5).toLocaleString('fr-FR')} / $${Math.round(profitGoal).toLocaleString('fr-FR')}`}
              />
              <NextStepItem
                done={compliance.dailyDdPct < challenge.rules.find(r => r.type === 'daily_drawdown')?.limitPct! * 0.5}
                label="Drawdown journalier < 50% limite"
                value={`${compliance.dailyDdPct.toFixed(2)}% / ${challenge.rules.find(r => r.type === 'daily_drawdown')?.limitPct ?? '—'}%`}
              />
              <NextStepItem
                done={compliance.maxDdPct < challenge.rules.find(r => r.type === 'max_drawdown')?.limitPct! * 0.5}
                label="Drawdown max < 50% limite"
                value={`${compliance.maxDdPct.toFixed(2)}% / ${challenge.rules.find(r => r.type === 'max_drawdown')?.limitPct ?? '—'}%`}
              />
              {minDaysRequired > 0 && (
                <NextStepItem
                  done={compliance.tradingDays >= minDaysRequired}
                  label={`Atteindre ${minDaysRequired} jours de trading`}
                  value={`${compliance.tradingDays} / ${minDaysRequired}`}
                />
              )}
              <NextStepItem
                done={compliance.profitPct >= profitTarget}
                label="Atteindre l'objectif de profit"
                value={`${compliance.profitPct.toFixed(2)}% / ${profitTarget}%`}
              />
            </div>
          </div>
        )}

      </aside>
    </div>
  )
}
