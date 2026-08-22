import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import type { ReactNode } from 'react'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'

import { isClerkEnabled } from '@/lib/auth-mode'
import { APP_THEME_INIT_SCRIPT } from '@/lib/hooks/use-app-theme'
import { Providers } from './providers'
import '../index.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-primary',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MERKURE',
  description: 'MERKURE - analytics, risk management and trading journal for serious traders.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const content = <Providers>{children}</Providers>

  return (
    <html lang="fr" className={`${inter.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <head>
        {/* Pose le thème de l'app avant le premier paint : pas de flash, pas d'écart d'hydratation */}
        <script dangerouslySetInnerHTML={{ __html: APP_THEME_INIT_SCRIPT }} />
      </head>
      <body className={inter.className}>{isClerkEnabled ? <ClerkProvider>{content}</ClerkProvider> : content}</body>
    </html>
  )
}
