import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, fonts, radius } from '@/src/lib/theme'

export type ChartPeriod = '7J' | '1M' | '3M' | 'YTD' | 'ALL'

const PERIODS: Array<{ label: string; value: ChartPeriod }> = [
  { label: '7J', value: '7J' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: 'YTD', value: 'YTD' },
  { label: 'ALL', value: 'ALL' },
]

export function chartPeriodToApiPeriod(p: ChartPeriod): '7d' | '30d' | '90d' | '1y' | 'all' {
  switch (p) {
    case '7J':
      return '7d'
    case '1M':
      return '30d'
    case '3M':
      return '90d'
    case 'YTD':
      return '1y'
    case 'ALL':
      return 'all'
  }
}

interface Props {
  value: ChartPeriod
  onChange: (p: ChartPeriod) => void
}

export function PeriodSelector({ value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {PERIODS.map((p) => {
        const active = p.value === value
        return (
          <Pressable
            key={p.value}
            onPress={() => onChange(p.value)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{p.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    gap: 2,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipActive: { backgroundColor: colors.foreground },
  label: { fontFamily: fonts.bold, fontSize: 11, color: colors.muted },
  labelActive: { color: colors.white },
})