import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { AuthProvider } from '@/src/lib/auth'

export { ErrorBoundary } from 'expo-router'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  })

  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync()
  }, [loaded])

  if (!loaded) return null

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F6F7F9' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="performance" options={{ presentation: 'card' }} />
          <Stack.Screen name="alerts" options={{ presentation: 'card' }} />
          <Stack.Screen name="accounts" options={{ presentation: 'card' }} />
          <Stack.Screen name="settings" options={{ presentation: 'card' }} />
          <Stack.Screen name="trade/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="ia/coach" options={{ presentation: 'card' }} />
          <Stack.Screen name="ia/chat" options={{ presentation: 'card' }} />
          <Stack.Screen name="ia/rapport" options={{ presentation: 'card' }} />
          <Stack.Screen name="plan-trading" options={{ presentation: 'card' }} />
          <Stack.Screen name="backtest" options={{ presentation: 'card' }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  )
}