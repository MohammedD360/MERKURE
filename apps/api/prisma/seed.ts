import { PrismaClient, Plan, BrokerType, Direction, TradeStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Organisation de test
  const org = await prisma.organization.upsert({
    where: { slug: 'test-org' },
    update: {},
    create: {
      slug: 'test-org',
      name: 'Organisation Test',
      plan: Plan.PRO,
    },
  })

  // Utilisateur de test
  const user = await prisma.user.upsert({
    where: { email: 'trader@test.com' },
    update: {},
    create: {
      orgId: org.id,
      email: 'trader@test.com',
      passwordHash: await bcrypt.hash('Test1234!', 12),
      firstName: 'Jean',
      lastName: 'Dupont',
      onboarded: true,
      profile: {
        create: {
          style: 'DAYTRADER',
          riskAppetite: 'MEDIUM',
          markets: ['forex', 'indices'],
          experienceYears: 3,
        },
      },
    },
  })

  // Compte broker simulé
  const brokerAccount = await prisma.brokerAccount.upsert({
    where: {
      userId_brokerType_accountId: {
        userId: user.id,
        brokerType: BrokerType.MT5,
        accountId: 'demo-12345',
      },
    },
    update: {},
    create: {
      userId: user.id,
      brokerType: BrokerType.MT5,
      accountId: 'demo-12345',
      label: 'Compte Demo MT5',
      syncStatus: 'SUCCESS',
      lastSyncAt: new Date(),
    },
  })

  // Trades de démonstration
  const baseDate = new Date()
  const demoTrades = [
    { symbol: 'EURUSD', direction: Direction.LONG, pnl: 120.5, daysAgo: 1 },
    { symbol: 'GBPUSD', direction: Direction.SHORT, pnl: -45.0, daysAgo: 2 },
    { symbol: 'XAUUSD', direction: Direction.LONG, pnl: 310.0, daysAgo: 3 },
    { symbol: 'US30', direction: Direction.SHORT, pnl: -90.0, daysAgo: 4 },
    { symbol: 'EURUSD', direction: Direction.LONG, pnl: 75.0, daysAgo: 5 },
    { symbol: 'BTCUSD', direction: Direction.LONG, pnl: 450.0, daysAgo: 6 },
    { symbol: 'GBPJPY', direction: Direction.SHORT, pnl: -120.0, daysAgo: 7 },
    { symbol: 'USDJPY', direction: Direction.LONG, pnl: 55.0, daysAgo: 8 },
  ]

  for (const [i, t] of demoTrades.entries()) {
    const openTime = new Date(baseDate)
    openTime.setDate(openTime.getDate() - t.daysAgo)
    openTime.setHours(9, 30, 0, 0)

    const closeTime = new Date(openTime)
    closeTime.setHours(closeTime.getHours() + 2)

    await prisma.trade.upsert({
      where: {
        brokerAccountId_externalId: {
          brokerAccountId: brokerAccount.id,
          externalId: `seed-trade-${i + 1}`,
        },
      },
      update: {},
      create: {
        brokerAccountId: brokerAccount.id,
        userId: user.id,
        externalId: `seed-trade-${i + 1}`,
        symbol: t.symbol,
        direction: t.direction,
        openTime,
        closeTime,
        openPrice: 1.1 + Math.random() * 0.01,
        closePrice: 1.1 + Math.random() * 0.01,
        lotSize: 0.1,
        pnl: t.pnl,
        pnlPct: t.pnl / 10000,
        status: TradeStatus.CLOSED,
      },
    })
  }

  console.log('✅ Seed terminé')
  console.log(`   Email: trader@test.com`)
  console.log(`   Mot de passe: Test1234!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
