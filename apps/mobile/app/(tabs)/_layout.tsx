import { Tabs } from 'expo-router'
import {
  GraduationCap,
  LayoutDashboard,
  LineChart,
  MoreHorizontal,
  Trophy,
} from 'lucide-react-native'
import { Platform, StyleSheet } from 'react-native'
import { colors, fonts } from '@/src/lib/theme'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="ia"
        options={{
          title: 'Trading & IA',
          tabBarIcon: ({ color, size }) => <LineChart color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="propfirm"
        options={{
          title: 'Prop Firm',
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="academie"
        options={{
          title: 'Académie',
          tabBarIcon: ({ color, size }) => <GraduationCap color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="plus"
        options={{
          title: 'Plus',
          tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen name="trades" options={{ href: null }} />
      <Tabs.Screen name="journal" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabLabel: { fontFamily: fonts.medium, fontSize: 10, marginTop: 2 },
  tabItem: { paddingTop: 4 },
})