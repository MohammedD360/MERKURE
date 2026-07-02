import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { isClerkEnabled } from '@/lib/auth-mode'
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default async function OnboardingPage() {
  if (isClerkEnabled) {
    const { userId, getToken } = await auth()
    if (!userId) redirect('/sign-in')

    // Redirect already-onboarded users to the dashboard
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/v1/onboarding/status`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (res.ok) {
        const status = await res.json() as { onboarded: boolean }
        if (status.onboarded) redirect('/app/dashboard')
      }
    } catch {
      // En cas d'erreur réseau, on affiche le wizard
    }
  }

  return <OnboardingWizard />
}
