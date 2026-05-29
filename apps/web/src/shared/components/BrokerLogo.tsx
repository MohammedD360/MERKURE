import type { BrokerType } from '@/lib/mock-comptes'

export function BrokerLogo({ broker, size = 40 }: { broker: BrokerType; size?: number }) {
  switch (broker) {
    case 'MT4':
    case 'MT5':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="9" fill="#0C2775"/>
          {/* M */}
          <path d="M5 27V13L13 22L21 13V27" stroke="white" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          {/* T */}
          <line x1="24" y1="13" x2="36" y2="13" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
          <line x1="30" y1="13" x2="30" y2="27" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
          {/* Version badge */}
          <rect x="24" y="21" width="12" height="9" rx="3" fill="#2D7DFF"/>
          <text x="30" y="28.5" textAnchor="middle" fill="white" fontSize="7.5" fontWeight="800" fontFamily="system-ui, sans-serif">
            {broker === 'MT4' ? '4' : '5'}
          </text>
        </svg>
      )

    case 'BINANCE':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="9" fill="#181200"/>
          {/* Center diamond */}
          <polygon points="20,12 28,20 20,28 12,20" fill="#F0B90B"/>
          {/* Top diamond */}
          <polygon points="20,3 24.5,7.5 20,12 15.5,7.5" fill="#F0B90B"/>
          {/* Bottom diamond */}
          <polygon points="20,28 24.5,32.5 20,37 15.5,32.5" fill="#F0B90B"/>
          {/* Left diamond */}
          <polygon points="3,20 7.5,15.5 12,20 7.5,24.5" fill="#F0B90B"/>
          {/* Right diamond */}
          <polygon points="28,20 32.5,15.5 37,20 32.5,24.5" fill="#F0B90B"/>
        </svg>
      )

    case 'IB':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="9" fill="#0d0d0d"/>
          {/* Concentric arcs — IB style */}
          <path d="M23 7 C15 7 8 13 7 21 C6 29 11 36 19 38" stroke="#D11124" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M23 13 C18 13 13 17 12 22 C11 27 14 31 19 33" stroke="#D11124" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M23 19 C21 19 19 21 19 23 C19 25 20 27 23 27" stroke="#D11124" strokeWidth="2" fill="none" strokeLinecap="round"/>
          {/* IB text */}
          <text x="27" y="24" fill="#D11124" fontSize="10" fontWeight="900" fontFamily="system-ui, sans-serif">IB</text>
        </svg>
      )

    case 'CTRADER':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="9" fill="#050D1E"/>
          {/* Outer C arc */}
          <path d="M31 11 C26 7 18 7 13 12 C8 17 8 25 13 30 C18 35 26 35 31 31" stroke="#0066CC" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
          {/* Inner C arc */}
          <path d="M29 16 C26 13 20 13 17 16 C13 20 13 26 17 29" stroke="#38B6FF" strokeWidth="3" fill="none" strokeLinecap="round"/>
        </svg>
      )
  }
}
