'use client'
import { useCurrentUser } from './use-current-user'

const PLAN_RANK: Record<string, number> = { FREE: 0, STARTER: 1, PRO: 2, ELITE: 3, INSTITUTIONAL: 4 }

export function usePlanGate(required: 'STARTER' | 'PRO' | 'ELITE') {
  const { data: user, isLoading } = useCurrentUser()
  const userRank = PLAN_RANK[user?.plan ?? 'FREE'] ?? 0
  const requiredRank = PLAN_RANK[required] ?? 0
  const allowed  = userRank >= requiredRank
  return { allowed, isLoading, userPlan: user?.plan ?? 'FREE' }
}
