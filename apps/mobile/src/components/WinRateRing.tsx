import { StyleSheet, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { colors, fonts } from '@/src/lib/theme'

interface Props {
  value: number | null
  size?: number
}

export function WinRateRing({ value, size = 52 }: Props) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const safe = value == null ? 0 : Math.max(0, Math.min(value, 100))
  const filled = (safe / 100) * circumference
  const cx = size / 2

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cx} r={radius} fill="none" stroke={colors.border} strokeWidth={5} />
        <Circle
          cx={cx}
          cy={cx}
          r={radius}
          fill="none"
          stroke={colors.primary}
          strokeWidth={5}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          rotation={-90}
          origin={`${cx}, ${cx}`}
        />
      </Svg>
      <Text style={styles.value}>{safe.toFixed(0)}%</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  value: {
    position: 'absolute',
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.foreground,
  },
})