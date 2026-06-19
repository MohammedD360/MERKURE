/**
 * Reset complet — supprime toutes les données sauf le user et son abonnement ELITE
 * Puis crée un compte Apex Trader Funding $25 000 vierge prêt à l'emploi
 */
import { PrismaClient, BrokerType, AccountType, SyncStatus } from '@prisma/client'

const prisma = new PrismaClient()

const USER_ID = 'demo_user_merkure'

async function main() {
  console.log('🗑️  Suppression de toutes les données...\n')

  await prisma.aiJournalEntry.deleteMany({ where: { userId: USER_ID } })
  await prisma.journalEntry.deleteMany({ where: { userId: USER_ID } })
  await prisma.kpiSnapshot.deleteMany({ where: { userId: USER_ID } })
  await prisma.alert.deleteMany({ where: { userId: USER_ID } })
  await prisma.trade.deleteMany({ where: { userId: USER_ID } })
  await prisma.strategy.deleteMany({ where: { userId: USER_ID } })
  await prisma.brokerAccount.deleteMany({ where: { userId: USER_ID } })
  await prisma.traderProfile.deleteMany({ where: { userId: USER_ID } })

  console.log('✅  Données supprimées\n')

  await prisma.user.update({
    where: { id: USER_ID },
    data: {
      firstName: null,
      lastName:  null,
      onboarded: false,
      avatarUrl: null,
    },
  })

  // ── Compte Apex $25 000 ────────────────────────────────────────────────────
  const account = await prisma.brokerAccount.create({
    data: {
      userId:      USER_ID,
      label:       'Apex – Challenge $25K',
      brokerType:  BrokerType.MT5,
      accountType: AccountType.PROP_CHALLENGE,
      accountId:   'APEX-25K-001',
      syncStatus:  SyncStatus.PENDING,
      isActive:    true,
    },
  })

  // ── KPI snapshot initial (solde de départ) ─────────────────────────────────
  await prisma.kpiSnapshot.create({
    data: {
      userId:      USER_ID,
      date:        new Date(),
      balance:     25_000,
      equity:      25_000,
      totalPnl:    0,
      winRate:     0,
      profitFactor: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      nbTrades:    0,
      avgRr:       0,
    },
  })

  console.log('🏆  Compte Apex $25 000 créé :', account.id)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Login : demo@merkure.app')
  console.log('  MDP   : Demo1234!')
  console.log('  Plan  : ELITE')
  console.log('  Compte: Apex – Challenge $25K ($25 000)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
