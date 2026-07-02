import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, G } from 'react-native-svg'
import type { KpiBreakdown } from '@/src/lib/api-client'
import { Card } from '@/src/components/ui/Card'
import { formatMoney } from '@/src/lib/format'
import { colors, fonts, radius } from '@/src/lib/theme'

type Mode = 'volume' | 'pnl'

interface Props {
  data?: KpiBreakdown
  isLoading?: boolean
}

export function AssetBreakdown({ data, isLoading }: Props) {
  const [mode, setMode] = useState<Mode>('volume')
  const assets = data?.bySymbol ?? []

  if (isLoading) {
    return (
      <Card>
        <View style={styles.skeleton} />
      </Card>
    )
  }

  if (!assets.length) return null

  const total = assets.reduce(
    (s, a) => s + (mode === 'volume' ? a.pct : Math.abs(a.pnl)),
    0,
  ) || 1

  let angle = -90
  const slices = assets.map((a) => {
    const slice = ((mode === 'volume' ? a.pct : Math.abs(a.pnl)) / total) * 360
    const start = angle
    angle += slice
    return { ...a, start, slice }
  })

  const centerValue =
    mode === 'volume'
      ? String(assets.reduce((s, a) => s + a.nbTrades, 0))
      : formatMoney(assets.reduce((s, a) => s + a.pnl, 0), true)

  return (
    <Card>
      <Text style={styles.eyebrow}>Allocation trades</Text>
      <Text style={styles.title}>Répartition des actifs</Text>

      <View style={styles.modeRow}>
        {(['volume', 'pnl'] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
          >
            <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>
              {m === 'volume' ? 'Nb trades' : 'Par P&L'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.chartRow}>
        <View style={styles.donutWrap}>
          <Svg width={120} height={120} viewBox="0 0 120 120">
            <G rotation={0} origin="60, 60">
              {slices.map((s, i) => {
                const r = 48
                const large = s.slice > 180 ? 1 : 0
                const a1 = ((s.start) * Math.PI) / 180
                const a2 = ((s.start + s.slice) * Math.PI) / 180
                const x1 = 60 + r * Math.cos(a1)
                const y1 = 60 + r * Math.sin(a1)
                const x2 = 60 + r * Math.cos(a2)
                const y2 = 60 + r * Math.sin(a2)
                const d = `M 60 60 L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
                return <Circle key={i} cx={60} cy={60} r={0} fill="none" />
              })}
            </G>
            {slices.map((s, i) => (
              <Circle
                key={s.label}
                cx={60}
                cy={60}
                r={44}
                fill="none"
                stroke={s.color || colors.primary}
                strokeWidth={14}
                strokeDasharray={`${(s.slice / 360) * 276} 276`}
                rotation={s.start + 90}
                origin="60, 60"
                opacity={0.85 - i * 0.05}
              />
            ))}
          </Svg>
          <View style={styles.donutCenter}>
            <Text style={styles.centerValue}>{centerValue}</Text>
            <Text style={styles.centerSub}>{mode === 'volume' ? 'trades' : 'P&L'}</Text>
          </View>
        </View>

        <View style={styles.legend}>
          {assets.slice(0, 5).map((a) => (
            <View key={a.label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: a.color || colors.primary }]} />
              <Text style={styles.legendLabel}>{a.label}</Text>
              <Text style={styles.legendPct}>{a.pct.toFixed(0)}%</Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.foreground, marginTop: 4, marginBottom: 12 },
  modeRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  modeBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.white },
  modeBtnActive: { backgroundColor: colors.primary },
  modeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.muted },
  modeTextActive: { color: colors.white },
  chartRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  donutWrap: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  donutCenter: { position: 'absolute', alignItems: 'center' },
  centerValue: { fontFamily: fonts.bold, fontSize: 13, color: colors.foreground },
  centerSub: { fontFamily: fonts.regular, fontSize: 9, color: colors.muted },
  legend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 12, color: colors.foreground },
  legendPct: { fontFamily: fonts.bold, fontSize: 12, color: colors.muted },
  skeleton: { height: 160, borderRadius: radius.md, backgroundColor: colors.primaryLight },
})