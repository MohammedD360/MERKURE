import Image from 'next/image'
import type { BrokerType } from '@/lib/mock-comptes'

const BROKER_LOGOS: Record<BrokerType, {
  src: string
  alt: string
  width: number
  height: number
  fit?: 'icon' | 'wordmark'
}> = {
  MT4: {
    src: '/brokers/metatrader-4.png',
    alt: 'MetaTrader 4',
    width: 500,
    height: 250,
    fit: 'wordmark',
  },
  MT5: {
    src: '/brokers/metatrader-5.png',
    alt: 'MetaTrader 5',
    width: 1200,
    height: 600,
    fit: 'wordmark',
  },
  BINANCE: {
    src: '/brokers/binance.svg',
    alt: 'Binance',
    width: 127,
    height: 127,
    fit: 'icon',
  },
  IB: {
    src: '/brokers/interactive-brokers.png',
    alt: 'Interactive Brokers',
    width: 486,
    height: 75,
    fit: 'wordmark',
  },
  CTRADER: {
    src: '/brokers/ctrader.png',
    alt: 'cTrader',
    width: 36,
    height: 35,
    fit: 'icon',
  },
}

export function BrokerLogo({ broker, size = 40 }: { broker: BrokerType; size?: number }) {
  const logo = BROKER_LOGOS[broker]
  const isWordmark = logo.fit === 'wordmark'
  const boxWidth = isWordmark ? Math.round(size * 1.45) : size

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
      style={{ width: boxWidth, height: size }}
      aria-label={logo.alt}
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className="h-full w-full object-contain"
        sizes={`${boxWidth}px`}
      />
    </span>
  )
}
