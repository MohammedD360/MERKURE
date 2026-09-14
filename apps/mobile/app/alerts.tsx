import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card } from '@/src/components/ui/Card'
import { ScreenHeader } from '@/src/components/ui/ScreenHeader'
import { useAlerts, useMarkAlertRead } from '@/src/hooks/use-alerts'
import type { Alert } from '@/src/lib/api-client'
import { colors, fonts } from '@/src/lib/theme'

const SEVERITY_COLORS = {
  INFO: colors.primary,
  WARNING: colors.amber,
  CRITICAL: colors.loss,
} as const

// La sévérité ne doit jamais reposer sur la couleur seule (daltonisme,
// lecteur d'écran) — un point de couleur ne suffit pas.
const SEVERITY_LABELS = {
  INFO: 'Info',
  WARNING: 'Avertissement',
  CRITICAL: 'Critique',
} as const

export default function AlertsScreen() {
  const { data, refetch, isFetching } = useAlerts()
  const markRead = useMarkAlertRead()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={data?.alerts ?? []}
        keyExtractor={(alert) => alert.id}
        contentContainerStyle={styles.padded}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => void refetch()} tintColor={colors.primary} />}
        ListHeaderComponent={<ScreenHeader title="Alertes" showBack />}
        renderItem={({ item: alert }: { item: Alert }) => (
          <Pressable
            onPress={() => !alert.isRead && markRead.mutate(alert.id)}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${alert.isRead ? '' : 'Non lu. '}Alerte ${SEVERITY_LABELS[alert.severity]} : ${alert.title}${alert.body ? `. ${alert.body}` : ''}`}
          >
            <Card style={[styles.card, !alert.isRead && styles.unread]}>
              <View style={styles.row}>
                <View style={[styles.dot, { backgroundColor: SEVERITY_COLORS[alert.severity] }]} />
                <Text style={styles.severityLabel}>{SEVERITY_LABELS[alert.severity]}</Text>
                <Text style={styles.title}>{alert.title}</Text>
                {!alert.isRead ? <Text style={styles.unreadBadge}>Non lu</Text> : null}
              </View>
              {alert.body ? <Text style={styles.body}>{alert.body}</Text> : null}
              <Text style={styles.date}>
                {new Date(alert.triggeredAt).toLocaleString('fr-FR')}
              </Text>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucune alerte pour le moment</Text>}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  padded: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 10 },
  unread: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  severityLabel: { fontFamily: fonts.medium, fontSize: 10, color: colors.muted, textTransform: 'uppercase' },
  title: { fontFamily: fonts.bold, fontSize: 14, color: colors.foreground, flex: 1 },
  unreadBadge: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  body: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 6 },
  date: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 8 },
  empty: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 40 },
})
