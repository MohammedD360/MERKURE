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
  label:    string
  status:   RuleStatus
}

function computeRuleMetrics(
  rule:        PropFirmRule,
  compliance:  { profitPct: number; dailyDdPct: number; maxDdPct: number; tradingDays: number; consistencyPct: number } | null,
): RuleMetrics {
  if (!compliance) return { usedPct: 0, label: '—', status: 'pending' }

  switch (rule.type) {
    case 'daily_drawdown': {
      const used   = compliance.dailyDdPct
      const pct    = (used / rule.limitPct) * 100
      const status: RuleStatus = used >= rule.limitPct ? 'breach' : used >= rule.limitPct * 0.7 ? 'warning' : 'ok'
      return { usedPct: pct, label: `Utilisé : ${used.toFixed(2)}% / ${rule.limitPct}%`, status }
    }
    case 'max_drawdown': {
      const used   = compliance.maxDdPct
      const pct    = (used / rule.limitPct) * 100
      const status: RuleStatus = used >= rule.limitPct ? 'breach' : used >= rule.limitPct * 0.7 ? 'warning' : 'ok'
      return { usedPct: pct, label: `Utilisé : ${used.toFixed(2)}% / ${rule.limitPct}%`, status }
    }
    case 'profit_target': {
      const current = compliance.profitPct
      const pct     = (current / rule.limitPct) * 100
      const status: RuleStatus = current >= rule.limitPct ? 'ok' : 'pending'
      return { usedPct: pct, label: `${current.toFixed(2)}% / ${rule.limitPct}% requis`, status }
    }
    case 'min_days': {
      const required = rule.limitPct > 0 ? rule.limitPct : 4
      const current  = compliance.tradingDays
      const pct      = (current / required) * 100
      const status: RuleStatus = current >= required ? 'ok' : 'pending'
      return { usedPct: pct, label: `${current} / ${required} jours`, status }
    }
    case 'consistency': {
      const used   = compliance.consistencyPct
      const pct    = (used / rule.limitPct) * 100
      const status: RuleStatus = used > rule.limitPct ? 'breach' : used >= rule.limitPct * 0.8 ? 'warning' : 'ok'
      return { usedPct: pct, label: `Meilleur jour : ${used.toFixed(1)}% du profit total (max ${rule.limitPct}%)`, status }
    }
    case 'news':
      return { usedPct: 0, label: 'Aucune violation détectée', status: 'ok' }
  }
}

const STATUS_STYLE: Record<RuleStatus, string> = {
  ok:      'border-emerald-200 bg-emerald-50',
  warning: 'border-amber-200 bg-amber-50',
  breach:  'border-red-200 bg-red-50',
  pending: 'border-border bg-[hsl(var(--accent))]',
}

const STATUS_LABEL: Record<RuleStatus, { text: string; color: string }> = {
  ok:      { text: 'Respectée', color: 'text-emerald-600' },
  warning: { text: 'Attention',  color: 'text-amber-600'   },
  breach:  { text: 'Dépassée',  color: 'text-red-600'      },
  pending: { text: 'En cours',  color: 'text-muted-foreground' },
}

