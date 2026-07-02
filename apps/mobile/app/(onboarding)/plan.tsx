import { StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { OnboardingProgress } from '@/src/components/OnboardingProgress'
import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'
import { Screen } from '@/src/components/ui/Screen'
import { api } from '@/src/lib/api-client'
import { colors, fonts } from '@/src/lib/theme'

const PLANS = [
  { id: 'FREE', name: 'Gratuit', price: '0 €', features: ['1 compte', 'Dashboard', 'Journal'] },
  { id: 'STARTER', name: 'Starter', price: '19 €/mois', features: ['1 compte', 'Stats essentielles', 'Alertes'] },
  { id: 'PRO', name: 'Pro', price: '49 €/mois', features: ['3 comptes', 'Coach IA', 'Rapports'] },
  { id: 'ELITE', name: 'Elite', price: '129 €/mois', features: ['Illimité', 'Chat IA', 'API'] },
]

export default function OnboardingPlanScreen() {
  const router = useRouter()

  const handleContinue = async () => {
    try {
      await api.onboarding.complete()
    } catch {
      // proceed anyway
    }
    router.replace('/(onboarding)/done')
  }

  return (
    <Screen>
      <OnboardingProgress current={3} />
      <Text style={styles.title}>Choisissez votre plan</Text>
      <Text style={styles.sub}>Commencez gratuitement, changez à tout moment</Text>

      {PLANS.map((plan) => (
        <Card key={plan.id} style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>{plan.price}</Text>
          </View>
          {plan.features.map((f) => (
            <Text key={f} style={styles.feature}>
              · {f}
            </Text>
          ))}
        </Card>
      ))}

      <Button label="Continuer gratuitement" onPress={handleContinue} style={{ marginTop: 8 }} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  step: { fontFamily: fonts.medium, fontSize: 11, color: colors.primary, textTransform: 'uppercase' },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.foreground, marginTop: 8 },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginBottom: 16 },
  card: { marginBottom: 10 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  planName: { fontFamily: fonts.bold, fontSize: 16, color: colors.foreground },
  planPrice: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  feature: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 2 },
})