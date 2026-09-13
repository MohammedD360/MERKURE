'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[hsl(var(--background))] px-6 text-center">
      <h1 className="text-xl font-semibold text-foreground">Une erreur est survenue</h1>
      <p className="max-w-md text-sm text-[hsl(var(--foreground-soft))]">
        Le problème a été signalé automatiquement. Vous pouvez réessayer, ou revenir au tableau de bord.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:bg-[hsl(243_90%_58%)]"
        >
          Réessayer
        </button>
        <a
          href="/app/dashboard"
          className="rounded-lg border border-[hsl(var(--border))] bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-[hsl(var(--accent))]"
        >
          Retour au dashboard
        </a>
      </div>
    </div>
  )
}
