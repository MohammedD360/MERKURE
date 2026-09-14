import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { ComingSoon } from '@/src/components/ui/ComingSoon'
import { colors, fonts } from '@/src/lib/theme'

// Aucune route API de backtesting n'existe encore (côté web non plus — voir
// navigation.ts) : cet écran affichait auparavant 3 backtests inventés en dur
// comme s'ils étaient réels. Remplacé par un état honnête en attendant que la
// fonctionnalité soit développée côté backend.
export default function BacktestScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Retour">
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
        <Text style={styles.title}>Backtest IA</Text>
        <View style={styles.backBtn} />
      </View>

      <ComingSoon
        title="Backtest IA — bientôt disponible"
        description="Teste tes stratégies sur l'historique du marché avant de les jouer en réel. Cette fonctionnalité est en cours de développement."
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backBtn: { width: 32, alignItems: 'flex-start' },
  title: { fontFamily: fonts.bold, fontSize: 18, color: colors.foreground },
})
