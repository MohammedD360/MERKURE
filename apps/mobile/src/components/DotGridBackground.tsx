import { StyleSheet, View } from 'react-native'
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg'
import { colors } from '@/src/lib/theme'

interface Props {
  color?: string
  opacity?: number
}

export function DotGridBackground({ color = colors.primary, opacity = 0.18 }: Props) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <Circle cx="2" cy="2" r="1.2" fill={color} opacity={opacity} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dots)" />
      </Svg>
    </View>
  )
}