import type { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import { prisma } from '../../infrastructure/database/client.js'
import { env } from '../../config/env.js'

const GOOGLE_AUTH_URL    = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL   = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

interface GoogleUserInfo {
  id:             string
  email:          string
  given_name?:    string
  family_name?:   string
  verified_email: boolean
}

interface GoogleTokenResponse {
  access_token?: string
  error?:        string
}

export async function googleOAuthRoutes(app: FastifyInstance) {
  // ─── Step 1: Redirect user to Google consent page ────────────────────────────
  app.get('/google', async (req, reply) => {
    if (!env.GOOGLE_CLIENT_ID) {
      return reply.code(501).send({ error: 'google_oauth_not_configured' })
    }

    const state = crypto.randomBytes(16).toString('hex')

    reply.setCookie('_oauth_state', state, {
      httpOnly: true,
      secure:   env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   600, // 10 min
      path:     '/',
    })

    const params = new URLSearchParams({
      client_id:     env.GOOGLE_CLIENT_ID,
      redirect_uri:  env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope:         'openid email profile',
      state,
      access_type:   'online',
      prompt:        'select_account',
    })

    return reply.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`)
  })

  // ─── Step 2: Google redirects back here with ?code=... ───────────────────────
  app.get<{ Querystring: { code?: string; state?: string; error?: string } }>(
    '/google/callback',
    async (req, reply) => {
      const { code, state, error } = req.query

      if (error || !code) {
        return reply.redirect(`${env.FRONTEND_URL}/sign-in?error=google_denied`)
      }

      const cookieState = req.cookies['_oauth_state']
      if (!cookieState || cookieState !== state) {
        return reply.redirect(`${env.FRONTEND_URL}/sign-in?error=invalid_state`)
      }
      reply.clearCookie('_oauth_state', { path: '/' })

      if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        return reply.redirect(`${env.FRONTEND_URL}/sign-in?error=google_not_configured`)
      }

      try {
        // Exchange authorization code for access token
        const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
          method:  'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id:     env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            redirect_uri:  env.GOOGLE_REDIRECT_URI,
            grant_type:    'authorization_code',
          }),
        })

        const tokenData = await tokenRes.json() as GoogleTokenResponse
        if (!tokenData.access_token) {
          return reply.redirect(`${env.FRONTEND_URL}/sign-in?error=google_token_failed`)
        }

        // Fetch user profile from Google
        const userRes   = await fetch(GOOGLE_USERINFO_URL, {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        })
        const googleUser = await userRes.json() as GoogleUserInfo

        if (!googleUser.email || !googleUser.verified_email) {
          return reply.redirect(`${env.FRONTEND_URL}/sign-in?error=google_unverified_email`)
        }

        const googleClerkId = `google_${googleUser.id}`

        // Find user by Google ID (returning user)
        let user = await prisma.user.findUnique({
          where:  { clerkId: googleClerkId },
          select: { id: true, email: true },
        })

        if (!user) {
          // Check if an account already exists with this email (password signup)
          const existing = await prisma.user.findUnique({
            where:  { email: googleUser.email },
            select: { id: true, email: true },
          })

          if (existing) {
            // Link Google to existing password account
            await prisma.user.update({
              where: { id: existing.id },
              data:  { clerkId: googleClerkId },
            })
            user = existing
          } else {
            // Create brand-new account
            user = await prisma.$transaction(async (tx) => {
              const created = await tx.user.create({
                data: {
                  email:        googleUser.email,
                  clerkId:      googleClerkId,
                  firstName:    googleUser.given_name  ?? null,
                  lastName:     googleUser.family_name ?? null,
                  passwordHash: null,
                },
              })
              await tx.subscription.create({
                data: { userId: created.id, plan: 'FREE', status: 'ACTIVE' },
              })
              return created
            })
          }
        }

        const subscription = await prisma.subscription.findUnique({
          where:  { userId: user.id },
          select: { plan: true },
        })
        const plan = subscription?.plan ?? 'FREE'

        const token = app.jwt.sign(
          { id: user.id, email: user.email ?? '', plan },
          { expiresIn: '7d' },
        )

        return reply.redirect(
          `${env.FRONTEND_URL}/auth/google/callback?token=${encodeURIComponent(token)}`,
        )
      } catch {
        return reply.redirect(`${env.FRONTEND_URL}/sign-in?error=google_failed`)
      }
    },
  )
}
