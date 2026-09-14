import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ComingSoon } from '@/src/components/ui/ComingSoon'
import { colors, fonts } from '@/src/lib/theme'

// Aucune fonctionnalité "Académie" n'existe côté web ni côté API — cet écran
// affichait des catégories et cours entièrement inventés en dur. Remplacé par
// un état honnête en attendant une décision produit sur ce module.
export default function AcademieScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Académie</Text>
      </View>

      <ComingSoon
        title="Académie — bientôt disponible"
        description="Des formations vidéo pour progresser sur la gestion du risque, la psychologie du trading et les structures de marché."
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.foreground },
})
