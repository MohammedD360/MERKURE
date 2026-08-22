'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'

/** Schéma du plan — porté par le front, stocké tel quel dans `trading_plans.data`. */
export interface TradingPlanData {
  objectives: {
    main:         string
    profitTarget: string
    horizon:      string
    focus:        string
    keyMetric:    string
  }
  strategy: {
    style:      string
    markets:    string
    timeframes: string
    primary:    string
    secondary:  string
  }
  risk: {
    perTrade:    string
    daily:       string
    weekly:      string
    maxDrawdown: string
    minRR:       string
  }
  entryRules: string[]
  exitRules:  string[]
  filters:    string[]
  checklist:  string[]
  mindset:    string[]
}

export interface TradingPlanRecord {
  data:      Partial<TradingPlanData>
  version:   number
  createdAt: string | null
  updatedAt: string | null
}

export const EMPTY_PLAN: TradingPlanData = {
  objectives: { main: '', profitTarget: '', horizon: '', focus: '', keyMetric: '' },
  strategy:   { style: '', markets: '', timeframes: '', primary: '', secondary: '' },
  risk:       { perTrade: '', daily: '', weekly: '', maxDrawdown: '', minRR: '' },
  entryRules: [],
  exitRules:  [],
  filters:    [],
  checklist:  [],
  mindset:    [],
}

/** Complète un plan partiel venu de la base avec la forme attendue. */
export function normalizePlan(partial: Partial<TradingPlanData> | undefined): TradingPlanData {
  return {
    objectives: { ...EMPTY_PLAN.objectives, ...(partial?.objectives ?? {}) },
    strategy:   { ...EMPTY_PLAN.strategy,   ...(partial?.strategy   ?? {}) },
    risk:       { ...EMPTY_PLAN.risk,       ...(partial?.risk       ?? {}) },
    entryRules: partial?.entryRules ?? [],
    exitRules:  partial?.exitRules  ?? [],
    filters:    partial?.filters    ?? [],
    checklist:  partial?.checklist  ?? [],
    mindset:    partial?.mindset    ?? [],
  }
}

/** Part des champs réellement remplis — remplace l'ancien « score » fictif. */
export function planCompletion(plan: TradingPlanData): number {
  const textFields = [
    ...Object.values(plan.objectives),
    ...Object.values(plan.strategy),
    ...Object.values(plan.risk),
  ]
  const lists = [plan.entryRules, plan.exitRules, plan.filters, plan.checklist, plan.mindset]

  const filled = textFields.filter(v => v.trim() !== '').length + lists.filter(l => l.length > 0).length
  const total  = textFields.length + lists.length
  return total === 0 ? 0 : Math.round((filled / total) * 100)
}

export function useTradingPlan() {
  return useQuery({
    queryKey: ['trading-plan'],
    queryFn:  () => apiFetch<TradingPlanRecord>('/api/v1/trading-plan'),
  })
}

export function useSaveTradingPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TradingPlanData) =>
      apiFetch<TradingPlanRecord>('/api/v1/trading-plan', {
        method: 'PUT',
        body:   JSON.stringify({ data }),
      }),
    onSuccess: (record) => {
      queryClient.setQueryData(['trading-plan'], record)
    },
  })
}
