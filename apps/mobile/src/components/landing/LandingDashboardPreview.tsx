import { StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { BrandLogo } from '@/src/components/BrandLogo'
import { fonts } from '@/src/lib/theme'
import { landing } from './landing-theme'

function MiniChart() {
  return (
    <Svg width="100%" height={48} viewBox="0 0 200 48">
      <Path
        d="M0,38 L30,32 L60,28 L90,22 L120,18 L150,12 L180,8 L200,4"
        stroke={landing.accentGreen}
        strokeWidth={2}
        fill="none"
      />
    </Svg>
  )
}

function MiniPie() {
  return (
    <Svg width={36} height={36} viewBox="0 0 36 36">
      <Circle cx={18} cy={18} r={14} stroke={landing.border} strokeWidth={6} fill="none" />
      <Circle
        cx={18}
        cy={18}
        r={14}
        stroke={landing.accentGreen}
        strokeWidth={6}
        fill="none"
        strokeDasharray="44 88"
        rotation={-90}
        origin="18, 18"
      />
      <Circle
        cx={18}
        cy={18}
        r={14}
        stroke={landing.accentBlue}
        strokeWidth={6}
        fill="none"
        strokeDasharray="22 88"
        strokeDashoffset={-44}
        rotation={-90}
        origin="18, 18"
      />
    </Svg>
  )
}

export function LandingDashboardPreview() {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <BrandLogo size="sm" light />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Vue d'ensemble</Text>
            <Text style={styles.cardSub}>Performance, risque et synchronisation des comptes</Text>
          </View>
        </View>

        <View style={styles.sessionPill}>
          <Text style={styles.sessionLabel}>SESSION PROPRE</Text>
          <Text style={styles.sessionValue}>+240 €</Text>
        </View>

        <View style={styles.metricsRow}>
          {['Comptes connectés', 'Revue de session', 'Alertes de risque'].map((label) => (
            <View key={label} style={styles.metricBox}>
              <Text style={styles.metricLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>P&L</Text>
            <Text style={[styles.kpiValue, { color: landing.accentGreen }]}>+2 930 €</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Trades</Text>
            <Text style={styles.kpiValue}>62</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Max DD</Text>
            <Text style={[styles.kpiValue, { color: landing.lossRed }]}>-33,7%</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Winrate</Text>
            <Text style={styles.kpiValue}>58,1%</Text>
          </View>
        </View>

        <View style={styles.panels}>
          <View style={styles.panel}>
            <Text style={styles.panelEyebrow}>COURBE EQUITY</Text>
            <Text style={styles.panelTitle}>Évolution de la performance</Text>
            <View style={styles.tabs}>
              <Text style={[styles.tab, styles.tabActive]}>Cumulé</Text>
              <Text style={styles.tab}>Journalier</Text>
            </View>
            <MiniChart />
          </View>
          <View style={styles.panel}>
            <Text style={styles.panelEyebrow}>ALLOCATION DES ACTIFS</Text>
            <View style={styles.pieRow}>
              <MiniPie />
              <Text style={styles.panelTitle}>Répartition des actifs</Text>
            </View>
            <Text style={styles.riskLabel}>RISQUE / TRADE</Text>
            <Text style={styles.riskValue}>1,5%</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, marginTop: 36 },
  card: {
    backgroundColor: landing.surfaceAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: landing.border,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  cardTitle: { fontFamily: fonts.bold, fontSize: 14, color: landing.textPrimary },
  cardSub: { fontFamily: fonts.regular, fontSize: 11, color: landing.textSecondary, marginTop: 2 },
  sessionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${landing.accentGreen}18`,
    borderWidth: 1,
    borderColor: `${landing.accentGreen}33`,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  sessionLabel: { fontFamily: fonts.bold, fontSize: 9, color: landing.accentGreen, letterSpacing: 0.6 },
  sessionValue: { fontFamily: fonts.bold, fontSize: 13, color: landing.accentGreen },
  metricsRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  metricBox: {
    flex: 1,
    backgroundColor: landing.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: landing.border,
    padding: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  metricLabel: { fontFamily: fonts.medium, fontSize: 8, color: landing.textSecondary, lineHeight: 11 },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kpi: {
    flex: 1,
    backgroundColor: landing.surface,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: landing.border,
  },
  kpiLabel: { fontFamily: fonts.medium, fontSize: 8, color: landing.textSecondary, textTransform: 'uppercase' },
  kpiValue: { fontFamily: fonts.bold, fontSize: 11, color: landing.textPrimary, marginTop: 4 },
  panels: { gap: 10 },
  panel: {
    backgroundColor: landing.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: landing.border,
    padding: 12,
  },
  panelEyebrow: {
    fontFamily: fonts.bold,
    fontSize: 8,
    color: landing.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  panelTitle: { fontFamily: fonts.medium, fontSize: 11, color: landing.textPrimary },
  tabs: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 4 },
  tab: { fontFamily: fonts.medium, fontSize: 10, color: landing.textSecondary },
  tabActive: { color: landing.accentBlue, fontFamily: fonts.bold },
  pieRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  riskLabel: { fontFamily: fonts.bold, fontSize: 8, color: landing.textSecondary, marginTop: 8 },
  riskValue: { fontFamily: fonts.bold, fontSize: 14, color: landing.textPrimary, marginTop: 2 },
})