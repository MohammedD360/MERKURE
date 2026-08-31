import type { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import { prisma } from '../../infrastructure/database/client.js'
import { env } from '../../config/env.js'
import { cache } from '../../infrastructure/cache/redis.js'

const EXCHANGE_TTL_SECONDS = 60
function exchangeKey(code: string): string {
  return `oauth:exchange:${code}`
}

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

        // Le JWT ne transite jamais par l'URL (historique navigateur, logs serveur/
        // proxy, Referer) : on redirige avec un code opaque à usage unique et durée
        // de vie courte, que le front échange contre le vrai jeton via un POST.
        const exchangeCode = crypto.randomBytes(32).toString('hex')
        await cache.set(
          exchangeKey(exchangeCode),
          { token, user: { id: user.id, email: user.email, plan } },
          EXCHANGE_TTL_SECONDS,
        )

        return reply.redirect(
          `${env.FRONTEND_URL}/auth/google/callback?code=${exchangeCode}`,
        )
      } catch {
        return reply.redirect(`${env.FRONTEND_URL}/sign-in?error=google_failed`)
      }
    },
  )

  // ─── Step 3: Front échange le code opaque contre le vrai JWT ─────────────────
  app.post<{ Body: { code?: string } }>(
    '/google/exchange',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (req, reply) => {
      const { code } = req.body ?? {}
      if (!code || typeof code !== 'string') {
        return reply.code(400).send({ error: 'missing_code' })
      }

      const key = exchangeKey(code)
      const payload = await cache.get<{ token: string; user: { id: string; email: string | null; plan: string } }>(key)
      if (!payload) {
        return reply.code(400).send({ error: 'code_invalid_or_expired' })
      }
      await cache.del(key) // usage unique

      return payload
    },
  )
}
