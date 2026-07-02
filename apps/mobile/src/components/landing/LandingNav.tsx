import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { BrandLogo } from '@/src/components/BrandLogo'
import { fonts } from '@/src/lib/theme'
import { landing } from './landing-theme'

export function LandingNav() {
  const router = useRouter()

  return (
    <View style={styles.nav}>
      <BrandLogo size="sm" light />
      <View style={styles.actions}>
        <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8}>
          <Text style={styles.link}>Connexion</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/(auth)/register')}
          style={styles.pill}
        >
          <Text style={styles.pillText}>Commencer</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  link: { fontFamily: fonts.medium, fontSize: 14, color: landing.textPrimary },
  pill: {
    backgroundColor: landing.accentGreen,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillText: { fontFamily: fonts.bold, fontSize: 12, color: landing.textPrimary },
})