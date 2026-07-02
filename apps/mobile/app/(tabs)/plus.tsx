import { StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  BarChart3,
  Bell,
  BookOpen,
  List,
  Settings,
  User,
  Wallet,
} from 'lucide-react-native'
import { ProfileMenuItem } from '@/src/components/profile/ProfileMenuItem'
import { Screen } from '@/src/components/ui/Screen'
import { colors, fonts } from '@/src/lib/theme'

export default function PlusScreen() {
  const router = useRouter()

  return (
    <Screen backgroundColor={colors.white} style={styles.screen}>
      <Text style={styles.eyebrow}>Menu</Text>
      <Text style={styles.pageTitle}>Plus</Text>
      <Text style={styles.subtitle}>Accédez à toutes les sections de l'application.</Text>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Trading</Text>
        <ProfileMenuItem
          icon={List}
          label="Mes trades"
          onPress={() => router.push('/(tabs)/trades')}
        />
        <ProfileMenuItem
          icon={BookOpen}
          label="Journal"
          onPress={() => router.push('/(tabs)/journal')}
        />
        <ProfileMenuItem
          icon={BarChart3}
          label="Performance"
          onPress={() => router.push('/performance')}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Compte</Text>
        <ProfileMenuItem
          icon={User}
          label="Profil"
          onPress={() => router.push('/(tabs)/profile')}
        />
        <ProfileMenuItem
          icon={Wallet}
          label="Comptes broker"
          onPress={() => router.push('/accounts')}
        />
        <ProfileMenuItem
          icon={Bell}
          label="Alertes"
          onPress={() => router.push('/alerts')}
        />
        <ProfileMenuItem
          icon={Settings}
          label="Paramètres"
          onPress={() => router.push('/settings')}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.white },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  pageTitle: { fontFamily: fonts.bold, fontSize: 22, color: colors.foreground, marginTop: 4 },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 19,
  },
  group: { marginTop: 8 },
  groupTitle: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
})