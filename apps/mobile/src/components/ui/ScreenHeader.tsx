import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { colors, fonts } from '@/src/lib/theme'

interface Props {
  title: string
  subtitle?: string
  showBack?: boolean
  right?: React.ReactNode
}

export function ScreenHeader({ title, subtitle, showBack, right }: Props) {
  const router = useRouter()

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {showBack ? (
          <Pressable onPress={() => router.back()} style={styles.back}>
            <ChevronLeft size={22} color={colors.foreground} />
          </Pressable>
        ) : null}
        <View>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
      {right}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  back: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.foreground },
})