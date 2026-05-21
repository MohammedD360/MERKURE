import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
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
