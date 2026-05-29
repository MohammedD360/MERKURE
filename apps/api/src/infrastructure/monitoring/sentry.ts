import * as Sentry from '@sentry/node'
import { env } from '../../config/env.js'

export function initSentry() {
  if (!env.SENTRY_DSN) return

  Sentry.init({
    dsn:         env.SENTRY_DSN,
    environment: env.NODE_ENV,
    // Traces 10% des requêtes en prod, 100% en dev pour debugger
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Ne pas envoyer les erreurs en test
    enabled: env.NODE_ENV !== 'test',
    beforeSend(event) {
      // Supprimer les données sensibles avant envoi
      if (event.request?.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['cookie']
      }
      return event
    },
  })
}

export { Sentry }
