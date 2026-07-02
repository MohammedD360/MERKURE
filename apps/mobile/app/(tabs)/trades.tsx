import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { TradeRow } from '@/src/components/TradeRow'
import { Screen } from '@/src/components/ui/Screen'
import { ScreenHeader } from '@/src/components/ui/ScreenHeader'
import { useTrades } from '@/src/hooks/use-trades'
import { colors, fonts, radius } from '@/src/lib/theme'

type Filter = '' | 'OPEN' | 'CLOSED'

export default function TradesScreen() {
  const [status, setStatus] = useState<Filter>('')
  const { data, isLoading, refetch, isFetching } = useTrades({ limit: 50, status })

  return (
    <Screen refreshing={isFetching} onRefresh={() => void refetch()}>
      <ScreenHeader title="Trades" subtitle="Historique" />

      <View style={styles.filters}>
        {(['', 'OPEN', 'CLOSED'] as const).map((f) => (
          <Pressable
            key={f || 'all'}
            onPress={() => setStatus(f)}
            style={[styles.chip, status === f && styles.chipActive]}
          >
            <Text style={[styles.chipText, status === f && styles.chipTextActive]}>
              {f === '' ? 'Tous' : f === 'OPEN' ? 'Ouverts' : 'Clôturés'}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          <Text style={styles.count}>{data?.total ?? 0} trades</Text>
          {data?.items.map((t) => (
            <TradeRow key={t.id} trade={t} />
          ))}
        </>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
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