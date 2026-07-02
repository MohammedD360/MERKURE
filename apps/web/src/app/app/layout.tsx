import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { isClerkEnabled } from '@/lib/auth-mode'
import { AppShell } from './AppShell'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default async function ProtectedAppLayout({ children }: { children: ReactNode }) {
  if (isClerkEnabled) {
    const { userId, getToken } = await auth()

    if (!userId) {
      redirect('/sign-in')
    }

    // Redirect non-onboarded users to the wizard
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/v1/onboarding/status`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (res.ok) {
        const status = await res.json() as { onboarded: boolean }
        if (!status.onboarded) redirect('/onboarding')
      }
    } catch {
      // Non-bloquant : erreur réseau → on laisse passer
    }
  }

  return <AppShell>{children}</AppShell>
}
