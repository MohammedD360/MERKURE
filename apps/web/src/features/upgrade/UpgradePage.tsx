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
  FREE:    'text-slate-400',
  STARTER: 'text-blue-400',
  PRO:     'text-violet-400',
  ELITE:   'text-[#fbbf24]',
}

const PLAN_RING: Record<string, string> = {
  FREE:    '',
  STARTER: '',
  PRO:     'ring-1 ring-violet-500/30 border-violet-500/40',
  ELITE:   'ring-1 ring-[#fbbf24]/30 border-[#fbbf24]/40',
}

const FALLBACK_PLANS: Plan[] = [
  { id: 'FREE',    name: 'Gratuit', priceMonthly: 0,    currency: 'EUR', features: ['10 trades/mois', 'KPIs de base', 'Journal manuel'] },
  { id: 'STARTER', name: 'Starter', priceMonthly: 900,  currency: 'EUR', features: ['Journal de trading', 'Statistiques de base', 'Import manuel & CSV', '1 compte broker'] },
  { id: 'PRO',     name: 'Trader',  priceMonthly: 1900, currency: 'EUR', features: ['Toutes les fonctionnalités Starter', 'Analyses avancées', 'Suivi du risque', 'Jusqu’à 3 comptes brokers'] },
  { id: 'ELITE',   name: 'Pro',     priceMonthly: 4900, currency: 'EUR', features: ['Toutes les fonctionnalités Trader', 'Analyse comportementale IA', 'Exports avancés', 'Connexions brokers illimitées'] },
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
        <h1 className="text-2xl font-black text-white">Changer de plan</h1>
        <p className="text-sm text-slate-400 mt-1">
          Plan actuel : <span className={`font-bold ${PLAN_COLORS[currentPlan] ?? 'text-white'}`}>{getPlanDisplayName(currentPlan)}</span>
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/25 bg-red-400/[0.08] px-4 py-3 text-sm text-red-200">
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
                  ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : PLAN_RING[plan.id] || 'border-white/10'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-300 whitespace-nowrap">
                    Plan actuel
                  </span>
                </div>
              )}
              {isRecommended && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-violet-300 whitespace-nowrap">
                    Recommandé
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {Icon && <Icon className={`w-4 h-4 ${PLAN_COLORS[plan.id] ?? 'text-slate-400'}`} />}
                  <p className={`text-[11px] font-black uppercase tracking-wider ${PLAN_COLORS[plan.id] ?? 'text-slate-500'}`}>
                    {plan.name}
                  </p>
                </div>
                <p className="text-2xl font-black text-white">{formatPrice(plan.priceMonthly)}</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#56bf6b]" />
                    <span className="text-sm text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button
                  type="button"
                  disabled
                  className="w-full rounded-xl h-11 text-sm font-black border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 cursor-default"
                >
                  Plan actuel
                </button>
              ) : plan.id === 'FREE' ? (
                <button
                  type="button"
                  onClick={() => router.push('/app/billing')}
                  className="w-full rounded-xl h-11 text-sm font-black border border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] transition-colors"
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
                      ? 'bg-gradient-to-r from-[#7c5cff] to-[#9b6dff] hover:opacity-90 text-white shadow-[0_6px_20px_rgba(124,92,255,0.25)]'
                      : 'border border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.10]'
                  }`}
                >
                  {isLoadingThis ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

      <p className="text-center text-xs text-slate-600">
        Paiement sécurisé via Stripe · Résiliation à tout moment · Sans engagement
      </p>
    </div>
  )
}
