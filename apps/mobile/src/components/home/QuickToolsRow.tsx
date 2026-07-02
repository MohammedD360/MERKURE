import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  BrainCircuit,
  BookOpen,
  Rocket,
  LineChart,
  ClipboardList,
} from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { colors, fonts, radius } from '@/src/lib/theme'

const TOOLS: Array<{ title: string; subtitle: string; icon: LucideIcon; route: string }> = [
  { title: 'Analyse IA', subtitle: 'Outils performance', icon: BrainCircuit, route: '/ia/rapport' },
  { title: 'Journal', subtitle: 'Vos trades', icon: BookOpen, route: '/(tabs)/journal' },
  { title: 'Backtest IA', subtitle: 'Outils stratégie', icon: Rocket, route: '/backtest' },
  { title: 'Plan de stratégie', subtitle: 'Votre stratégie', icon: LineChart, route: '/plan-trading' },
  { title: 'Plan de trading', subtitle: 'Votre plan', icon: ClipboardList, route: '/plan-trading' },
]

interface Props {
  onNavigate: (route: string) => void
}

export function QuickToolsRow({ onNavigate }: Props) {
  return (
    <View>
      <Text style={styles.title}>OUTILS RAPIDES</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {TOOLS.map((tool, i) => (
          <Pressable key={`${tool.title}-${i}`} style={styles.card} onPress={() => onNavigate(tool.route)}>
            <View style={styles.iconWrap}>
              <tool.icon size={22} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>{tool.title}</Text>
            <Text style={styles.cardSub} numberOfLines={1}>{tool.subtitle}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.foreground,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  row: { gap: 10, paddingRight: 4 },
  card: {
    width: 104,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: { fontFamily: fonts.bold, fontSize: 11, color: colors.foreground, textAlign: 'center' },
  cardSub: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 2,
  },
})
