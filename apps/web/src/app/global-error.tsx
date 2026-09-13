'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

// Remplace toute la mise en page (y compris <html>/<body>) quand l'erreur vient
// du root layout lui-même — le seul cas où error.tsx ne suffit pas.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="fr">
      <body>
        <div style={{
          display: 'flex', minHeight: '100vh', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '1rem',
          fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '0 1.5rem',
        }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Une erreur critique est survenue</h1>
          <p style={{ maxWidth: '32rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Le problème a été signalé automatiquement. Rechargez la page pour réessayer.
          </p>
          <a
            href="/"
            style={{
              borderRadius: '0.5rem', background: '#4338ca', color: 'white',
              padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
            }}
          >
            Retour à l'accueil
          </a>
        </div>
      </body>
    </html>
  )
}
