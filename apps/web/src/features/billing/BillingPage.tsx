'use client'

import { Check, ShieldAlert, ExternalLink, Crown, Zap, Star } from 'lucide-react'
import { useSubscription, usePlans, useCheckout, usePortal } from '@/lib/hooks/use-billing'
import type { BillingPlan } from '@/lib/api-client'
import { getPlanDisplayName } from '@/lib/plans'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(priceMonthly: number, currency: string): string {
  if (priceMonthly === 0) return 'Gratuit'
  return (priceMonthly / 100).toLocaleString('fr-FR', {
    style: 'currency',
    currency: currency ?? 'EUR',
  }) + '/mois'
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const PLAN_ORDER = ['FREE', 'STARTER', 'PRO', 'ELITE']

function getPlanRank(plan: string): number {
  return PLAN_ORDER.indexOf(plan)
}

// ── Badge couleur par plan ────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    FREE:    'border-[hsl(var(--border))] bg-[hsl(var(--accent))] text-muted-foreground',
    STARTER: 'border-[hsl(var(--border))] bg-[hsl(var(--accent))] text-muted-foreground',
    PRO:     'border-emerald-200 bg-emerald-50 text-emerald-600',
    ELITE:   'border-amber-200 bg-amber-50 text-amber-600',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${styles[plan] ?? styles.FREE}`}>
      {plan === 'ELITE' && <Crown className="h-3 w-3" />}
      {plan === 'PRO'   && <Star  className="h-3 w-3" />}
      {plan === 'STARTER' && <Zap className="h-3 w-3" />}
      {getPlanDisplayName(plan)}
    </span>
  )
}

// ── Badge statut abonnement ───────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE:   'border-emerald-200 bg-emerald-50 text-emerald-600',
    TRIALING: 'border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]',
    PAST_DUE: 'border-orange-200 bg-orange-50 text-orange-600',
    CANCELED: 'border-red-200 bg-red-50 text-red-500',
  }
  const labels: Record<string, string> = {
    ACTIVE: 'Actif', TRIALING: 'Actif', PAST_DUE: 'Paiement en retard', CANCELED: 'Annulé',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? styles.ACTIVE}`}>
      {labels[status] ?? status}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCards() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border border-[hsl(var(--border))] bg-white p-5 space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-20 rounded-lg bg-[hsl(var(--accent))] animate-pulse" />
            <div className="h-6 w-28 rounded-lg bg-[hsl(var(--accent))] animate-pulse" />
          </div>
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[hsl(var(--accent))] animate-pulse" />
                <div className="h-3 w-full rounded bg-[hsl(var(--accent))] animate-pulse" />
              </div>
            ))}
          </div>
          <div className="h-10 w-full rounded-lg bg-[hsl(var(--accent))] animate-pulse" />
        </div>
      ))}
    </div>
  )
}

// ── PlanCard ──────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: BillingPlan
  currentPlan: string
  onCheckout: (planId: string) => void
  isCheckoutPending: boolean
}

