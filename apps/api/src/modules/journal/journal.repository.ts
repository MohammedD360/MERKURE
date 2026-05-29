import { prisma } from '../../infrastructure/database/client.js'

export interface JournalEntryData {
  mood?:        string | null
  planBefore?:  string | null
  reviewAfter?: string | null
  notes?:       string | null
}

export interface CalendarDay {
  date:        string   // YYYY-MM-DD
  hasEntry:    boolean
  mood:        string | null
  dailyPnl:    number | null
  tradeCount:  number
}

export const journalRepository = {

  async getCalendar(userId: string, year: number, month: number): Promise<CalendarDay[]> {
    const from = new Date(Date.UTC(year, month - 1, 1))
    const to   = new Date(Date.UTC(year, month, 1))

    const [entries, trades] = await Promise.all([
      prisma.journalEntry.findMany({
        where:  { userId, date: { gte: from, lt: to } },
        select: { date: true, mood: true },
      }),
      prisma.trade.findMany({
        where:  { userId, status: 'CLOSED', closeTime: { gte: from, lt: to } },
        select: { closeTime: true, pnl: true },
      }),
    ])

    const entryMap = new Map<string, { mood: string | null }>()
    for (const e of entries) {
      const key = e.date.toISOString().slice(0, 10)
      entryMap.set(key, { mood: e.mood })
    }

    const tradeMap = new Map<string, { pnl: number; count: number }>()
    for (const t of trades) {
      if (!t.closeTime) continue
      const key = t.closeTime.toISOString().slice(0, 10)
      const cur = tradeMap.get(key) ?? { pnl: 0, count: 0 }
      cur.pnl   += Number(t.pnl ?? 0)
      cur.count += 1
      tradeMap.set(key, cur)
    }

    // Build one record per calendar day
    const daysInMonth = new Date(year, month, 0).getDate()
    const days: CalendarDay[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const entry   = entryMap.get(dateStr)
      const trade   = tradeMap.get(dateStr)
      days.push({
        date:       dateStr,
        hasEntry:   !!entry,
        mood:       entry?.mood ?? null,
        dailyPnl:   trade ? parseFloat(trade.pnl.toFixed(2)) : null,
        tradeCount: trade?.count ?? 0,
      })
    }
    return days
  },

  async getEntry(userId: string, date: string) {
    return prisma.journalEntry.findUnique({
      where: { userId_date: { userId, date: new Date(date + 'T00:00:00.000Z') } },
    })
  },

  async upsertEntry(userId: string, date: string, data: JournalEntryData) {
    const d = new Date(date + 'T00:00:00.000Z')
    return prisma.journalEntry.upsert({
      where:  { userId_date: { userId, date: d } },
      create: { userId, date: d, ...data },
      update: { ...data, updatedAt: new Date() },
    })
  },

  async deleteEntry(userId: string, date: string) {
    return prisma.journalEntry.deleteMany({
      where: { userId, date: new Date(date + 'T00:00:00.000Z') },
    })
  },
}
