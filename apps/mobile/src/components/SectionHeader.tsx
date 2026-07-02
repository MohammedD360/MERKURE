import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, fonts } from '@/src/lib/theme'

interface Props {
  eyebrow?: string
  title: string
  actionLabel?: string
  onAction?: () => void
}

export function SectionHeader({ eyebrow, title, actionLabel, onAction }: Props) {
  return (
    <View style={styles.row}>
      <View>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: { fontFamily: fonts.bold, fontSize: 16, color: colors.foreground, marginTop: 2 },
  action: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary },
})