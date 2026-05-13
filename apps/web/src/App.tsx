import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChevronDown,
  CircleDollarSign,
  Cloud,
  Database,
  Eye,
  Link2,
  Lock,
  PlayCircle,
  Shield,
  ShieldCheck,
  TrendingUp,
  Zap,
} from 'lucide-react'

const navItems = ['Features', 'Pricing', 'Integrations', 'Docs']

const brokerStatuses = [
  { name: 'MT5', status: 'Connected', color: 'bg-emerald-400' },
  { name: 'Binance', status: 'Connected', color: 'bg-yellow-300' },
  { name: 'IBKR', status: 'Connected', color: 'bg-cyan-300' },
]

const problemCards = [
  {
    icon: Eye,
    title: 'No performance visibility',
    body: "Without clear analytics, you don't know what's working and what's killing your account.",
  },
  {
    icon: AlertTriangle,
    title: 'No risk management',
    body: 'One bad trade or one bad day can erase weeks or months of hard earned gains.',
  },
  {
    icon: Brain,
    title: 'No objective feedback',
    body: 'Emotions, ego and overconfidence replace data-driven decisions.',
  },
]

const analyticsMetrics = [
  ['Net P&L', '+2,431.67 EUR', 'text-emerald-300'],
  ['Sharpe Ratio', '1.42', 'text-white'],
  ['Win Rate', '63.41%', 'text-emerald-300'],
  ['Expectancy', '+18.92 EUR', 'text-emerald-300'],
]

const riskMetrics = [
  ['Risk per Trade', '1.21%'],
  ['Daily Loss Limit', '3.00%'],
  ['Max Drawdown', '8.72%'],
  ['Exposure', '34.00%'],
]

const aiInsights = [
  {
    icon: Zap,
    title: 'Revenge trading detected',
    body: '3 instances this week',
    tone: 'blue',
  },
  {
    icon: AlertTriangle,
    title: 'Overleveraging risk',
    body: 'Position size too high',
    tone: 'green',
  },
  {
    icon: Activity,
    title: 'Best trading session',
    body: 'London (8AM - 12PM)',
    tone: 'cyan',
  },
]

const integrations = [
  ['MetaTrader 4', 'Connected', 'from-blue-400 to-cyan-300'],
  ['MetaTrader 5', 'Connected', 'from-sky-500 to-blue-300'],
  ['Binance', 'Connected', 'from-yellow-300 to-yellow-500'],
  ['Interactive Brokers', 'Connected', 'from-red-500 to-rose-400'],
  ['cTrader', 'Coming soon', 'from-red-400 to-white'],
]

const steps = [
  {
    icon: Link2,
    title: 'Connect broker',
    body: 'Securely connect your MT4, MT5, Binance or Interactive Brokers account.',
  },
  {
    icon: Shield,
    title: 'Auto-sync trades',
    body: 'We automatically import your history and keep it synced in real-time.',
  },
  {
    icon: Brain,
    title: 'Analyze performance',
    body: 'Powerful analytics, risk metrics and AI insights show you the real picture.',
  },
  {
    icon: TrendingUp,
    title: 'Improve & grow',
    body: 'Apply data-driven insights, manage risk better and grow your account.',
  },
]

const pricingPlans = [
  {
    name: 'Starter',
    price: '19€',
    body: 'Perfect for traders getting started with performance tracking.',
    features: ['1 Trading Account', 'Basic Analytics', '30 Days History', 'Email Support'],
    cta: 'Start Free Trial',
  },
  {
    name: 'Pro',
    price: '49€',
    body: 'For serious traders who want to level up.',
    features: ['Up to 5 Accounts', 'Advanced Analytics', 'AI Insights', '90 Days History', 'Priority Support'],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Elite',
    price: '129€',
    body: 'For advanced traders who want the ultimate edge.',
    features: ['Unlimited Accounts', 'Advanced AI Coach', 'Real-time Alerts', '1 Year History', 'API Access'],
    cta: 'Start Free Trial',
  },
  {
    name: 'Institutional',
    price: 'Custom',
    body: 'For teams, funds and professional trading firms.',
    features: ['Team Analytics', 'Custom Integrations', 'White-label Options', 'Dedicated Support'],
    cta: 'Contact Sales',
  },
]

