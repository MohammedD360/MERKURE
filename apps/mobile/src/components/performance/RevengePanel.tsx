import { StyleSheet, Text, View } from 'react-native'
import { AlertTriangle } from 'lucide-react-native'
import type { RevengeAlert } from '@/src/lib/api-client'
import { colors, fonts, radius } from '@/src/lib/theme'

interface Props {
  alerts?: RevengeAlert[]
  isLoading?: boolean
}

export function RevengePanel({ alerts, isLoading }: Props) {
  if (isLoading) return <View style={styles.skeleton} />

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <AlertTriangle size={18} color={colors.amber} />
        <Text style={styles.title}>Revenge trading</Text>
      </View>
      {!alerts?.length ? (
        <Text style={styles.ok}>Aucun signal détecté sur cette période.</Text>
      ) : (
        alerts.slice(0, 5).map((a) => (
          <View key={a.id} style={styles.alert}>
            <Text style={styles.symbol}>{a.symbol}</Text>
            <Text style={styles.detail}>
              Ré-entrée en {a.minutesBetweenTrades} min · lot +{a.lotSizeDelta.toFixed(0)}%
            </Text>
            <Text style={styles.time}>
              {new Date(a.openTime).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))
      )}
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
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  title: { fontFamily: fonts.bold, fontSize: 14, color: colors.foreground },
  ok: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  alert: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 8,
  },
  symbol: { fontFamily: fonts.bold, fontSize: 13, color: colors.foreground },
  detail: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2 },
  time: { fontFamily: fonts.regular, fontSize: 10, color: colors.muted, marginTop: 2 },
  skeleton: { height: 80, borderRadius: 12, backgroundColor: colors.primaryLight },
})