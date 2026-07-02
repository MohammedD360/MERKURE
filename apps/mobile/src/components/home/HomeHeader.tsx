import { Pressable, StyleSheet, View } from 'react-native'
import { Bell, Menu } from 'lucide-react-native'
import { BrandMark } from '@/src/components/home/BrandMark'
import { colors } from '@/src/lib/theme'

interface Props {
  onMenuPress?: () => void
  onBellPress?: () => void
}

export function HomeHeader({ onMenuPress, onBellPress }: Props) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onMenuPress} hitSlop={8} style={styles.iconBtn}>
        <Menu size={22} color={colors.foreground} />
      </Pressable>
      <BrandMark />
      <Pressable onPress={onBellPress} hitSlop={8} style={styles.iconBtn}>
        <Bell size={20} color={colors.foreground} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
})