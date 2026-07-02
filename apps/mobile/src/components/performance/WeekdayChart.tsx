import { StyleSheet, Text, View } from 'react-native'
import type { WeekdayStat } from '@/src/lib/api-client'
import { colors, fonts } from '@/src/lib/theme'

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

interface Props {
  data?: WeekdayStat[]
  isLoading?: boolean
}

export function WeekdayChart({ data, isLoading }: Props) {
  const rows = DAY_LABELS.map((label, idx) => {
    const found = data?.find((d) => d.day === idx)
    return { label, totalPnl: found?.totalPnl ?? 0, nbTrades: found?.nbTrades ?? 0 }
  })

  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.totalPnl)), 1)

  if (isLoading) {
    return <View style={styles.skeleton} />
  }

  return (
    <View>
      <Text style={styles.title}>Performance par jour</Text>
      <View style={styles.chart}>
        {rows.map((row) => {
          const h = Math.max(8, (Math.abs(row.totalPnl) / maxAbs) * 80)
          const positive = row.totalPnl >= 0
          return (
            <View key={row.label} style={styles.barCol}>
              <View
                style={[
                  styles.bar,
                  {
                    height: h,
                    backgroundColor: positive ? colors.profit : colors.loss,
                  },
                ]}
              />
              <Text style={styles.barLabel}>{row.label}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.bold, fontSize: 14, color: colors.foreground, marginBottom: 12 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  bar: { width: 20, borderRadius: 4 },
  barLabel: { fontFamily: fonts.medium, fontSize: 9, color: colors.muted },
  skeleton: { height: 120, borderRadius: 12, backgroundColor: colors.primaryLight },
})