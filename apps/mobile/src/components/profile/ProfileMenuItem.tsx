import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { colors, fonts, radius } from '@/src/lib/theme'

interface Props {
  label: string
  icon: LucideIcon
  onPress: () => void
  badge?: string
  isLast?: boolean
}

export function ProfileMenuItem({ label, icon: Icon, onPress, badge, isLast }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.iconWrap}>
        <Icon size={18} color={colors.primary} />
      </View>
      <Text style={styles.label}>{label}</Text>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <ChevronRight size={18} color={colors.muted} style={{ marginLeft: 'auto' }} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.foreground },
  badge: {
    backgroundColor: colors.amberBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 9, color: colors.amber, textTransform: 'uppercase' },
})