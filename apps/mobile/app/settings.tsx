import { StyleSheet, Text, View } from 'react-native'
import { Card } from '@/src/components/ui/Card'
import { Screen } from '@/src/components/ui/Screen'
import { ScreenHeader } from '@/src/components/ui/ScreenHeader'
import { useCurrentUser } from '@/src/hooks/use-current-user'
import { colors, fonts } from '@/src/lib/theme'

export default function SettingsScreen() {
  const { data: user } = useCurrentUser()

  return (
    <Screen>
      <ScreenHeader title="Paramètres" showBack />

      <Card>
        <Text style={styles.label}>Fuseau horaire</Text>
        <Text style={styles.value}>Europe/Paris</Text>
      </Card>

      <Card style={{ marginTop: 10 }}>
        <Text style={styles.label}>Devise</Text>
        <Text style={styles.value}>EUR</Text>
      </Card>

      <Card style={{ marginTop: 10 }}>
        <Text style={styles.label}>Plan actuel</Text>
        <Text style={styles.value}>{user?.plan ?? 'FREE'}</Text>
        <Text style={styles.hint}>La gestion d'abonnement s'ouvre depuis le site web MERKURE.</Text>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.medium, fontSize: 11, color: colors.muted, textTransform: 'uppercase' },
  value: { fontFamily: fonts.bold, fontSize: 16, color: colors.foreground, marginTop: 4 },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 8 },
})