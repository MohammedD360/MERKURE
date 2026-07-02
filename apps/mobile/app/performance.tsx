import { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { AdvancedStatsGrid } from '@/src/components/performance/AdvancedStatsGrid'
import { HeatmapGrid } from '@/src/components/performance/HeatmapGrid'
import { RevengePanel } from '@/src/components/performance/RevengePanel'
import { SessionCards } from '@/src/components/performance/SessionCards'
import { WeekdayChart } from '@/src/components/performance/WeekdayChart'
import { PeriodSelector, type ChartPeriod } from '@/src/components/PeriodSelector'
import { Card } from '@/src/components/ui/Card'
import { Screen } from '@/src/components/ui/Screen'
import { ScreenHeader } from '@/src/components/ui/ScreenHeader'
import {
  useAdvancedStats,
  useHeatmapData,
  useRevengeAlerts,
  useSessionStats,
  useWeekdayStats,
} from '@/src/hooks/use-performance'
import { useKpiSnapshots, useKpiStats, useKpiSummary } from '@/src/hooks/use-kpis'
import { formatMoney } from '@/src/lib/format'
import { colors, fonts } from '@/src/lib/theme'

function MiniEquityChart({ data }: { data: Array<{ date: string; cumPnl: number }> }) {
  if (!data.length) return <Text style={styles.empty}>Aucune donnée sur cette période</Text>

  const values = data.map((d) => d.cumPnl)
  const min = Math.min(...values, 0)
  const max = Math.max(...values, 1)
  const range = max - min || 1
  const w = 300
  const h = 140
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * w
    const y = h - 10 - ((d.cumPnl - min) / range) * (h - 20)
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  })

  return (
    <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
      <Path d={points.join(' ')} stroke={colors.primary} strokeWidth={2.5} fill="none" />
    </Svg>
  )
}

export default function PerformanceScreen() {
  const [period, setPeriod] = useState<ChartPeriod>('1M')

  const summary = useKpiSummary(period)
  const stats = useKpiStats(period)
  const snapshots = useKpiSnapshots(period)
  const advanced = useAdvancedStats(period)
  const weekdays = useWeekdayStats(period)
  const sessions = useSessionStats(period)
  const heatmap = useHeatmapData(period)
  const revenge = useRevengeAlerts(period)

  const refreshing =
    summary.isFetching ||
    stats.isFetching ||
    snapshots.isFetching ||
    advanced.isFetching

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={() => {
        void summary.refetch()
        void stats.refetch()
        void snapshots.refetch()
        void advanced.refetch()
        void weekdays.refetch()
        void sessions.refetch()
        void heatmap.refetch()
        void revenge.refetch()
      }}
    >
      <ScreenHeader title="Performance" subtitle="Analyse détaillée" showBack />
      <PeriodSelector value={period} onChange={setPeriod} />

      <AdvancedStatsGrid
        advanced={advanced.data}
        summary={summary.data}
        isLoading={advanced.isLoading || summary.isLoading}
      />

      {stats.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 14 }} />
      ) : stats.data ? (
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Gagnants</Text>
            <Text style={styles.statValue}>{stats.data.winTrades}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Perdants</Text>
            <Text style={styles.statValue}>{stats.data.lossTrades}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Meilleur</Text>
            <Text style={[styles.statValue, { color: colors.profit }]}>
              {formatMoney(stats.data.bestTrade, true)}
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Pire</Text>
            <Text style={[styles.statValue, { color: colors.loss }]}>
              {formatMoney(stats.data.worstTrade)}
            </Text>
          </Card>
        </View>
      ) : null}

      <Card style={styles.section}>
        <Text style={styles.chartTitle}>PnL cumulé</Text>
        <MiniEquityChart data={snapshots.data ?? []} />
      </Card>

      <Card style={styles.section}>
        <WeekdayChart data={weekdays.data} isLoading={weekdays.isLoading} />
      </Card>

      <View style={styles.section}>
        <SessionCards data={sessions.data} isLoading={sessions.isLoading} />
      </View>

      <View style={styles.section}>
        <HeatmapGrid data={heatmap.data} isLoading={heatmap.isLoading} />
      </View>

      <View style={styles.section}>
        <RevengePanel alerts={revenge.data} isLoading={revenge.isLoading} />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  statCard: { width: '47%', flex: undefined },
  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  statValue: { fontFamily: fonts.bold, fontSize: 18, color: colors.foreground, marginTop: 4 },
  section: { marginTop: 14 },
  chartTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.foreground, marginBottom: 8 },
  empty: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, textAlign: 'center', padding: 20 },
})