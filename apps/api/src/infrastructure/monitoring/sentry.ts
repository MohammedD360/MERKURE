import * as Sentry from '@sentry/node'
import { env } from '../../config/env.js'

// Paramètres susceptibles de porter un secret en clair dans l'URL (reset
// password, code OAuth, jeton de vérification email…) — Sentry capture l'URL
// complète de la requête, ce filtre évite de les faire atterrir dans les
// événements d'erreur.
const SENSITIVE_QUERY_PARAMS = /token|code|password|secret|key/i

function scrubQueryString(qs: string): string {
  const params = new URLSearchParams(qs)
  for (const name of [...params.keys()]) {
    if (SENSITIVE_QUERY_PARAMS.test(name)) params.set(name, '[Filtered]')
  }
  return params.toString()
}

function scrubUrl(url: string): string {
  const [path, qs] = url.split('?')
  return qs ? `${path}?${scrubQueryString(qs)}` : url
}

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
      if (event.request?.query_string && typeof event.request.query_string === 'string') {
        event.request.query_string = scrubQueryString(event.request.query_string)
      }
      if (event.request?.url) {
        event.request.url = scrubUrl(event.request.url)
      }
      return event
    },
  })
}

export { Sentry }
