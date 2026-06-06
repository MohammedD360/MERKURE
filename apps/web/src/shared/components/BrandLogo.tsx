import { cn } from '@/lib/utils'

export function BrandIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={cn('shrink-0 text-current', className)} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M7 9.5L20 4l13 5.5v21L20 36 7 30.5v-21Z" stroke="currentColor" strokeWidth="2.7" strokeLinejoin="round" />
      <path d="M12 27V13l8 8 8-8v14" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface BrandLogoProps {
  className?: string
  iconClassName?: string
  textClassName?: string
}

export function BrandLogo({
  className,
  iconClassName = 'h-8 w-8',
  textClassName = 'text-xl font-bold tracking-tight',
}: BrandLogoProps) {
  return (
    <div className={cn('flex items-center gap-3 text-white', className)}>
      <BrandIcon className={iconClassName} />
      <span className={cn('text-current', textClassName)}>MERKURE</span>
    </div>
  )
}
