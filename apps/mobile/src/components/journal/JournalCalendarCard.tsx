import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import type { CalendarDay } from '@/src/lib/api-client'
import { formatMoney } from '@/src/lib/format'
import { colors, fonts, radius } from '@/src/lib/theme'

const DAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function pnlBg(pnl: number | null | undefined, selected: boolean, today: boolean) {
  if (selected) return { backgroundColor: `${colors.primary}26`, borderColor: colors.primary }
  if (today) return { backgroundColor: colors.primaryLight, borderColor: colors.border }
  if (pnl == null) return { backgroundColor: 'transparent', borderColor: 'transparent' }
  if (pnl > 200) return { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }
  if (pnl > 0) return { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }
  if (pnl < -200) return { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }
  if (pnl < 0) return { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }
  return { backgroundColor: colors.primaryLight, borderColor: colors.border }
}

function fmtPnlShort(pnl: number): string {
  const abs = Math.abs(pnl)
  const sign = pnl >= 0 ? '+' : ''
  if (abs >= 1000) return `${sign}${(pnl / 1000).toFixed(1)}k`
  return `${sign}${pnl.toFixed(0)}`
}

interface Props {
  year: number
  month: number
  days: CalendarDay[]
  selectedDate: string
  onSelectDate: (date: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function JournalCalendarCard({
  year,
  month,
  days,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const firstDow = (new Date(year, month - 1, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month, 0).getDate()

  const dayMap = new Map<string, CalendarDay>()
  for (const d of days) dayMap.set(d.date, d)

  const monthPnl = days.reduce((s, d) => s + (d.dailyPnl ?? 0), 0)
  const tradingDays = days.filter((d) => d.dailyPnl != null).length
  const winDays = days.filter((d) => (d.dailyPnl ?? 0) > 0).length

  return (
    <View>
      <View style={styles.calHead}>
        <Pressable onPress={onPrevMonth} style={styles.navBtn}>
          <ChevronLeft size={18} color={colors.foreground} />
        </Pressable>
        <Text style={styles.month}>
          {MONTHS_FR[month - 1]} {year}
        </Text>
        <Pressable onPress={onNextMonth} style={styles.navBtn}>
          <ChevronRight size={18} color={colors.foreground} />
        </Pressable>
      </View>

      {tradingDays > 0 ? (
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>P&L</Text>
            <Text style={[styles.summaryValue, { color: monthPnl >= 0 ? colors.profit : colors.loss }]}>
              {formatMoney(monthPnl, true)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Sessions</Text>
            <Text style={styles.summaryValue}>{tradingDays}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Win days</Text>
            <Text style={[styles.summaryValue, { color: colors.profit }]}>
              {Math.round((winDays / tradingDays) * 100)}%
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.weekRow}>
        {DAYS_SHORT.map((d, i) => (
          <Text key={`${d}-${i}`} style={styles.weekDay}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {Array.from({ length: firstDow }).map((_, i) => (
          <View key={`e-${i}`} style={styles.dayCell} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1
          const day = String(dayNum).padStart(2, '0')
          const date = `${year}-${String(month).padStart(2, '0')}-${day}`
          const info = dayMap.get(date)
          const pnl = info?.dailyPnl
          const bg = pnlBg(pnl, date === selectedDate, date === today)

          return (
            <Pressable
              key={date}
              onPress={() => onSelectDate(date)}
              style={[styles.dayCell, styles.dayBtn, bg]}
            >
              <Text style={[styles.dayNum, date === selectedDate && { color: colors.primary }]}>{dayNum}</Text>
              {pnl != null ? (
                <Text style={[styles.pnlMini, { color: pnl >= 0 ? colors.profit : colors.loss }]}>
                  {fmtPnlShort(pnl)}
                </Text>
              ) : null}
              {info?.hasEntry ? <View style={styles.journalDot} /> : null}
            </Pressable>
          )
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={styles.legendDotPrimary} />
          <Text style={styles.legendText}>Entrée journal</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendSwatch, { backgroundColor: '#DCFCE7' }]} />
          <View style={[styles.legendSwatch, { backgroundColor: '#FEE2E2' }]} />
          <Text style={styles.legendText}>Jour + / −</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  calHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  month: { fontFamily: fonts.bold, fontSize: 15, color: colors.foreground },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontFamily: fonts.medium, fontSize: 9, color: colors.muted, textTransform: 'uppercase' },
  summaryValue: { fontFamily: fonts.bold, fontSize: 12, color: colors.foreground, marginTop: 2 },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekDay: { flex: 1, textAlign: 'center', fontFamily: fonts.bold, fontSize: 10, color: `${colors.muted}88` },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', minHeight: 44 },
  dayBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 4,
    marginBottom: 2,
  },
  dayNum: { fontFamily: fonts.bold, fontSize: 11, color: colors.foreground },
  pnlMini: { fontFamily: fonts.bold, fontSize: 8, marginTop: 2 },
  journalDot: {
    position: 'absolute',
    bottom: 3,
    right: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  legend: { marginTop: 12, gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDotPrimary: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  legendSwatch: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontFamily: fonts.regular, fontSize: 10, color: colors.muted },
})