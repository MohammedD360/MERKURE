import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Card } from '@/src/components/ui/Card'
import { Screen } from '@/src/components/ui/Screen'
import { ScreenHeader } from '@/src/components/ui/ScreenHeader'
import { useTrade } from '@/src/hooks/use-trades'
import { formatMoney, pnlColor } from '@/src/lib/format'
import { colors, fonts } from '@/src/lib/theme'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  )
}

export default function TradeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: trade, isLoading } = useTrade(id ?? null)

  if (isLoading || !trade) {
    return (
      <Screen scroll={false}>
        <ScreenHeader title="Trade" showBack />
        <ActivityIndicator color={colors.primary} />
      </Screen>
    )
  }

  const pnl = trade.pnl != null ? Number(trade.pnl) : null

  return (
    <Screen>
      <ScreenHeader title={trade.symbol} subtitle={trade.direction} showBack />

      {pnl != null ? (
        <Text style={[styles.pnl, { color: pnlColor(pnl) }]}>{formatMoney(pnl, true)}</Text>
      ) : null}

      <Card>
        <Row label="Statut" value={trade.status} />
        <Row label="Ouverture" value={new Date(trade.openTime).toLocaleString('fr-FR')} />
        {trade.closeTime ? <Row label="Clôture" value={new Date(trade.closeTime).toLocaleString('fr-FR')} /> : null}
        <Row label="Prix entrée" value={trade.openPrice} />
        {trade.closePrice ? <Row label="Prix sortie" value={trade.closePrice} /> : null}
        <Row label="Lot" value={trade.lotSize} />
        <Row label="Commission" value={trade.commission} />
        {trade.strategyTag ? <Row label="Stratégie" value={trade.strategyTag} /> : null}
        {trade.note ? <Row label="Note" value={trade.note} /> : null}
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  pnl: { fontFamily: fonts.bold, fontSize: 28, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  rowValue: { fontFamily: fonts.bold, fontSize: 13, color: colors.foreground },
})