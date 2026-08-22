'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { apiFetch } from '@/lib/api-client'

interface Plan {
  id: string
  name: string
  /** `null` = tarif négocié au devis, pas de paiement en ligne. */
  priceMonthly: number | null
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
    id: 'STARTER',
    name: 'Standard',
    priceMonthly: 2900,
    currency: 'EUR',
    features: ['1 compte broker synchronisé', 'Journal de trading', 'Statistiques de base', 'Import manuel & CSV'],
  },
  {
    id: 'PRO',
    name: 'Pro',
    priceMonthly: 5900,
    currency: 'EUR',
    features: ['3 comptes brokers synchronisés', 'Toutes les fonctionnalités Standard', 'Analyses avancées', 'Suivi du risque', 'Export CSV'],
  },
  {
    id: 'ELITE',
    name: 'Elite',
    priceMonthly: 9900,
    currency: 'EUR',
    features: ['5 comptes brokers synchronisés', 'Toutes les fonctionnalités Pro', 'Analyse comportementale IA', 'Historique illimité', 'Support prioritaire'],
  },
  {
    id: 'INSTITUTIONAL',
    name: 'Sur mesure',
    priceMonthly: null,
    currency: 'EUR',
    features: ['Plus de 5 comptes brokers', 'Toutes les fonctionnalités Elite', 'Multi-utilisateurs & organisation', 'Accompagnement dédié'],
  },
]

function formatPrice(price: number | null): string {
  if (price === null) return 'Sur devis'
  return `${(price / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/mois`
}

interface PlanCardProps {
  plan: Plan
  onSelect: () => void
  disabled?: boolean
}

function PlanCard({ plan, onSelect, disabled }: PlanCardProps) {
  const isRecommended = plan.id === 'PRO'
  // Offre négociée : pas de paiement en ligne, le bouton mène au devis.
  const isQuoteOnly = plan.priceMonthly === null

  return (
    <div
      className={`relative rounded-xl border bg-background p-5 flex flex-col transition-all ${
        isRecommended
          ? 'border-[hsl(var(--primary)/0.4)] ring-1 ring-[hsl(var(--primary)/0.2)]'
          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border))]'
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-md border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.1)] px-3 py-0.5 text-xs text-[hsl(var(--primary))]">
            Recommandé
          </span>
        </div>
      )}

      <div className="mb-4">
        <p className="text-xs text-muted-foreground">{plan.name}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">
          {formatPrice(plan.priceMonthly)}
        </p>
      </div>

      <ul className="mb-6 flex-1 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[hsl(var(--primary))]" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        className={`w-full rounded-lg h-11 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          isQuoteOnly
            ? 'border border-[hsl(var(--border))] bg-[hsl(var(--accent))] text-foreground/80 hover:bg-[hsl(var(--accent))]'
            : isRecommended
            ? 'bg-[hsl(var(--primary))] hover:bg-[hsl(243_90%_58%)] text-white shadow-sm'
            : 'border border-[hsl(var(--border))] bg-[hsl(var(--accent))] text-foreground/80 hover:bg-[hsl(var(--accent))]'
        }`}
      >
        {isQuoteOnly ? 'Demander un devis' : `Choisir ${plan.name}`}
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
              if (plan.priceMonthly === null) {
                window.location.href =
                  'mailto:support@merkure360.com?subject=Demande%20de%20devis%20—%20offre%20sur%20mesure'
              } else {
                onSelectPaid(plan.id)
              }
            }}
          />
        ))}
      </div>

      {/* Aucune offre gratuite n'est vendue, mais on laisse terminer l'inscription
          sans payer : le compte reste sans abonnement, donc sans connexion broker,
          et l'utilisateur découvre le journal manuel avant de choisir. */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onSelectFree}
          disabled={loading ?? false}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors disabled:opacity-50"
        >
          Continuer sans abonnement
        </button>
      </div>
    </div>
  )
}
