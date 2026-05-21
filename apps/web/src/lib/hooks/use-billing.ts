'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export function useSubscription() {
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => api.billing.subscription(),
  })
}

export function usePlans() {
  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: () => api.billing.plans(),
  })
}

export function useCheckout() {
  return useMutation({
    mutationFn: (plan: string) => api.billing.checkout(plan),
    onSuccess: (data) => {
      window.location.href = data.url
    },
  })
}

export function usePortal() {
  return useMutation({
    mutationFn: () => api.billing.portal(),
    onSuccess: (data) => {
      window.location.href = data.url
    },
  })
}
