import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Désactive le replay en dev pour ne pas ralentir
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,
  replaysSessionSampleRate: 0,
  enabled: process.env.NODE_ENV === 'production',
  // Masquage explicite plutôt que de dépendre du comportement par défaut de la
  // version du SDK : le dashboard affiche des données financières (P&L, soldes)
  // et des identifiants broker qu'un enregistrement de session ne doit jamais
  // exposer en clair dans Sentry.
  integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
})
