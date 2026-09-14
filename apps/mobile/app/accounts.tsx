import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card } from '@/src/components/ui/Card'
import { ScreenHeader } from '@/src/components/ui/ScreenHeader'
import { useAccounts } from '@/src/hooks/use-accounts'
import type { BrokerAccount } from '@/src/lib/api-client'
import { colors, fonts } from '@/src/lib/theme'

const SYNC_COLORS = {
  SUCCESS: colors.profit,
  ERROR: colors.loss,
  SYNCING: colors.amber,
  PENDING: colors.muted,
} as const

export default function AccountsScreen() {
  const { data: accounts = [], isLoading } = useAccounts()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={accounts}
        keyExtractor={(acc) => acc.id}
        contentContainerStyle={styles.padded}
        ListHeaderComponent={<ScreenHeader title="Comptes" subtitle="Brokers" showBack />}
        renderItem={({ item: acc }: { item: BrokerAccount }) => (
          <Card
            style={styles.card}
            accessible
            accessibilityLabel={`${acc.label}, ${acc.brokerType}, statut ${acc.syncStatus}`}
          >
            <View style={styles.row}>
              <Text style={styles.label}>{acc.label}</Text>
              <View style={[styles.badge, { backgroundColor: `${SYNC_COLORS[acc.syncStatus]}22` }]}>
                <Text style={[styles.badgeText, { color: SYNC_COLORS[acc.syncStatus] }]}>
                  {acc.syncStatus}
                </Text>
              </View>
            </View>
            <Text style={styles.meta}>
              {acc.brokerType} · {acc.accountType} · {acc.accountId}
            </Text>
            {acc.lastSyncAt ? (
              <Text style={styles.sync}>
                Dernière sync : {new Date(acc.lastSyncAt).toLocaleString('fr-FR')}
              </Text>
            ) : null}
          </Card>
        )}
        ListEmptyComponent={!isLoading ? <Text style={styles.empty}>Aucun compte connecté</Text> : null}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  padded: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: fonts.bold, fontSize: 15, color: colors.foreground },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontFamily: fonts.bold, fontSize: 10 },
  meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 6 },
  sync: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 4 },
  empty: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 40 },
})
