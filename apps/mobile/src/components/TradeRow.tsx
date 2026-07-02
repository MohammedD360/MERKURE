import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import type { Trade } from '@/src/lib/api-client'
import { formatMoney, pnlColor } from '@/src/lib/format'
import { colors, fonts, radius } from '@/src/lib/theme'

interface Props {
  trade: Trade
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function TradeRow({ trade }: Props) {
  const router = useRouter()
  const pnl = trade.pnl != null ? Number(trade.pnl) : null
  const isLong = trade.direction === 'LONG'
  const directionLabel = isLong ? 'Achat' : 'Vente'

  return (
    <Pressable style={styles.row} onPress={() => router.push(`/trade/${trade.id}`)}>
      <View style={styles.left}>
        <Text style={styles.symbol}>{trade.symbol}</Text>
        <View style={[styles.badge, isLong ? styles.long : styles.short]}>
          <Text style={[styles.badgeText, { color: isLong ? '#166534' : '#991B1B' }]}>{directionLabel}</Text>
        </View>
        <Text style={styles.rrLabel}>R:R 1:{trade.lotSize ? (Number(trade.lotSize) * 2).toFixed(1) : '2'}</Text>
      </View>
      <View style={styles.right}>
        {pnl != null ? (
          <Text style={[styles.pnl, { color: pnlColor(pnl) }]}>{formatMoney(pnl, true).replace('€', '$')}</Text>
        ) : (
          <Text style={styles.open}>Ouvert</Text>
        )}
        <Text style={styles.time}>{formatTime(trade.openTime)}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  symbol: { fontFamily: fonts.bold, fontSize: 14, color: colors.foreground },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  long: { backgroundColor: '#DCFCE7' },
  short: { backgroundColor: '#FEE2E2' },
  badgeText: { fontFamily: fonts.bold, fontSize: 10 },
  rrLabel: { fontFamily: fonts.regular, fontSize: 10, color: colors.muted },
  right: { alignItems: 'flex-end' },
  pnl: { fontFamily: fonts.bold, fontSize: 14 },
  open: { fontFamily: fonts.medium, fontSize: 12, color: colors.primary },
  time: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 2 },
})
