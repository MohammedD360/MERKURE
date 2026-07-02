import { StyleSheet, Text, View } from 'react-native'
import { colors, fonts } from '@/src/lib/theme'

interface Props {
  showWordmark?: boolean
}

export function BrandMark({ showWordmark = true }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.mark}>
        <Text style={styles.letter}>M</Text>
      </View>
      {showWordmark ? <Text style={styles.wordmark}>MERKURE</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: { fontFamily: fonts.bold, fontSize: 16, color: colors.white },
  wordmark: { fontFamily: fonts.bold, fontSize: 16, color: colors.foreground, letterSpacing: 1.2 },
})