import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import type { ReactNode } from 'react'

import { isClerkEnabled } from '@/lib/auth-mode'
import { Providers } from './providers'
import '../index.css'

export const metadata: Metadata = {
  title: 'MERKURE',
  description: 'MERKURE - analytics, risk management and trading account cockpit.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const content = <Providers>{children}</Providers>

  return (
    <html lang="fr">
      <body>{isClerkEnabled ? <ClerkProvider>{content}</ClerkProvider> : content}</body>
    </html>
  )
}
