'use client'
import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePlanGate } from '@/lib/hooks/use-plan-gate'

interface Props {
  required:    'STARTER' | 'PRO' | 'ELITE'
  featureName: string
  children:    ReactNode
}

const BADGE_STYLES: Record<'STARTER' | 'PRO' | 'ELITE', string> = {
  STARTER: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
  PRO:     'bg-violet-500/20 text-violet-300 border border-violet-500/40',
  ELITE:   'bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/40',
}

export function PlanGateBanner({ required, featureName, children }: Props) {
  const { allowed, isLoading } = usePlanGate(required)
  const router = useRouter()

  if (isLoading || allowed) return <>{children}</>

  return (
    <div className="flex items-center justify-center rounded-2xl border border-[#1e2f4a] bg-[#0b1527] p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <Lock className="h-6 w-6" style={{ color: '#fbbf24' }} />
        <div className="space-y-1">
          <p className="text-base font-bold text-white">Fonctionnalité {featureName}</p>
          <p className="text-sm text-slate-400">Disponible à partir du plan {required}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${BADGE_STYLES[required]}`}>
          {required}
        </span>
        <button
          type="button"
          onClick={() => router.push('/app/upgrade')}
          className="mt-2 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#18c7ff] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(124,92,255,0.28)] transition-opacity hover:opacity-90"
        >
          Passer à {required} →
        </button>
      </div>
    </div>
  )
}
