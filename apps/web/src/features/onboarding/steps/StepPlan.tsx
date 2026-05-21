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
    name: 'FREE',
    priceMonthly: 0,
    currency: 'EUR',
    features: ['10 trades/mois', 'KPIs de base', 'Journal manuel'],
  },
  {
    id: 'STARTER',
    name: 'STARTER',
    priceMonthly: 19,
    currency: 'EUR',
    features: ['Trades illimités', 'Sync broker 1', 'KPIs avancés', 'Journal IA'],
  },
  {
    id: 'PRO',
    name: 'PRO',
    priceMonthly: 49,
    currency: 'EUR',
    features: ['Sync broker 3', 'Analytics avancés', 'Alertes', 'Coach IA'],
  },
  {
    id: 'ELITE',
    name: 'ELITE',
    priceMonthly: 129,
    currency: 'EUR',
    features: ['Sync broker illimité', 'Rapports PDF', 'API access', 'Support'],
  },
]

function formatPrice(price: number): string {
  if (price === 0) return 'Gratuit'
  return `${price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/mois`
}

interface PlanCardProps {
  plan: Plan
  onSelect: () => void
  disabled?: boolean
}

function PlanCard({ plan, onSelect, disabled }: PlanCardProps) {
  const isPro = plan.name === 'PRO'
  const isFree = plan.priceMonthly === 0

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-5 transition-all ${
        isPro
          ? 'border-[#7c5cff] shadow-[0_0_24px_rgba(124,92,255,0.18)] bg-[#0b1527]'
          : 'border-[#1e2f4a] bg-[#0b1527] hover:border-[#7c5cff]/40'
      }`}
    >
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-[#7c5cff] px-3 py-0.5 text-[10px] font-black tracking-widest text-white uppercase">
            POPULAIRE
          </span>
        </div>
      )}

      <div className="mb-4">
        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">{plan.name}</p>
        <p className={`mt-1 text-xl font-black ${isPro ? 'text-[#a78bfa]' : 'text-white'}`}>
          {formatPrice(plan.priceMonthly)}
        </p>
      </div>

      <ul className="mb-6 flex-1 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${isPro ? 'text-[#7c5cff]' : 'text-emerald-500'}`} />
            <span className="text-xs text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          isFree
            ? 'border border-[#1e2f4a] bg-[#1e2f4a] text-gray-200 hover:bg-[#263d5e]'
            : 'bg-[#7c5cff] text-white hover:bg-[#6b4eee]'
        }`}
      >
        {isFree ? 'Commencer gratuitement' : `Choisir ${plan.name}`}
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
      <div className="mb-6 text-center">
        <h2 className="text-xl font-black text-white">Choisissez votre plan</h2>
        <p className="mt-1 text-sm text-gray-400">Commencez gratuitement, upgradez à tout moment.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
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
