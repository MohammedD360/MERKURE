/**
 * Crée ou met à jour l'espace de connexion Laura
 * Usage: pnpm exec tsx prisma/seed-laura-account.ts
 */
import { PrismaClient, Plan, BrokerType, AccountType, Direction, TradeStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const EMAIL = 'laura@merkure.app'
const PASSWORD = 'Merkure2026!'
const FIRST_NAME = 'Laura'
const LAST_NAME = 'Laborde'

async function main() {
  console.log('Création de l\'espace Laura…')

  const passwordHash = await bcrypt.hash(PASSWORD, 12)

  const org = await prisma.organization.upsert({
    where: { slug: 'merkure-laura' },
    update: { name: 'MERKURE Laura', plan: Plan.ELITE },
    create: { slug: 'merkure-laura', name: 'MERKURE Laura', plan: Plan.ELITE },
  })

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {
      passwordHash,
      firstName: FIRST_NAME,
      lastName: LAST_NAME,
      onboarded: true,
      emailVerified: true,
      timezone: 'Europe/Paris',
      currency: 'EUR',
      orgId: org.id,
    },
    create: {
      orgId: org.id,
      clerkId: `local_laura_${Date.now()}`,
      email: EMAIL,
      passwordHash,
      firstName: FIRST_NAME,
      lastName: LAST_NAME,
      onboarded: true,
      emailVerified: true,
      timezone: 'Europe/Paris',
      currency: 'EUR',
      profile: {
        create: {
          style: 'DAYTRADER',
          riskAppetite: 'MEDIUM',
          markets: ['forex', 'indices'],
          experienceYears: 4,
        },
      },
    },
  })

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: { plan: Plan.ELITE, status: 'ACTIVE' },
    create: { userId: user.id, plan: Plan.ELITE, status: 'ACTIVE' },
  })

  const brokerAccount = await prisma.brokerAccount.upsert({
    where: {
      userId_brokerType_accountId: {
        userId: user.id,
        brokerType: BrokerType.MT5,
        accountId: 'laura-demo-001',
      },
    },
    update: { syncStatus: 'SUCCESS', lastSyncAt: new Date(), isActive: true },
    create: {
      userId: user.id,
      brokerType: BrokerType.MT5,
      accountType: AccountType.DEMO,
      accountId: 'laura-demo-001',
      label: 'Compte Démo Laura',
      syncStatus: 'SUCCESS',
      lastSyncAt: new Date(),
      isActive: true,
    },
  })

  const existingTrades = await prisma.trade.count({ where: { userId: user.id } })
  if (existingTrades === 0) {
    const baseDate = new Date()
    const demoTrades = [
      { symbol: 'EURUSD', direction: Direction.LONG, pnl: 185.5, daysAgo: 1 },
      { symbol: 'XAUUSD', direction: Direction.LONG, pnl: 420.0, daysAgo: 2 },
      { symbol: 'GBPUSD', direction: Direction.SHORT, pnl: -62.0, daysAgo: 3 },
      { symbol: 'NAS100', direction: Direction.LONG, pnl: 310.0, daysAgo: 4 },
      { symbol: 'US30', direction: Direction.SHORT, pnl: -95.0, daysAgo: 5 },
      { symbol: 'USDJPY', direction: Direction.LONG, pnl: 78.0, daysAgo: 6 },
    ]

    for (const [i, t] of demoTrades.entries()) {
      const openTime = new Date(baseDate)
      openTime.setDate(openTime.getDate() - t.daysAgo)
      openTime.setHours(10, 15, 0, 0)
      const closeTime = new Date(openTime)
      closeTime.setHours(closeTime.getHours() + 1)

      await prisma.trade.create({
        data: {
          brokerAccountId: brokerAccount.id,
          userId: user.id,
          externalId: `laura-account-seed-${i + 1}`,
          symbol: t.symbol,
          direction: t.direction,
          openTime,
          closeTime,
          openPrice: 1.1,
          closePrice: 1.101,
          lotSize: 0.1,
          pnl: t.pnl,
          pnlPct: t.pnl / 10_000,
          status: TradeStatus.CLOSED,
        },
      })
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Espace Laura prêt')
  console.log(`  Email    : ${EMAIL}`)
  console.log(`  Mot de passe : ${PASSWORD}`)
  console.log('  Plan     : ELITE')
  console.log('  Onboarding : terminé')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())