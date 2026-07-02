import { StyleSheet, Text, View } from 'react-native'
import type { SessionStat } from '@/src/lib/api-client'
import { formatMoney, formatPct } from '@/src/lib/format'
import { colors, fonts, radius } from '@/src/lib/theme'

interface Props {
  data?: SessionStat[]
  isLoading?: boolean
}

export function SessionCards({ data, isLoading }: Props) {
  if (isLoading) return <View style={styles.skeleton} />
  if (!data?.length) return null

  return (
    <View>
      <Text style={styles.title}>Performance par session</Text>
      <View style={styles.grid}>
        {data.map((s) => (
          <View key={s.session} style={styles.card}>
            <Text style={styles.session}>{s.session}</Text>
            <Text style={[styles.pnl, { color: s.totalPnl >= 0 ? colors.profit : colors.loss }]}>
              {formatMoney(s.totalPnl, true)}
            </Text>
            <Text style={styles.meta}>
              {s.nbTrades} trades · {formatPct(s.winRate * 100)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.bold, fontSize: 14, color: colors.foreground, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: {
    width: '47%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    backgroundColor: colors.white,
  },
  session: { fontFamily: fonts.bold, fontSize: 12, color: colors.foreground },
  pnl: { fontFamily: fonts.bold, fontSize: 16, marginTop: 4 },
  meta: { fontFamily: fonts.regular, fontSize: 10, color: colors.muted, marginTop: 2 },
  skeleton: { height: 100, borderRadius: 12, backgroundColor: colors.primaryLight },
})