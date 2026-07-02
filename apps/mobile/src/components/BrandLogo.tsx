import { StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { colors, fonts } from '@/src/lib/theme'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  light?: boolean
}

function BrandIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path
        d="M7 9.5L20 4l13 5.5v21L20 36 7 30.5v-21Z"
        stroke={color}
        strokeWidth={2.7}
        strokeLinejoin="round"
      />
      <Path
        d="M12 27V13l8 8 8-8v14"
        stroke={color}
        strokeWidth={2.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function BrandLogo({ size = 'md', light }: Props) {
  const textColor = light ? colors.white : colors.foreground
  const iconColor = light ? colors.white : colors.primary
  const iconSize = size === 'lg' ? 40 : size === 'md' ? 32 : 24
  const fontSize = size === 'lg' ? 22 : size === 'md' ? 18 : 14

  return (
    <View style={styles.row}>
      <BrandIcon size={iconSize} color={iconColor} />
      <Text style={[styles.text, { fontSize, color: textColor }]}>MERKURE</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  text: { fontFamily: fonts.bold, letterSpacing: 1.5 },
})