function RuleCard({ rule, compliance }: { rule: PropFirmRule; compliance: Parameters<typeof computeRuleMetrics>[1] }) {
  const Icon    = RULE_ICONS[rule.type]
  const metrics = computeRuleMetrics(rule, compliance)
  const meta    = STATUS_LABEL[metrics.status]

  return (
    <div className={cn('rounded-xl border p-4', STATUS_STYLE[metrics.status])}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          metrics.status === 'ok'      ? 'bg-emerald-100 text-emerald-600' :
          metrics.status === 'warning' ? 'bg-amber-100 text-amber-600'     :
          metrics.status === 'breach'  ? 'bg-red-100 text-red-600'         :
          'bg-[hsl(var(--border))] text-muted-foreground',
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-black text-foreground">{rule.label}</p>
            <span className={cn('shrink-0 text-[10px] font-bold', meta.color)}>
              {meta.text}
              {metrics.status === 'ok' && <CheckCircle2 className="ml-1 inline h-3 w-3" />}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{rule.description}</p>
          <p className="mt-1.5 text-[11px] font-bold text-foreground">Limite : {rule.limit}</p>
          {rule.type !== 'news' && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700',
                    metrics.status === 'ok'      ? 'bg-emerald-500' :
                    metrics.status === 'warning' ? 'bg-amber-500'   :
                    metrics.status === 'breach'  ? 'bg-red-500'     : 'bg-[hsl(var(--primary))]',
                  )}
                  style={{ width: `${Math.min(metrics.usedPct, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">{metrics.label}</p>
            </div>
          )}
        </div>
      </div>
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
      <span className="text-[11px] font-bold text-muted-foreground">{value}</span>
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

const SEVERITY_STYLE: Record<HiddenRule['severity'], string> = {
  critique:  'border-red-200 bg-red-50',
  important: 'border-amber-200 bg-amber-50',
  info:      'border-blue-100 bg-blue-50',
}

const SEVERITY_BADGE: Record<HiddenRule['severity'], string> = {
  critique:  'bg-red-100 text-red-600',
  important: 'bg-amber-100 text-amber-700',
  info:      'bg-blue-100 text-blue-600',
}

const SEVERITY_LABEL: Record<HiddenRule['severity'], string> = {
  critique:  'CRITIQUE',
  important: 'ATTENTION',
  info:      'INFO',
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
    <div className={cn('rounded-xl border p-4', SEVERITY_STYLE[rule.severity])}>
      <div className="flex items-start gap-3">
        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', SEVERITY_BADGE[rule.severity])}>
          <Lock className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-1.5">
            <p className="text-xs font-black text-foreground leading-snug">{rule.title}</p>
            <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider', SEVERITY_BADGE[rule.severity])}>
              {SEVERITY_LABEL[rule.severity]}
            </span>
          </div>

          <p className="mt-1.5 text-[11px] text-muted-foreground">{rule.description}</p>

          <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-black/5 px-2.5 py-2">
            <EyeOff className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
            <p className="text-[11px] font-medium text-foreground">{rule.trap}</p>
          </div>

          <p className="mt-2 text-[10px] text-muted-foreground">
            <span className="font-bold">Conséquence :</span> {rule.consequence}
          </p>

          {rtStatus !== null && (
            <div className="mt-2.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', rtColor)}
                  style={{ width: `${Math.min((rule.metric === 'consistency' ? (compliance?.consistencyPct ?? 0) : rule.metric === 'daily_dd' ? (compliance?.dailyDdPct ?? 0) : (compliance?.maxDdPct ?? 0)) / rule.threshold! * 100, 100)}%` }}
                />
              </div>
              <p className={cn('mt-1 text-[10px] font-bold',
                rtStatus === 'breach'  ? 'text-red-600' :
                rtStatus === 'warning' ? 'text-amber-600' : 'text-emerald-600',
              )}>
                {rtLabel}
              </p>
            </div>
          )}

          {rtStatus === null && (
            <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
              <AlertTriangle className="h-2.5 w-2.5" /> À vérifier manuellement
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function HiddenRulesSection({ hiddenRules, compliance }: { hiddenRules: HiddenRule[]; compliance: ComplianceSnapshot }) {
  if (hiddenRules.length === 0) return null

  return (
    <div className="mt-2">
      <div className="mb-4 flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-500" />
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-amber-600">
            Règles cachées à ne pas enfreindre
          </p>
          <p className="text-[11px] text-muted-foreground">
            Ces règles sont rarement expliquées clairement mais provoquent la majorité des disqualifications.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {hiddenRules.map(rule => (
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
  onEdit:  () => void
  onReset: () => void
}

export function StepDashboard({ config, onEdit, onReset }: Props) {
  const firm      = getPropFirm(config.firmId)
  const challenge = getChallenge(config.firmId, config.challengeId)

  const { data: compliance, isLoading, refetch } = usePropFirmCompliance(
    config.accountSize,
    config.startDate || undefined,
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
              <p className="text-sm font-black text-foreground">{challenge.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {sizeInfo?.label} · {config.accountType} · {config.currency} · {config.leverage}
                {config.startDate && ` · depuis le ${new Date(config.startDate).toLocaleDateString('fr-FR')}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-bold text-muted-foreground transition-colors hover:bg-[hsl(var(--accent))]"
            >
              <Edit2 className="h-3.5 w-3.5" /> Modifier
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-bold text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Réinitialiser
            </button>
          </div>
        </div>

        {/* Rules */}
        <div>
          <p className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
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

        <p className="text-[11px] text-muted-foreground/60">
          ⓘ Mise à jour automatique toutes les 2 minutes en fonction de vos trades.
        </p>
      </div>

      {/* ── Sidebar ── */}
      <aside className="space-y-4">

        {/* Progress gauge */}
        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
              Suivi en temps réel
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
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
              <span className="text-3xl font-black text-foreground">
                {isLoading ? '…' : `${Math.round(progressPct)}%`}
              </span>
              <span className="text-[10px] text-muted-foreground">Progression</span>
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
                color: compliance && compliance.profitAmount >= 0 ? 'text-emerald-600' : 'text-red-500',
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
                <span className="text-[11px] text-muted-foreground">{row.label}</span>
                <span className={cn('text-[11px] font-bold', row.color ?? 'text-foreground')}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next steps */}
        {compliance && (
          <div className="rounded-xl border border-border bg-white p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
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
