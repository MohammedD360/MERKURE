import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { isClerkEnabled } from '@/lib/auth-mode'
import { AppShell } from './AppShell'

export default async function ProtectedAppLayout({ children }: { children: ReactNode }) {
  if (isClerkEnabled) {
    const { userId } = await auth()

    if (!userId) {
      redirect('/sign-in')
    }
  }

  return <AppShell>{children}</AppShell>
}
