import { StyleSheet, Text, View } from 'react-native'
import { Sparkles } from 'lucide-react-native'
import { colors, fonts, radius } from '@/src/lib/theme'

interface Props {
  title: string
  description: string
}

// Aucune donnée mockée : mieux vaut un état honnête "à venir" qu'un écran qui
// affiche des chiffres/contenus inventés comme s'ils étaient réels — ce que
// ce composant remplace (voir historique de backtest.tsx et academie.tsx).
export function ComingSoon({ title, description }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Sparkles size={28} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
    gap: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontFamily: fonts.bold, fontSize: 17, color: colors.foreground, textAlign: 'center' },
  description: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 19 },
})
