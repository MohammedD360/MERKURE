'use client'

import { useState, useEffect } from 'react'
import { Check, Zap, Crown, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api-client'
import { getPlanDisplayName } from '@/lib/plans'

interface Plan {
  id: string
  name: string
  /** `null` = tarif négocié au devis, pas de paiement en ligne. */
  priceMonthly: number | null
  currency: string
  features: string[]
}

const PLAN_ICONS: Record<string, React.ElementType> = {
  STARTER: Zap,
  PRO: Star,
  ELITE: Crown,
}

const PLAN_COLORS: Record<string, string> = {
  FREE:    'text-muted-foreground',
  STARTER: 'text-[hsl(var(--primary))]',
  PRO:     'text-[hsl(var(--primary))]',
  ELITE:   'text-amber-500',
}

const PLAN_RING: Record<string, string> = {
  FREE:    '',
  STARTER: '',
  PRO:     'ring-1 ring-[hsl(var(--primary)/0.3)] border-[hsl(var(--primary)/0.4)]',
  ELITE:   'ring-1 ring-amber-200 border-amber-500/30',
}

const FALLBACK_PLANS: Plan[] = [
  { id: "STARTER",       name: "Standard",   priceMonthly: 2900, currency: "EUR", features: ["1 compte broker synchronisé", "Journal de trading", "Statistiques de base", "Import manuel & CSV"] },
  { id: "PRO",           name: "Pro",        priceMonthly: 5900, currency: "EUR", features: ["3 comptes brokers synchronisés", "Toutes les fonctionnalités Standard", "Analyses avancées", "Suivi du risque", "Export CSV"] },
  { id: "ELITE",         name: "Elite",      priceMonthly: 9900, currency: "EUR", features: ["5 comptes brokers synchronisés", "Toutes les fonctionnalités Pro", "Analyse comportementale IA", "Historique illimité", "Support prioritaire"] },
  { id: "INSTITUTIONAL", name: "Sur mesure", priceMonthly: null, currency: "EUR", features: ["Plus de 5 comptes brokers", "Toutes les fonctionnalités Elite", "Multi-utilisateurs & organisation", "Accompagnement dédié"] },
]

function formatPrice(price: number | null) {
  if (price === null) return 'Sur devis'
  return `${(price / 100).toFixed(2).replace('.', ',')} €/mois`
}

export function UpgradePage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS)
  const [currentPlan, setCurrentPlan] = useState<string>('FREE')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<Plan[]>('/api/v1/billing/plans').then((d) => { if (d?.length) setPlans(d) }).catch(() => {})
    apiFetch<{ plan: string }>('/api/v1/billing/subscription').then((d) => { if (d?.plan) setCurrentPlan(d.plan) }).catch(() => {})
  }, [])

  const handleSelect = async (planId: string) => {
    if (planId === 'FREE' || planId === currentPlan) return
    setError(null)
    setLoading(planId)
    try {
      const data = await apiFetch<{ url?: string; error?: string }>('/api/v1/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan: planId }),
      })
      if (data.url) window.location.href = data.url
      else setError('Erreur lors de la redirection vers le paiement.')
    } catch {
      setError('Impossible de créer la session de paiement. Réessayez.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Changer de plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Plan actuel : <span className={`font-bold ${PLAN_COLORS[currentPlan] ?? 'text-foreground'}`}>{getPlanDisplayName(currentPlan)}</span>
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isRecommended = plan.id === 'PRO'
          const isCurrent = plan.id === currentPlan
          const Icon = PLAN_ICONS[plan.id]
          const isLoadingThis = loading === plan.id

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border bg-background p-5 flex flex-col ${
                isCurrent
                  ? 'border-green-500/30 ring-1 ring-emerald-100'
                  : PLAN_RING[plan.id] || 'border-[hsl(var(--border))]'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-0.5 text-xs text-green-500 whitespace-nowrap">
                    Plan actuel
                  </span>
                </div>
              )}
              {isRecommended && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.1)] px-3 py-0.5 text-xs text-[hsl(var(--primary))] whitespace-nowrap">
                    Recommandé
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {Icon && <Icon className={`w-4 h-4 ${PLAN_COLORS[plan.id] ?? 'text-muted-foreground'}`} />}
                  <p className={`text-xs ${PLAN_COLORS[plan.id] ?? 'text-muted-foreground'}`}>
                    {plan.name}
                  </p>
                </div>
                <p className="text-2xl font-semibold text-foreground">{formatPrice(plan.priceMonthly)}</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button
                  type="button"
                  disabled
                  className="w-full rounded-xl h-11 text-sm font-semibold border border-green-500/30 bg-green-500/10 text-green-500 cursor-default"
                >
                  Plan actuel
                </button>
              ) : plan.priceMonthly === null ? (
                // Offre négociée : pas de paiement en ligne, on passe par le devis.
                <a
                  href="mailto:support@merkure360.com?subject=Demande%20de%20devis%20—%20offre%20sur%20mesure"
                  className="w-full rounded-xl h-11 text-sm font-semibold border border-[hsl(var(--border))] bg-[hsl(var(--accent))] text-foreground hover:bg-[hsl(var(--accent))] transition-colors inline-flex items-center justify-center"
                >
                  Demander un devis →
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSelect(plan.id)}
                  disabled={isLoadingThis}
                  className={`w-full rounded-xl h-11 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    isRecommended
                      ? 'bg-[hsl(var(--primary))] hover:bg-[hsl(243_90%_58%)] text-white shadow-[0_4px_14px_hsl(244_42%_51%/0.3)]'
                      : 'border border-[hsl(var(--border))] bg-[hsl(var(--accent))] text-foreground hover:bg-[hsl(var(--accent))]'
                  }`}
                >
                  {isLoadingThis ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
                      Chargement…
                    </span>
                  ) : (
                    `Passer à ${plan.name} →`
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground/60">
        Paiement sécurisé via Stripe · Résiliation à tout moment · Sans engagement
      </p>
    </div>
  )
}
