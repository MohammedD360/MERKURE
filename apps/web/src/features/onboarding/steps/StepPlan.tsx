'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { apiFetch } from '@/lib/api-client'

interface Plan {
  id: string
  name: string
  priceMonthly: number
  currency: string
  features: string[]
}

interface Props {
  onSelectFree: () => void
  onSelectPaid: (planId: string) => void
  loading?: boolean
}

const FALLBACK_PLANS: Plan[] = [
  {
    id: 'FREE',
    name: 'Gratuit',
    priceMonthly: 0,
    currency: 'EUR',
    features: ['10 trades/mois', 'KPIs de base', 'Journal manuel'],
  },
  {
    id: 'STARTER',
    name: 'Starter',
    priceMonthly: 900,
    currency: 'EUR',
    features: ['Journal de trading', 'Statistiques de base', 'Import manuel & CSV', '1 compte broker'],
  },
  {
    id: 'PRO',
    name: 'Trader',
    priceMonthly: 1900,
    currency: 'EUR',
    features: ['Toutes les fonctionnalités Starter', 'Analyses avancées', 'Suivi du risque', 'Rapports personnalisés', 'Jusqu’à 3 comptes brokers'],
  },
  {
    id: 'ELITE',
    name: 'Pro',
    priceMonthly: 4900,
    currency: 'EUR',
    features: ['Toutes les fonctionnalités Trader', 'Analyse comportementale IA', 'Exports avancés', 'Connexions brokers illimitées', 'Support prioritaire'],
  },
]

function formatPrice(price: number): string {
  if (price === 0) return 'Gratuit'
  return `${(price / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/mois`
}

interface PlanCardProps {
  plan: Plan
  onSelect: () => void
  disabled?: boolean
}

function PlanCard({ plan, onSelect, disabled }: PlanCardProps) {
  const isRecommended = plan.id === 'PRO'
  const isFree = plan.priceMonthly === 0

  return (
    <div
      className={`relative rounded-xl border bg-background p-5 flex flex-col transition-all ${
        isRecommended
          ? 'border-blue-500/40 ring-1 ring-blue-500/20'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-md border border-blue-300/20 bg-blue-300/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-blue-200">
            Recommandé
          </span>
        </div>
      )}

      <div className="mb-4">
        <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">{plan.name}</p>
        <p className="mt-1 text-2xl font-black text-white">
          {formatPrice(plan.priceMonthly)}
        </p>
      </div>

      <ul className="mb-6 flex-1 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#56bf6b]" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        className={`w-full rounded-lg h-11 text-sm font-black transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          isFree
            ? 'border border-white/15 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]'
            : isRecommended
            ? 'bg-[#56bf6b] hover:bg-[#49ab5e] text-white shadow-[0_6px_20px_rgba(86,191,107,0.22)]'
            : 'border border-white/15 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]'
        }`}
      >
        {isFree ? 'Continuer en gratuit' : `Choisir ${plan.name}`}
      </button>
    </div>
  )
}

export function StepPlan({ onSelectFree, onSelectPaid, loading }: Props) {
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    apiFetch<Plan[]>('/api/v1/billing/plans')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPlans(data)
      })
      .catch(() => setFetchError(true))
  }, [])

  void fetchError

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            disabled={loading ?? false}
            onSelect={() => {
              if (plan.priceMonthly === 0) {
                onSelectFree()
              } else {
                onSelectPaid(plan.id)
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}
