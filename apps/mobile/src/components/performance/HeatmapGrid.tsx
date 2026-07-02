import { useMemo } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Clock } from 'lucide-react-native'
import type { HeatmapCell } from '@/src/lib/api-client'
import { colors, fonts, radius } from '@/src/lib/theme'

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const HOUR_BLOCKS = [
  { label: '0-3', from: 0, to: 3 },
  { label: '4-7', from: 4, to: 7 },
  { label: '8-11', from: 8, to: 11 },
  { label: '12-15', from: 12, to: 15 },
  { label: '16-19', from: 16, to: 19 },
  { label: '20-23', from: 20, to: 23 },
]

function cellColor(pnl: number, count: number, maxAbs: number) {
  if (count === 0 || maxAbs === 0) return { backgroundColor: colors.primaryLight, borderColor: colors.border }
  const intensity = Math.min(Math.max(Math.abs(pnl) / maxAbs, 0.15), 1)
  const alpha = 0.2 + intensity * 0.5
  if (pnl >= 0) {
    return {
      backgroundColor: `rgba(34, 197, 94, ${alpha})`,
      borderColor: `rgba(34, 197, 94, ${0.2 + intensity * 0.3})`,
    }
  }
  return {
    backgroundColor: `rgba(239, 68, 68, ${alpha})`,
    borderColor: `rgba(239, 68, 68, ${0.2 + intensity * 0.3})`,
  }
}

interface Props {
  data?: HeatmapCell[]
  isLoading?: boolean
}

export function HeatmapGrid({ data, isLoading }: Props) {
  const { grid, maxAbs, totalTrades } = useMemo(() => {
    const cells = new Map<string, { pnl: number; count: number }>()
    let strongest = 0
    let trades = 0

    for (const item of data ?? []) {
      const day = item.dayOfWeek
      const block = HOUR_BLOCKS.find((b) => item.hour >= b.from && item.hour <= b.to)
      if (block == null) continue
      const key = `${day}-${block.from}`
      const prev = cells.get(key) ?? { pnl: 0, count: 0 }
      const next = { pnl: prev.pnl + item.pnl, count: prev.count + item.count }
      cells.set(key, next)
      strongest = Math.max(strongest, Math.abs(next.pnl))
      trades += item.count
    }

    const rows = DAY_LABELS.map((label, day) => ({
      label,
      cells: HOUR_BLOCKS.map((block) => {
        const cell = cells.get(`${day}-${block.from}`) ?? { pnl: 0, count: 0 }
        return { ...cell, block: block.label }
      }),
    }))

    return { grid: rows, maxAbs: strongest, totalTrades: trades }
  }, [data])

  if (isLoading) {
    return <View style={styles.skeleton} />
  }

  if (!totalTrades) {
    return (
      <View style={styles.wrap}>
        <View style={styles.head}>
          <Clock size={16} color={colors.primary} />
          <Text style={styles.title}>Heatmap horaire</Text>
        </View>
        <Text style={styles.empty}>Pas assez de trades pour afficher la heatmap.</Text>
      </View>
    )
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Clock size={16} color={colors.primary} />
        <Text style={styles.title}>Heatmap horaire</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headerRow}>
            <View style={styles.dayCol} />
            {HOUR_BLOCKS.map((b) => (
              <Text key={b.label} style={styles.hourLabel}>
                {b.label}h
              </Text>
            ))}
          </View>

          {grid.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.dayLabel}>{row.label}</Text>
              {row.cells.map((cell) => {
                const style = cellColor(cell.pnl, cell.count, maxAbs)
                return (
                  <View key={cell.block} style={[styles.cell, style]}>
                    {cell.count > 0 ? (
                      <Text style={[styles.cellText, { color: cell.pnl >= 0 ? '#166534' : '#991B1B' }]}>
                        {cell.count}
                      </Text>
                    ) : null}
                  </View>
                )
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <View style={[styles.legendSwatch, { backgroundColor: 'rgba(34, 197, 94, 0.5)' }]} />
        <Text style={styles.legendText}>Gain</Text>
        <View style={[styles.legendSwatch, { backgroundColor: 'rgba(239, 68, 68, 0.5)' }]} />
        <Text style={styles.legendText}>Perte</Text>
        <Text style={styles.legendHint}>· nombre de trades par créneau</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    backgroundColor: colors.white,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  title: { fontFamily: fonts.bold, fontSize: 14, color: colors.foreground },
  empty: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dayCol: { width: 32 },
  hourLabel: {
    width: 44,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 9,
    color: colors.muted,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dayLabel: {
    width: 32,
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.muted,
  },
  cell: {
    width: 44,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  cellText: { fontFamily: fonts.bold, fontSize: 9 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  legendSwatch: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontFamily: fonts.regular, fontSize: 10, color: colors.muted },
  legendHint: { fontFamily: fonts.regular, fontSize: 10, color: `${colors.muted}88` },
  skeleton: { height: 160, borderRadius: radius.md, backgroundColor: colors.primaryLight },
})