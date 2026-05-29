import { Resend } from 'resend'
import { env } from '../../config/env.js'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    if (env.NODE_ENV === 'production') {
      // Ne devrait jamais arriver grâce à la vérification dans env.ts
      console.error(`[email] RESEND_API_KEY manquante — email non envoyé à ${to}`)
    } else {
      console.log(`[email:dev] To: ${to} | Subject: ${subject}`)
    }
    return
  }
  try {
    await resend.emails.send({ from: env.RESEND_FROM, to, subject, html })
  } catch (err) {
    console.error(`[email] Échec envoi à ${to} (${subject}):`, err instanceof Error ? err.message : err)
    // On relance en prod pour que le caller sache que l'email n'est pas parti
    if (env.NODE_ENV === 'production') throw err
  }
}

export const emailService = {
  async sendWelcome(to: string, firstName?: string | null) {
    const name = firstName ?? 'trader'
    await send(to, 'Bienvenue sur MERKURE', `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#050816;color:#e2e8f0;padding:40px 32px;border-radius:16px">
        <h1 style="font-size:24px;font-weight:900;color:#ffffff;margin:0 0 16px">Bienvenue, ${name}</h1>
        <p style="color:#94a3b8;line-height:1.7;margin:0 0 24px">Votre compte MERKURE est prêt. Connectez votre premier broker et commencez à analyser vos trades.</p>
        <a href="${env.FRONTEND_URL}/app/dashboard" style="display:inline-block;background:#0f172a;color:#fff;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none">Accéder à l'espace MERKURE →</a>
        <p style="margin-top:32px;font-size:12px;color:#475569">Vous recevez cet email car vous venez de créer un compte MERKURE.</p>
      </div>
    `)
  },

  async sendEmailVerification(to: string, verifyUrl: string) {
    await send(to, 'Vérifiez votre adresse email — MERKURE', `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#050816;color:#e2e8f0;padding:40px 32px;border-radius:16px">
        <h1 style="font-size:24px;font-weight:900;color:#ffffff;margin:0 0 16px">Vérifiez votre email</h1>
        <p style="color:#94a3b8;line-height:1.7;margin:0 0 24px">Cliquez sur le bouton ci-dessous pour confirmer votre adresse email. Ce lien expire dans 24 heures.</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#56bf6b;color:#fff;font-weight:700;padding:12px 28px;border-radius:12px;text-decoration:none">Vérifier mon email →</a>
        <p style="margin-top:24px;color:#94a3b8;font-size:14px">Si vous n'avez pas créé de compte MERKURE, ignorez cet email.</p>
        <p style="margin-top:32px;font-size:12px;color:#475569">Ce lien expire dans 24 heures.</p>
      </div>
    `)
  },

  async sendResetPassword(to: string, resetUrl: string) {
    await send(to, 'Réinitialisation de votre mot de passe', `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#050816;color:#e2e8f0;padding:40px 32px;border-radius:16px">
        <h1 style="font-size:24px;font-weight:900;color:#ffffff;margin:0 0 16px">Réinitialiser votre mot de passe</h1>
        <p style="color:#94a3b8;line-height:1.7;margin:0 0 24px">Vous avez demandé une réinitialisation de mot de passe. Ce lien expire dans 1 heure.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#7c5cff;color:#fff;font-weight:700;padding:12px 28px;border-radius:12px;text-decoration:none">Réinitialiser le mot de passe →</a>
        <p style="margin-top:24px;color:#94a3b8;font-size:14px">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
        <p style="margin-top:32px;font-size:12px;color:#475569">Ce lien expire dans 1 heure.</p>
      </div>
    `)
  },

  async sendPaymentConfirmation(to: string, plan: string, amountEuros: number) {
    await send(to, `Paiement confirmé — Plan ${plan}`, `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#050816;color:#e2e8f0;padding:40px 32px;border-radius:16px">
        <h1 style="font-size:24px;font-weight:900;color:#ffffff;margin:0 0 16px">Paiement reçu</h1>
        <p style="color:#94a3b8;line-height:1.7;margin:0 0 16px">Votre abonnement <strong style="color:#fff">Plan ${plan}</strong> est actif.</p>
        <p style="font-size:32px;font-weight:900;color:#7c5cff;margin:0 0 24px">${amountEuros.toFixed(2)} €</p>
        <a href="${env.FRONTEND_URL}/app/billing" style="display:inline-block;background:#7c5cff;color:#fff;font-weight:700;padding:12px 28px;border-radius:12px;text-decoration:none">Gérer mon abonnement →</a>
        <p style="margin-top:32px;font-size:12px;color:#475569">MERKURE — journal et analyse pour traders.</p>
      </div>
    `)
  },
}