const securityItems = [
  {
    icon: Lock,
    title: 'AES-256 Encryption',
    body: 'All broker credentials are encrypted at rest.',
  },
  {
    icon: Eye,
    title: 'Read-Only Connections',
    body: "We only read your data. We can't place trades.",
  },
  {
    icon: ShieldCheck,
    title: 'JWT Secure Auth',
    body: 'Enterprise-grade auth with HttpOnly cookies.',
  },
  {
    icon: Database,
    title: 'Row Level Security',
    body: 'Multi-tenant isolation with PostgreSQL RLS.',
  },
  {
    icon: Cloud,
    title: '99.9% Uptime',
    body: 'Built on scalable cloud infrastructure.',
  },
]

const coachInsights = [
  ['You increase position size after losses', 'This pattern decreased your performance by 14%.', 'text-emerald-300'],
  ['Your best trades happen during London session', '68% of your profits come from 8AM - 12PM London time.', 'text-emerald-300'],
  ['Risk-adjusted performance decreased', 'Your Sharpe ratio is down 0.34 vs last month.', 'text-red-400'],
]

const recommendations = [
  'Reduce position size after losses',
  'Focus on London session setups',
  'Improve risk/reward ratio',
  'Review trading plan discipline',
]

function App() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#02070f] text-slate-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(58,142,255,0.18),transparent_28%),radial-gradient(circle_at_92%_4%,rgba(20,87,255,0.22),transparent_34%),radial-gradient(circle_at_50%_62%,rgba(0,163,255,0.09),transparent_30%),linear-gradient(180deg,#02070f_0%,#06111f_48%,#02070f_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(96,165,250,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.04)_1px,transparent_1px)] bg-[size:70px_70px] opacity-40" />
        <div className="absolute inset-x-0 top-0 h-px bg-cyan-300/20" />
      </div>

      <div className="relative">
        <Header />

        <main>
          <Hero />
          <ProblemSection />
          <FeaturesSection />
          <HowItWorks />
          <AISection />
          <PricingSection />
          <SecuritySection />
          <FinalCTA />
        </main>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#02070f]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#" className="flex items-center gap-2.5" aria-label="MERKURE home">
          <LogoMark className="h-7 w-7" />
          <span className="text-lg font-bold tracking-tight text-white">MERKURE</span>
        </a>

        <div className="hidden items-center gap-9 text-sm font-medium text-slate-200 lg:flex">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="transition hover:text-white">
              {item}
            </a>
          ))}
          <a href="#resources" className="flex items-center gap-1 transition hover:text-white">
            Resources
            <ChevronDown className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="flex items-center gap-3">
          <a href="/sign-in" className="hidden text-sm font-medium text-slate-200 transition hover:text-white sm:block">
            Log in
          </a>
          <a
            href="#pricing"
            className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_34px_rgba(56,113,255,0.45)] transition hover:brightness-110"
          >
            Start Free Trial
          </a>
        </div>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-16 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:pb-20 lg:pt-20">
      <div>
        <h1 className="max-w-xl text-5xl font-black leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-7xl">
          Trade less emotionally.
          <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Manage risk like a professional.
          </span>
        </h1>

        <p className="mt-8 max-w-lg text-lg leading-8 text-slate-200">
          Connect your MT4, MT5, Binance or Interactive Brokers account and get real performance analytics, risk
          monitoring and AI-powered feedback.
        </p>

        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <a
            href="#pricing"
            className="inline-flex h-14 items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 px-7 text-sm font-bold text-white shadow-[0_0_40px_rgba(52,106,255,0.55)] transition hover:brightness-110"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#demo"
            className="inline-flex h-14 items-center justify-center gap-3 rounded-lg border border-white/35 bg-white/[0.03] px-7 text-sm font-bold text-white transition hover:bg-white/[0.08]"
          >
            Watch Demo
            <PlayCircle className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center">
            {['A', 'M', 'K', 'S'].map((name, index) => (
              <div
                key={name}
                className="-ml-2 first:ml-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#07111f] bg-gradient-to-br from-slate-200 via-amber-200 to-slate-700 text-xs font-black text-slate-900"
                style={{ zIndex: 4 - index }}
              >
                {name}
              </div>
            ))}
          </div>
          <p className="max-w-[9rem] text-xs font-semibold leading-5 text-slate-300">
            Used by 1200+ real traders
          </p>

          <div className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-3 sm:ml-2 sm:grid-cols-3">
            {brokerStatuses.map((broker) => (
              <div key={broker.name} className="flex items-center gap-2 text-[11px] leading-none text-slate-300">
                <span className={`h-2 w-2 rounded-full ${broker.color}`} />
                <span>
                  <span className="block font-bold text-white">{broker.name}</span>
                  <span className="mt-1 block text-[10px] text-emerald-300">{broker.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DashboardPreview />
    </section>
  )
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-10 rounded-[2rem] bg-blue-600/10 blur-3xl" />
      <div className="relative rounded-xl border border-white/15 bg-[#07101c]/90 p-5 shadow-[0_0_70px_rgba(25,92,255,0.24)]">
        <div className="grid gap-5 md:grid-cols-[3.25rem_1fr]">
          <div className="hidden rounded-lg border border-white/10 bg-black/20 py-5 md:flex md:flex-col md:items-center md:gap-5">
            <LogoMark className="h-7 w-7" />
            {[BarChart3, Activity, CircleDollarSign, Shield, Brain, Link2, Database].map((Icon, index) => (
              <span
                key={index}
                className={`grid h-7 w-7 place-items-center rounded-md ${
                  index === 0 ? 'bg-blue-500/20 text-cyan-300' : 'text-slate-400'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
            <span className="mt-auto grid h-7 w-7 place-items-center rounded-md text-cyan-300">
              <Activity className="h-4 w-4" />
            </span>
          </div>

          <div>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h2 className="text-xl font-bold text-white">Overview</h2>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-400">
                May 1 - May 31, 2024
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
              <PreviewCard className="min-h-[210px]">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Equity Curve</h3>
                  <span className="rounded bg-blue-500/15 px-2 py-1 text-xs font-bold text-cyan-300">+24.37%</span>
                </div>
                <LineChart color="#3b82f6" fill="rgba(37,99,235,0.12)" trend="up" />
              </PreviewCard>

              <div className="grid gap-4">
                <PreviewCard>
                  <p className="text-xs font-medium text-slate-400">Net P&L</p>
                  <div className="mt-1 flex items-end justify-between gap-3">
                    <p className="text-2xl font-black text-emerald-300">+2,431.67 EUR</p>
                    <p className="text-xs font-bold text-emerald-300">+24.37%</p>
                  </div>
                </PreviewCard>
                <div className="grid grid-cols-2 gap-4">
                  <MiniStat label="Win Rate" value="63.41%" delta="+5.21%" />
                  <MiniStat label="Profit Factor" value="1.87" delta="+0.34" />
                  <MiniStat label="Max Drawdown" value="-8.72%" delta="-2.11%" danger />
                  <MiniStat label="Trades" value="128" delta="+22" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <PreviewCard className="min-h-[160px]">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Drawdown</h3>
                  <span className="rounded bg-red-500/15 px-2 py-1 text-xs font-bold text-red-300">-0.72%</span>
                </div>
                <LineChart color="#ef4444" fill="rgba(239,68,68,0.09)" trend="down" compact />
              </PreviewCard>

              <PreviewCard className="min-h-[160px]">
                <h3 className="text-sm font-semibold text-white">Risk Exposure</h3>
                <div className="mt-5 flex items-center gap-5">
                  <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-[conic-gradient(#3b82f6_0_34%,#22c55e_34%_55%,#06b6d4_55%_78%,#f59e0b_78%_100%)]">
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-[#09111d] text-lg font-black text-white">
                      34%
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    {[
                      ['Forex', '54%', 'bg-blue-400'],
                      ['Crypto', '21%', 'bg-emerald-400'],
                      ['Indices', '15%', 'bg-cyan-400'],
                      ['Others', '10%', 'bg-amber-400'],
                    ].map(([label, value, color]) => (
                      <div key={label} className="flex min-w-24 items-center justify-between gap-4 text-slate-300">
                        <span className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${color}`} />
                          {label}
                        </span>
                        <span className="font-bold text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </PreviewCard>

              <PreviewCard className="min-h-[160px]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">AI Insight</h3>
                  <span className="rounded bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-300">New</span>
                </div>
                <p className="mt-6 text-sm leading-6 text-slate-300">
                  You tend to increase position size after losses, which deteriorates your overall performance.
                </p>
                <a href="#ai" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-cyan-300">
                  View full analysis
                  <ArrowRight className="h-3 w-3" />
                </a>
              </PreviewCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProblemSection() {
  return (
    <section className="border-y border-white/10 bg-black/10 px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="The Problem" title="Most traders fail because they trade blind." />
        <div className="mt-9 grid gap-5 lg:grid-cols-4">
          {problemCards.map((card) => (
            <ProblemCard key={card.title} {...card} />
          ))}

          <div className="relative overflow-hidden rounded-lg border border-white/12 bg-[#07111d]/90 p-8">
            <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="grid h-16 w-16 place-items-center rounded-full border border-blue-400/30 bg-blue-500/10 text-cyan-300 shadow-[0_0_36px_rgba(14,165,233,0.35)]">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h3 className="mt-10 text-2xl font-black leading-tight text-white">
              Your broker gives executions.
              <span className="mt-3 block">We give clarity.</span>
            </h3>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Features" title="Everything you need to trade smarter" />
        <div className="mt-9 grid gap-5 lg:grid-cols-4">
          <FeatureCard icon={BarChart3} title="Analytics" body="Advanced performance metrics that reveal the real story.">
            <div className="mt-7 space-y-4">
              {analyticsMetrics.map(([label, value, tone]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{label}</span>
                  <span className={`font-black ${tone}`}>{value}</span>
                </div>
              ))}
              <LineChart color="#3b82f6" fill="rgba(37,99,235,0.12)" compact />
            </div>
          </FeatureCard>

          <FeatureCard icon={Shield} title="Risk Engine" body="Protect your capital with powerful risk management.">
            <div className="mt-7 space-y-4">
              {riskMetrics.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-white/8 pb-3 text-sm last:border-0">
                  <span className="text-slate-300">{label}</span>
                  <span className="font-black text-white">{value}</span>
                </div>
              ))}
              <div>
                <div className="mb-2 flex justify-between text-[10px] text-slate-400">
                  <span>Safe</span>
                  <span>Risky</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[84%] bg-gradient-to-r from-emerald-400 via-yellow-300 to-red-500" />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </FeatureCard>

          <FeatureCard icon={Brain} title="AI Coach" body="AI-powered insights to improve your trading behavior.">
            <div className="mt-7 space-y-3">
              {aiInsights.map((item) => (
                <InsightPill key={item.title} {...item} />
              ))}
            </div>
          </FeatureCard>

          <FeatureCard icon={Link2} title="Broker Sync" body="Connect and auto-sync your trades in minutes.">
            <div className="mt-7 space-y-4">
              {integrations.map(([name, status, gradient]) => (
                <div key={name} className="flex items-center justify-between gap-4 text-sm">
                  <span className="flex items-center gap-3 font-semibold text-white">
                    <span className={`h-5 w-5 rounded bg-gradient-to-br ${gradient}`} />
                    {name}
                  </span>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-bold ${
                      status === 'Coming soon' ? 'bg-white/10 text-slate-300' : 'bg-emerald-500/12 text-emerald-300'
                    }`}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="px-5 pb-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="How It Works" title="Get started in 4 simple steps" />
        <div className="relative mt-12 grid gap-10 md:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-9 hidden border-t border-dashed border-blue-300/35 md:block" />
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-blue-400/25 bg-blue-500/10 shadow-[0_0_38px_rgba(37,99,235,0.35)]">
                <step.icon className="h-9 w-9 text-cyan-300" />
              </div>
              <div className="mx-auto -mt-3 grid h-6 w-6 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {index + 1}
              </div>
              <h3 className="mt-4 text-sm font-black text-white">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-44 text-xs leading-5 text-slate-300">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AISection() {
  return (
    <section id="ai" className="border-y border-white/10 bg-black/15 px-5 py-16 sm:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.82fr_1.18fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-blue-400">AI-Powered Insights</p>
          <h2 className="mt-3 max-w-md text-4xl font-black leading-tight text-white">
            AI that understands your trading behavior.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
            Our AI analyzes thousands of data points to identify patterns, mistakes and opportunities you can't see on
            your own.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              'Detects revenge trading and bad habits',
              'Identifies overleveraging and high-risk behavior',
              'Finds your best setups, sessions and correlations',
              'Generates personalized improvement plans',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-white">
                  <Check className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-white/15 bg-[#07111d]/90 p-6 shadow-[0_0_55px_rgba(15,74,170,0.18)]">
          <h3 className="text-sm font-bold text-white">AI Trading Coach</h3>
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.72fr_1.15fr_1fr]">
            <div className="border-b border-white/10 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
              <p className="text-xs font-semibold text-slate-400">Overall Score</p>
              <p className="mt-2 text-4xl font-black text-emerald-300">78<span className="text-sm text-emerald-400">/100</span></p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
              </div>
              <div className="mt-8">
                <BrainGraphic />
              </div>
            </div>

            <div className="border-b border-white/10 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
              <p className="mb-5 text-xs font-bold text-white">Key Insights</p>
              <div className="space-y-3">
                {coachInsights.map(([title, body, tone]) => (
                  <div key={title} className="grid grid-cols-[2.5rem_1fr] gap-3 rounded-lg bg-white/[0.04] p-3">
                    <span className={`grid h-10 w-10 place-items-center rounded-lg bg-white/[0.04] ${tone}`}>
                      <TrendingUp className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-white">{title}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-400">{body}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-5 text-xs font-bold text-white">Recommendations</p>
              <div className="space-y-4">
                {recommendations.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-slate-200">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-slate-300">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
              <a
                href="#pricing"
                className="mt-9 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
              >
                View full AI report
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section id="pricing" className="px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Pricing" title="Simple, transparent pricing" />
        <div className="mt-9 grid gap-5 lg:grid-cols-4">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-lg border p-7 ${
                plan.highlighted
                  ? 'border-blue-500 bg-blue-500/[0.04] shadow-[0_0_50px_rgba(37,99,235,0.24)]'
                  : 'border-white/12 bg-[#07111d]/90'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-1.5 text-xs font-black text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-black text-white">{plan.name}</h3>
              <p className="mt-4 text-4xl font-black text-white">
                {plan.price}
                <span className="ml-2 text-sm font-semibold text-slate-400">/month</span>
              </p>
              <p className="mt-7 min-h-14 text-sm leading-6 text-slate-300">{plan.body}</p>
              <ul className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-200">
                    <Check className="h-4 w-4 text-cyan-300" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`mt-9 inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-bold transition ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:brightness-110'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SecuritySection() {
  return (
    <section className="border-y border-white/10 bg-black/15 px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Security & Trust" title="Your security is our priority" />
        <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {securityItems.map((item) => (
            <div key={item.title} className="grid grid-cols-[3.25rem_1fr] gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-lg border border-blue-400/20 bg-blue-500/10 text-cyan-300">
                <item.icon className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-sm font-black text-white">{item.title}</span>
                <span className="mt-2 block text-xs leading-5 text-slate-400">{item.body}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden px-5 py-12 text-center sm:px-8">
      <Candles side="left" />
      <Candles side="right" />
      <div className="relative mx-auto max-w-3xl">
        <h2 className="text-4xl font-black text-white">
          Stop gambling. Start <span className="text-blue-400">managing risk.</span>
        </h2>
        <p className="mt-4 text-sm text-slate-300">Join 1,200+ traders who trade smarter with MERKURE.</p>
        <a
          href="#pricing"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 px-9 py-3 text-sm font-bold text-white shadow-[0_0_34px_rgba(56,113,255,0.45)] transition hover:brightness-110"
        >
          Start Free Trial
          <ArrowRight className="h-4 w-4" />
        </a>
        <p className="mt-3 text-[11px] text-slate-500">No credit card required.</p>
      </div>
    </section>
  )
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <p className="text-xs font-black uppercase tracking-normal text-blue-400">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">{title}</h2>
    </div>
  )
}

function ProblemCard({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/12 bg-[#07111d]/90 p-8">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
      <span className="grid h-14 w-14 place-items-center rounded-full bg-red-500/10 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.28)]">
        <Icon className="h-8 w-8" />
      </span>
      <h3 className="mt-10 text-lg font-black text-white">{title}</h3>
      <p className="mt-4 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  children,
}: {
  icon: LucideIcon
  title: string
  body: string
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border border-white/12 bg-[#07111d]/90 p-6 shadow-[0_0_36px_rgba(15,74,170,0.08)]">
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 place-items-center rounded-lg border border-blue-400/20 bg-blue-500/10 text-blue-300">
          <Icon className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-lg font-black text-white">{title}</span>
          <span className="mt-2 block text-sm leading-6 text-slate-300">{body}</span>
        </span>
      </div>
      {children}
    </div>
  )
}

function InsightPill({ icon: Icon, title, body, tone }: { icon: LucideIcon; title: string; body: string; tone: string }) {
  const tones: Record<string, string> = {
    blue: 'text-blue-300 bg-blue-500/10',
    green: 'text-emerald-300 bg-emerald-500/10',
    cyan: 'text-cyan-300 bg-cyan-500/10',
  }

  return (
    <div className="grid grid-cols-[2.5rem_1fr] items-center gap-3 rounded-lg bg-white/[0.04] p-3">
      <span className={`grid h-10 w-10 place-items-center rounded-lg ${tones[tone] ?? tones.blue}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-sm font-bold text-white">{title}</span>
        <span className="mt-1 block text-xs text-slate-400">{body}</span>
      </span>
    </div>
  )
}

function PreviewCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-white/10 bg-white/[0.045] p-4 ${className}`}>{children}</div>
}

function MiniStat({ label, value, delta, danger = false }: { label: string; value: string; delta: string; danger?: boolean }) {
  return (
    <PreviewCard>
      <p className="text-[11px] font-semibold text-slate-400">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="text-lg font-black text-white">{value}</span>
        <span className={`text-xs font-black ${danger ? 'text-red-400' : 'text-emerald-300'}`}>{delta}</span>
      </div>
    </PreviewCard>
  )
}

function LineChart({
  color,
  fill,
  trend = 'up',
  compact = false,
}: {
  color: string
  fill: string
  trend?: 'up' | 'down'
  compact?: boolean
}) {
  const upLine = '0,150 24,130 48,138 72,102 96,82 120,108 144,92 168,118 192,72 216,80 240,48 264,34 288,60 312,82 336,52 360,28 384,42 408,12 432,30 456,10'
  const downLine = '0,64 24,64 48,64 72,96 96,60 120,72 144,90 168,86 192,114 216,102 240,96 264,120 288,112 312,134 336,122 360,144 384,132 408,152 432,140 456,162'
  const line = trend === 'down' ? downLine : upLine
  const area =
    trend === 'down'
      ? `${line} 456,178 0,178`
      : `${line} 456,174 0,174`

  return (
    <svg className={compact ? 'h-24 w-full' : 'h-40 w-full'} viewBox="0 0 456 180" role="img" aria-label="Performance chart">
      <defs>
        <linearGradient id={`chart-fill-${color.replace('#', '')}-${trend}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      {[36, 72, 108, 144].map((y) => (
        <line key={y} x1="0" x2="456" y1={y} y2={y} stroke="rgba(148,163,184,0.12)" strokeDasharray="4 6" />
      ))}
      <polygon points={area} fill={`url(#chart-fill-${color.replace('#', '')}-${trend})`} />
      <polyline points={line} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
      {trend === 'up' && (
        <>
          <circle cx="240" cy="48" r="4" fill="#93c5fd" />
          <circle cx="408" cy="12" r="4" fill="#93c5fd" />
        </>
      )}
    </svg>
  )
}

function BrainGraphic() {
  return (
    <svg className="h-36 w-full" viewBox="0 0 220 150" role="img" aria-label="AI brain analysis">
      <defs>
        <filter id="brainGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M86 112C54 112 34 92 38 67c3-18 17-27 31-27 5-19 23-28 40-21 12-11 33-6 39 10 16 0 29 13 29 29 16 9 17 35 0 45-6 23-40 24-52 9-9 9-27 10-39 0Z"
        fill="rgba(37,99,235,0.12)"
        stroke="#2563eb"
        strokeWidth="3"
        filter="url(#brainGlow)"
      />
      <path
        d="M72 44c-8 16 0 28 14 33m23-59c-11 16-8 35 8 47m37-35c-12 7-17 18-12 34m-82 48c9-17 25-25 45-23m17 27c-4-19 2-34 20-46m-57 8c18-8 35-5 51 8"
        fill="none"
        stroke="#38bdf8"
        strokeLinecap="round"
        strokeWidth="3"
      />
      {[58, 86, 124, 151, 174].map((cx, index) => (
        <circle key={cx} cx={cx} cy={[73, 44, 91, 57, 101][index]} r="3.5" fill="#60a5fa" />
      ))}
    </svg>
  )
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" role="img" aria-label="MERKURE logo">
      <path d="M7 7h18v18C14.8 25 7 17.2 7 7Z" fill="none" stroke="#4f74ff" strokeWidth="4" strokeLinejoin="round" />
      <path d="M12 12h8v8c-4.4 0-8-3.6-8-8Z" fill="#4f74ff" opacity="0.32" />
    </svg>
  )
}

function Candles({ side }: { side: 'left' | 'right' }) {
  const candles = side === 'left'
    ? [34, 48, 28, 42, 72, 92, 76, 52, 38, 58, 102, 116, 80, 68, 44, 34]
    : [38, 62, 86, 104, 92, 68, 50, 36, 48, 70, 94, 118, 130, 104, 84, 60]

  return (
    <div
      className={`absolute bottom-0 hidden h-40 items-end gap-2 opacity-55 lg:flex ${
        side === 'left' ? 'left-16' : 'right-16'
      }`}
      aria-hidden="true"
    >
      {candles.map((height, index) => (
        <span key={`${side}-${index}`} className="relative flex h-full w-2 items-end justify-center">
          <span className="absolute bottom-0 h-full w-px bg-blue-500/25" />
          <span
            className="w-2 rounded-full bg-gradient-to-t from-blue-900 via-blue-600 to-cyan-300"
            style={{ height }}
          />
        </span>
      ))}
    </div>
  )
}

export default App
