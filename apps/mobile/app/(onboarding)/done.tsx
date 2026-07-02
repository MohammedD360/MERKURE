import { StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { CheckCircle2 } from 'lucide-react-native'
import { OnboardingProgress } from '@/src/components/OnboardingProgress'
import { Button } from '@/src/components/ui/Button'
import { Screen } from '@/src/components/ui/Screen'
import { colors, fonts } from '@/src/lib/theme'

export default function OnboardingDoneScreen() {
  const router = useRouter()

  return (
    <Screen>
      <OnboardingProgress current={4} />
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <CheckCircle2 size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>C'est parti !</Text>
        <Text style={styles.sub}>Votre espace MERKURE est prêt. Explorez votre dashboard.</Text>
        <Button
          label="Accéder au dashboard"
          onPress={() => router.replace('/(tabs)')}
          style={{ marginTop: 32, width: '100%' }}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingTop: 40 },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.foreground, textAlign: 'center' },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    maxWidth: 280,
  },
})