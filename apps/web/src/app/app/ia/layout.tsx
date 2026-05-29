import type { ReactNode } from 'react'
import { PlanGateBanner } from '@/shared/components/PlanGateBanner'

export default function IaLayout({ children }: { children: ReactNode }) {
  return (
    <PlanGateBanner required="PRO" featureName="Intelligence IA">
      {children}
    </PlanGateBanner>
  )
}
