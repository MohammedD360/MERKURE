import Svg, { Path } from 'react-native-svg'

interface Props {
  color: string
  variant?: 'up' | 'flat'
  width?: number
  height?: number
}

export function MiniSparkline({ color, variant = 'up', width = 72, height = 28 }: Props) {
  const d =
    variant === 'up'
      ? `M0,${height - 4} L18,${height - 10} L36,${height - 14} L54,${height - 18} L${width},4`
      : `M0,${height / 2} L${width / 2},${height / 2} L${width},${height / 2}`

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Path d={d} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  )
}