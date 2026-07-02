import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Card } from '@/src/components/ui/Card'
import { Screen } from '@/src/components/ui/Screen'
import { ScreenHeader } from '@/src/components/ui/ScreenHeader'
import { useAlerts, useMarkAlertRead } from '@/src/hooks/use-alerts'
import { colors, fonts } from '@/src/lib/theme'

const SEVERITY_COLORS = {
  INFO: colors.primary,
  WARNING: colors.amber,
  CRITICAL: colors.loss,
} as const

export default function AlertsScreen() {
  const { data, refetch, isFetching } = useAlerts()
  const markRead = useMarkAlertRead()

  return (
    <Screen refreshing={isFetching} onRefresh={() => void refetch()}>
      <ScreenHeader title="Alertes" showBack />

      {data?.alerts.map((alert) => (
        <Pressable
          key={alert.id}
          onPress={() => !alert.isRead && markRead.mutate(alert.id)}
        >
          <Card style={[styles.card, !alert.isRead && styles.unread]}>
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: SEVERITY_COLORS[alert.severity] }]} />
              <Text style={styles.title}>{alert.title}</Text>
            </View>
            {alert.body ? <Text style={styles.body}>{alert.body}</Text> : null}
            <Text style={styles.date}>
              {new Date(alert.triggeredAt).toLocaleString('fr-FR')}
            </Text>
          </Card>
        </Pressable>
      ))}

      {!data?.alerts.length ? (
        <Text style={styles.empty}>Aucune alerte pour le moment</Text>
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  unread: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontFamily: fonts.bold, fontSize: 14, color: colors.foreground, flex: 1 },
  body: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 6 },
  date: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 8 },
  empty: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 40 },
})