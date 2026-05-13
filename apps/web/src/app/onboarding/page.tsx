import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { isClerkEnabled } from '@/lib/auth-mode'
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  if (isClerkEnabled) {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')
  }

  return <OnboardingWizard />
}
