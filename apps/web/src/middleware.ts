import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isClerkEnabled } from './lib/auth-mode'

export function middleware(request: NextRequest) {
  // En mode Clerk, la vraie protection est déléguée à auth() côté serveur dans
  // app/app/layout.tsx et app/onboarding/page.tsx. Le cookie merkure_session
  // n'est posé que par le flux démo : l'exiger ici bloquait tous les
  // utilisateurs Clerk en boucle de redirection vers /sign-in.
  if (isClerkEnabled) return NextResponse.next()

  const session = request.cookies.get('merkure_session')?.value
  const { pathname } = request.nextUrl

  if ((pathname.startsWith('/app') || pathname.startsWith('/onboarding')) && !session) {
    const signIn = new URL('/sign-in', request.url)
    return NextResponse.redirect(signIn)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*', '/onboarding/:path*'],
}
