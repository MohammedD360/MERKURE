import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  Settings,
  Shield,
  User,
} from 'lucide-react-native'
import { ProfileHeroCard } from '@/src/components/profile/ProfileHeroCard'
import { Screen } from '@/src/components/ui/Screen'
import { useCurrentUser } from '@/src/hooks/use-current-user'
import { useKpiSummary } from '@/src/hooks/use-kpis'
import { useAuth } from '@/src/lib/auth'
import { colors, fonts, radius } from '@/src/lib/theme'
import type { LucideIcon } from 'lucide-react-native'

interface MenuItem {
  label: string
  icon: LucideIcon
  onPress: () => void
  destructive?: boolean
}

export default function ProfileScreen() {
  const router = useRouter()
  const { data: user, isLoading, refetch, isFetching } = useCurrentUser()
  const summary = useKpiSummary('1M')
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.replace('/')
  }

  const MENU: MenuItem[] = [
    { label: 'Mon profil', icon: User, onPress: () => {} },
    { label: 'Abonnement', icon: CreditCard, onPress: () => router.push('/settings') },
    { label: 'Paramètres', icon: Settings, onPress: () => router.push('/settings') },
    { label: 'Notifications', icon: Bell, onPress: () => router.push('/alerts') },
    { label: 'Sécurité', icon: Shield, onPress: () => {} },
    { label: 'Aide & support', icon: HelpCircle, onPress: () => {} },
    { label: 'Se déconnecter', icon: LogOut, onPress: handleLogout, destructive: true },
  ]

  return (
    <Screen
      refreshing={isFetching || summary.isFetching}
      onRefresh={() => { void refetch(); void summary.refetch() }}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : (
        <ProfileHeroCard
          user={user}
          totalPnl={summary.data?.totalPnl}
          winRate={summary.data?.winRate}
          nbTrades={summary.data?.nbTrades}
        />
      )}

      <View style={styles.menuCard}>
        {MENU.map((item, i) => (
          <Pressable
            key={item.label}
            style={[styles.menuItem, i < MENU.length - 1 && styles.menuItemBorder]}
            onPress={item.onPress}
          >
            <View style={[styles.menuIcon, item.destructive && styles.menuIconDestructive]}>
              <item.icon size={18} color={item.destructive ? colors.loss : colors.primary} />
            </View>
            <Text style={[styles.menuLabel, item.destructive && styles.menuLabelDestructive]}>
              {item.label}
            </Text>
            {!item.destructive ? (
              <ChevronRight size={16} color={colors.muted} />
            ) : null}
          </Pressable>
        ))}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDestructive: { backgroundColor: '#FEE2E2' },
  menuLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.foreground,
  },
  menuLabelDestructive: { color: colors.loss },
})
