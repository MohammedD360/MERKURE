import { RefreshControl, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '@/src/lib/theme'

interface Props {
  children: React.ReactNode
  scroll?: boolean
  padded?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  style?: ViewStyle
  backgroundColor?: string
  edges?: ('top' | 'bottom' | 'left' | 'right')[]
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  refreshing,
  onRefresh,
  style,
  backgroundColor = colors.background,
  edges = ['top'],
}: Props) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[padded && styles.padded, style]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded, style]}>{children}</View>
  )

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={edges}>
      {content}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  padded: { padding: 16, paddingBottom: 32 },
})