import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HomeHeader } from '@/src/components/home/HomeHeader'
import { InsightDuJourCard } from '@/src/components/home/InsightDuJourCard'
import { OverviewGrid } from '@/src/components/home/OverviewGrid'
import { QuickToolsRow } from '@/src/components/home/QuickToolsRow'
import { useAuth } from '@/src/lib/auth'
import { colors, fonts, radius } from '@/src/lib/theme'

export default function WelcomeScreen() {
  const router = useRouter()
  const { isAuthenticated, isLoading, loginDemo } = useAuth()
  const [demoLoading, setDemoLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)')
    }
  }, [isLoading, isAuthenticated, router])

  const enterDemo = async () => {
    setDemoLoading(true)
    try {
      await loginDemo()
      router.replace('/(tabs)')
    } catch {
      router.push('/(auth)/login')
    } finally {
      setDemoLoading(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    )
  }

  if (isAuthenticated) return null

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader onBellPress={() => router.push('/(auth)/login')} />

        <Text style={styles.greeting}>Bienvenue Alex 👋</Text>
        <Text style={styles.greetingSub}>
          Voici votre performance et les insights IA du jour.
        </Text>

        <InsightDuJourCard onCtaPress={enterDemo} loading={demoLoading} />

        <View style={styles.section}>
          <OverviewGrid />
        </View>

        <View style={styles.section}>
          <QuickToolsRow onNavigate={(route) => router.push(route as never)} />
        </View>

        <View style={styles.authBlock}>
          <Pressable style={styles.demoBtn} onPress={enterDemo} disabled={demoLoading}>
            {demoLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.demoBtnText}>Compte démo — explorer l'app</Text>
            )}
          </Pressable>

          <View style={styles.authLinks}>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.authLink}>Connexion</Text>
            </Pressable>
            <Text style={styles.authSep}>·</Text>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.authLink}>Créer un compte</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  scroll: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  greeting: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.foreground,
    marginTop: 8,
  },
  greetingSub: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 20,
  },
  section: { marginTop: 24 },
  authBlock: {
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 14,
  },
  demoBtn: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBtnText: { fontFamily: fonts.bold, fontSize: 14, color: colors.white },
  authLinks: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  authLink: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary },
  authSep: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
})