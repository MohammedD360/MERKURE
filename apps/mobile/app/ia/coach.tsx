import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { AlertTriangle, Zap } from 'lucide-react-native'
import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'
import { Screen } from '@/src/components/ui/Screen'
import { ScreenHeader } from '@/src/components/ui/ScreenHeader'
import { useGenerateAiAnalysis, useLatestAiAnalysis } from '@/src/hooks/use-ai'
import { colors, fonts } from '@/src/lib/theme'

export default function IaCoachScreen() {
  const { data: latest, isLoading } = useLatestAiAnalysis()
  const { mutate: generate, isPending } = useGenerateAiAnalysis()
  const actions = latest?.insights?.actions ?? []

  return (
    <Screen>
      <ScreenHeader title="Coach discipline" subtitle="Prévention" showBack />

      <Button
        label="Actualiser le coach"
        variant="secondary"
        onPress={() => generate({ context: 'Audit discipline et risque' })}
        loading={isPending}
        style={{ marginBottom: 16 }}
      />

      <Card>
        <View style={styles.signalHead}>
          <AlertTriangle size={20} color={colors.loss} />
          <Text style={styles.signalTitle}>Signal prioritaire</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : actions.length ? (
          actions.map((action, i) => (
            <Text key={i} style={styles.action}>
              · {action}
            </Text>
          ))
        ) : latest?.aiAnalysis ? (
          <Text style={styles.analysis}>{latest.aiAnalysis}</Text>
        ) : (
          <Text style={styles.empty}>Lancez une analyse pour obtenir des garde-fous personnalisés.</Text>
        )}
      </Card>

      <Card style={{ marginTop: 12 }}>
        <View style={styles.guardHead}>
          <Zap size={18} color={colors.amber} />
          <Text style={styles.guardTitle}>Garde-fous actifs</Text>
        </View>
        <Text style={styles.guardItem}>· Série perdante → réduire la taille</Text>
        <Text style={styles.guardItem}>· Risque {'>'} 1,5R → alerte</Text>
        <Text style={styles.guardItem}>· Fin de session → vigilance discipline</Text>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  signalHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  signalTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.foreground },
  action: { fontFamily: fonts.regular, fontSize: 14, color: colors.foreground, marginTop: 6, lineHeight: 20 },
  analysis: { fontFamily: fonts.regular, fontSize: 14, color: colors.foreground, lineHeight: 22 },
  empty: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  guardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  guardTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.foreground },
  guardItem: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 4 },
})