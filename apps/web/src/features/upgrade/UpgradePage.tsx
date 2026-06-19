'use client'

import { useState, useEffect } from 'react'
import { Check, Zap, Crown, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api-client'
import { getPlanDisplayName } from '@/lib/plans'

interface Plan {
  id: string
  name: string
  priceMonthly: number
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
  ELITE:   'text-amber-600',
}

const PLAN_RING: Record<string, string> = {
  FREE:    '',
  STARTER: '',
  PRO:     'ring-1 ring-[hsl(var(--primary)/0.3)] border-[hsl(var(--primary)/0.4)]',
  ELITE:   'ring-1 ring-amber-200 border-amber-200',
}

const FALLBACK_PLANS: Plan[] = [
  { id: "FREE",    name: "Gratuit", priceMonthly: 0,    currency: 'EUR', features: ["10 trades/mois", "KPIs de base", 'Journal manuel'] },
  { id: "STARTER", name: "Starter", priceMonthly: 900,  currency: "EUR", features: ["Journal de trading", "Statistiques de base", "Import manuel & CSV", '1 compte broker'] },
  { id: "PRO",     name: "Trader",  priceMonthly: 1900, currency: "EUR", features: ["Toutes les fonctionnalités Starter", "Analyses avancées", "Suivi du risque", "Jusqu'à 3 comptes brokers"] },
  { id: "ELITE",   name: "Pro",     priceMonthly: 4900, currency: "EUR", features: ["Toutes les fonctionnalités Trader", "Analyse comportementale IA", "Exports avancés", 'Connexions brokers illimitées'] },
]

function formatPrice(price: number) {
  if (price === 0) return 'Gratuit'
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
        <h1 className="text-2xl font-black text-foreground">Changer de plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Plan actuel : <span className={`font-bold ${PLAN_COLORS[currentPlan] ?? 'text-foreground'}`}>{getPlanDisplayName(currentPlan)}</span>
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
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
                  ? 'border-emerald-200 ring-1 ring-emerald-100'
                  : PLAN_RING[plan.id] || 'border-[hsl(var(--border))]'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 whitespace-nowrap">
                    Plan actuel
                  </span>
                </div>
              )}
              {isRecommended && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.1)] px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--primary))] whitespace-nowrap">
                    Recommandé
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {Icon && <Icon className={`w-4 h-4 ${PLAN_COLORS[plan.id] ?? 'text-muted-foreground'}`} />}
                  <p className={`text-[11px] font-black uppercase tracking-wider ${PLAN_COLORS[plan.id] ?? 'text-muted-foreground'}`}>
                    {plan.name}
                  </p>
                </div>
                <p className="text-2xl font-black text-foreground">{formatPrice(plan.priceMonthly)}</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                    <span className="text-sm text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button
                  type="button"
                  disabled
                  className="w-full rounded-xl h-11 text-sm font-black border border-emerald-200 bg-emerald-50 text-emerald-600 cursor-default"
                >
                  Plan actuel
                </button>
              ) : plan.id === 'FREE' ? (
                <button
                  type="button"
                  onClick={() => router.push('/app/billing')}
                  className="w-full rounded-xl h-11 text-sm font-black border border-[hsl(var(--border))] bg-[hsl(var(--accent))] text-muted-foreground hover:bg-[hsl(var(--accent))] transition-colors"
                >
                  Gérer l&apos;abonnement
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSelect(plan.id)}
                  disabled={isLoadingThis}
                  className={`w-full rounded-xl h-11 text-sm font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    isRecommended
                      ? 'bg-[hsl(var(--primary))] hover:bg-[hsl(244_42%_44%)] text-white shadow-[0_4px_14px_hsl(244_42%_51%/0.3)]'
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
