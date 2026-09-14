import { useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TradeRow } from '@/src/components/TradeRow'
import { ScreenHeader } from '@/src/components/ui/ScreenHeader'
import { useTrades } from '@/src/hooks/use-trades'
import type { Trade } from '@/src/lib/api-client'
import { colors, fonts, radius } from '@/src/lib/theme'

type Filter = '' | 'OPEN' | 'CLOSED'

export default function TradesScreen() {
  const [status, setStatus] = useState<Filter>('')
  const { data, isLoading, refetch, isFetching } = useTrades({ limit: 50, status })

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(t) => t.id}
        renderItem={({ item }: { item: Trade }) => <TradeRow trade={item} />}
        contentContainerStyle={styles.padded}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => void refetch()} tintColor={colors.primary} />}
        ListHeaderComponent={
          <>
            <ScreenHeader title="Trades" subtitle="Historique" />

            <View style={styles.filters} accessibilityRole="radiogroup">
              {(['', 'OPEN', 'CLOSED'] as const).map((f) => {
                const label = f === '' ? 'Tous' : f === 'OPEN' ? 'Ouverts' : 'Clôturés'
                return (
                  <Pressable
                    key={f || 'all'}
                    onPress={() => setStatus(f)}
                    style={[styles.chip, status === f && styles.chipActive]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: status === f }}
                    accessibilityLabel={label}
                  >
                    <Text style={[styles.chipText, status === f && styles.chipTextActive]}>{label}</Text>
                  </Pressable>
                )
              })}
            </View>

            {isLoading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.count}>{data?.total ?? 0} trades</Text>}
          </>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  padded: { padding: 16, paddingBottom: 32 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.foreground, borderColor: colors.foreground },
  chipText: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  chipTextActive: { color: colors.white },
  count: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginBottom: 8 },
})