function PlanCard({ plan, currentPlan, onCheckout, isCheckoutPending }: PlanCardProps) {
  const isCurrent  = plan.id === currentPlan
  const isRecommended = plan.id === 'PRO'
  const isFree     = plan.id === 'FREE'
  const currentRank = getPlanRank(currentPlan)
  const planRank    = getPlanRank(plan.id)
  const isUpgrade   = planRank > currentRank
  const isDowngrade = planRank < currentRank && !isFree

  return (
    <div
      className={`relative flex flex-col rounded-lg border p-5 transition-all duration-200 ${
        isRecommended
          ? 'border-[hsl(var(--border))] bg-card'
          : 'border-[hsl(var(--border))] bg-white'
      } ${isCurrent ? 'ring-1 ring-emerald-500/30' : ''}`}
    >
      {/* Badge Populaire */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-[10px] font-bold tracking-wider text-emerald-600">
            RECOMMANDÉ
          </span>
        </div>
      )}

      {/* Nom + prix */}
      <div className="mb-4 pt-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{plan.name}</p>
          {isCurrent && (
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
              Plan actuel
            </span>
          )}
        </div>
        <p className="text-2xl font-black text-foreground">
          {formatPrice(plan.priceMonthly, plan.currency)}
        </p>
      </div>

      {/* Séparateur */}
      <div className="mb-4 h-px bg-[hsl(var(--border))]" />

      {/* Features */}
      <ul className="mb-6 flex-1 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Bouton */}
      {isCurrent ? (
        <button
          disabled
          className="w-full cursor-default rounded-lg border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-600"
        >
          Plan actuel
        </button>
      ) : isFree ? (
        <div className="h-10" /> // spacer - pas de bouton pour FREE
      ) : isUpgrade ? (
        <button
          onClick={() => onCheckout(plan.id)}
          disabled={isCheckoutPending}
          className="w-full rounded-lg bg-[hsl(var(--primary))] py-2.5 text-xs font-bold text-white transition-colors hover:bg-[hsl(244_42%_44%)] disabled:opacity-60"
        >
          {isCheckoutPending ? 'Redirection…' : `Passer à ${plan.name}`}
        </button>
      ) : isDowngrade ? (
        <button
          disabled
          className="w-full cursor-default rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--accent))] py-2.5 text-xs font-bold text-muted-foreground/60"
        >
          Rétrograder
        </button>
      ) : null}
    </div>
  )
}

// ── BillingPage ───────────────────────────────────────────────────────────────

export function BillingPage() {
  const { data: subscription, isLoading: subLoading, error: subError } = useSubscription()
  const { data: plans,        isLoading: plansLoading }                = usePlans()
  const { mutate: checkout,   isPending: checkoutPending, error: checkoutError }  = useCheckout()
  const { mutate: portal,     isPending: portalPending }                            = usePortal()

  const isLoading = subLoading || plansLoading
  const hasError  = subError !== null && subError !== undefined

  const currentPlan = subscription?.plan ?? 'FREE'

  // Trier les plans dans l'ordre défini
  const sortedPlans = plans
    ? [...plans].sort((a, b) => getPlanRank(a.id) - getPlanRank(b.id))
    : []

  return (
    <div className="px-6 py-5 space-y-6">

      {/* ── En-tête ──────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground">Abonnement</h2>
          {!subLoading && <PlanBadge plan={currentPlan} />}
        </div>

        {!subLoading && subscription && subscription.plan !== 'FREE' && (
          <div className="flex items-center gap-3">
            {subscription.currentPeriodEnd && (
              <p className="text-xs text-muted-foreground">
                Renouvellement le{' '}
                <span className="text-muted-foreground font-medium">
                  {formatDate(subscription.currentPeriodEnd)}
                </span>
              </p>
            )}
            <button
              onClick={() => portal()}
              disabled={portalPending}
              className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-white px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-[hsl(var(--border))] hover:text-foreground disabled:opacity-60"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {portalPending ? 'Redirection…' : 'Gérer mon abonnement'}
            </button>
          </div>
        )}
      </div>

      {/* ── Erreur API ───────────────────────────────── */}
      {hasError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <ShieldAlert className="h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-500">
            Impossible de charger les informations de facturation. Vérifiez que l'API est disponible.
          </p>
        </div>
      )}
      {checkoutError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <ShieldAlert className="h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-500">{checkoutError.message}</p>
        </div>
      )}

      {/* ── Bannière abonnement actuel (si pas FREE) ─── */}
      {!subLoading && subscription && subscription.plan !== 'FREE' && (
        <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-white px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Statut :</span>
              <StatusBadge status={subscription.status} />
            </div>
            {subscription.currentPeriodEnd && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Renouvellement le</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatDate(subscription.currentPeriodEnd)}
                </span>
              </div>
            )}
          </div>
          {subscription.cancelAtPeriodEnd && (
            <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
              Annulation prévue
            </span>
          )}
        </div>
      )}

      {/* ── Grille des plans ─────────────────────────── */}
      {isLoading ? (
        <SkeletonCards />
      ) : sortedPlans.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sortedPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlan={currentPlan}
              onCheckout={checkout}
              isCheckoutPending={checkoutPending}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
