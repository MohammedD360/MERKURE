import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { OnboardingProgress } from '@/src/components/OnboardingProgress'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { Screen } from '@/src/components/ui/Screen'
import { api, type BrokerType } from '@/src/lib/api-client'
import { colors, fonts } from '@/src/lib/theme'

const BROKERS: Array<{ id: BrokerType; label: string }> = [
  { id: 'MT4', label: 'MetaTrader 4' },
  { id: 'MT5', label: 'MetaTrader 5' },
  { id: 'BINANCE', label: 'Binance' },
  { id: 'TRADOVATE', label: 'Tradovate' },
]

export default function OnboardingBrokerScreen() {
  const router = useRouter()
  const [brokerType, setBrokerType] = useState<BrokerType>('MT5')
  const [label, setLabel] = useState('Mon compte')
  const [accountId, setAccountId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    if (!accountId.trim()) return
    setLoading(true)
    try {
      await api.accounts.create({
        brokerType,
        accountType: 'DEMO',
        accountId: accountId.trim(),
        label: label.trim() || 'Mon compte',
      })
    } catch {
      // continue onboarding even if broker fails in demo
    } finally {
      setLoading(false)
      router.push('/(onboarding)/plan')
    }
  }

  return (
    <Screen>
      <OnboardingProgress current={2} />
      <Text style={styles.title}>Connecter un broker</Text>
      <Text style={styles.sub}>Synchronisez vos trades automatiquement</Text>

      <View style={styles.brokerList}>
        {BROKERS.map((b) => (
          <Button
            key={b.id}
            label={b.label}
            variant={brokerType === b.id ? 'primary' : 'secondary'}
            onPress={() => setBrokerType(b.id)}
            style={styles.brokerBtn}
          />
        ))}
      </View>

      <View style={styles.form}>
        <Input label="Nom du compte" value={label} onChangeText={setLabel} />
        <Input label="ID compte" value={accountId} onChangeText={setAccountId} placeholder="12345678" />
      </View>

      <Button label="Connecter" onPress={handleConnect} loading={loading} />
      <Button label="Passer cette étape" variant="ghost" onPress={() => router.push('/(onboarding)/plan')} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  step: { fontFamily: fonts.medium, fontSize: 11, color: colors.primary, textTransform: 'uppercase' },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.foreground, marginTop: 8 },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginBottom: 16 },
  brokerList: { gap: 8, marginBottom: 16 },
  brokerBtn: { height: 44 },
  form: { gap: 12, marginBottom: 16 },
})