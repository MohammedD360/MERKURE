import { StyleSheet, Text, View } from 'react-native'
import type { AdvancedStats, KpiSummary } from '@/src/lib/api-client'
import { formatPct } from '@/src/lib/format'
import { colors, fonts, radius } from '@/src/lib/theme'

function formatDuration(ms: number | null): string {
  if (ms === null) return '—'
  const totalMin = Math.floor(ms / 60_000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

interface Props {
  advanced?: AdvancedStats
  summary?: KpiSummary
  isLoading?: boolean
}

export function AdvancedStatsGrid({ advanced, summary, isLoading }: Props) {
  const winRate =
    advanced?.winRate != null
      ? formatPct(advanced.winRate * 100)
      : summary?.winRate != null
        ? formatPct(summary.winRate * 100)
        : '—'

  const avgRR = advanced?.avgRR != null ? advanced.avgRR.toFixed(2) : '—'
  const avgDuration = formatDuration(advanced?.avgDurationMs ?? null)
  const profitFactor =
    advanced?.profitFactor != null
      ? advanced.profitFactor.toFixed(2)
      : summary?.profitFactor != null
        ? summary.profitFactor.toFixed(2)
        : '—'

  const stats = [
    { label: 'Win rate', value: winRate },
    { label: 'Avg R:R', value: avgRR },
    { label: 'Durée moy.', value: avgDuration },
    { label: 'Profit factor', value: profitFactor },
  ]

  if (isLoading) {
    return (
      <View style={styles.grid}>
        {stats.map((s) => (
          <View key={s.label} style={[styles.card, styles.skeleton]} />
        ))}
      </View>
    )
  }

  return (
    <View style={styles.grid}>
      {stats.map((s) => (
        <View key={s.label} style={styles.card}>
          <Text style={styles.label}>{s.label}</Text>
          <Text style={styles.value}>{s.value}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    backgroundColor: colors.white,
  },
  skeleton: { height: 64, backgroundColor: colors.primaryLight, borderColor: 'transparent' },
  label: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: { fontFamily: fonts.bold, fontSize: 18, color: colors.foreground, marginTop: 4 },
})