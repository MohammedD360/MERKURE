import { StyleSheet, Text, View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { Card } from '@/src/components/ui/Card'
import { colors, fonts } from '@/src/lib/theme'

interface Props {
  title: string
  value?: string
  sub?: string
  icon: LucideIcon
  valueColor?: string
  footer?: React.ReactNode
}

export function KpiCard({ title, value, sub, icon: Icon, valueColor, footer }: Props) {
  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.iconWrap}>
          <Icon size={16} color={colors.muted} />
        </View>
      </View>
      {footer ?? (
        <>
          {value ? (
            <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
          ) : null}
          {sub ? <Text style={styles.sub}>{sub}</Text> : null}
        </>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { minHeight: 110, width: '47.5%' },
  top: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  title: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    flex: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontFamily: fonts.bold, fontSize: 22, color: colors.foreground },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 4 },
})