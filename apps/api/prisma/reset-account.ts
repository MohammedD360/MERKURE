/**
 * Reset des données trading d'un compte — identifié par email.
 * Supprime trades, comptes broker, KPI, journal (manuel + IA), alertes.
 * Remet onboarded=false. Le user, son login et son abonnement restent intacts.
 *
 * Usage: tsx --env-file .env prisma/reset-account.ts <email>
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    throw new Error('Usage: tsx prisma/reset-account.ts <email>')
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error(`Aucun utilisateur trouvé avec l'email ${email}`)
  }

  const userId = user.id
  console.log(`🗑️  Réinitialisation des données trading pour ${email} (${userId})...\n`)

  await prisma.aiJournalEntry.deleteMany({ where: { userId } })
  await prisma.journalEntry.deleteMany({ where: { userId } })
  await prisma.kpiSnapshot.deleteMany({ where: { userId } })
  await prisma.alert.deleteMany({ where: { userId } })
  await prisma.trade.deleteMany({ where: { userId } })
  await prisma.brokerAccount.deleteMany({ where: { userId } })

  await prisma.user.update({
    where: { id: userId },
    data: { onboarded: false },
  })

  console.log('✅  Données trading supprimées, onboarding à refaire.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
