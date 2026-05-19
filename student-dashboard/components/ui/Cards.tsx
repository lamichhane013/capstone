import { cn } from '@/utils/helpers'
import { ReactNode } from 'react'

// --- Card ---
interface CardProps {
  children: ReactNode
  className?: string
  glow?: 'blue' | 'purple' | 'none'
}
export function Card({ children, className, glow = 'none' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-[var(--bg-card)] border-slate-800/70 overflow-hidden',
        glow === 'blue' && 'glow-blue',
        glow === 'purple' && 'glow-purple',
        className
      )}
    >
      {children}
    </div>
  )
}

// --- Stat Card ---
interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  trend?: { value: number; label: string }
  colorClass?: string
  delay?: number
}
export function StatCard({ title, value, subtitle, icon, trend, colorClass = 'text-brand-400', delay = 0 }: StatCardProps) {
  return (
    <Card className={cn('p-5 animate-slide-up opacity-0 [animation-fill-mode:forwards]')}
      style={{ animationDelay: `${delay}ms` } as React.CSSProperties}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-lg bg-slate-800/60', colorClass)}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-mono px-2 py-1 rounded-full border',
            trend.value >= 0
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
          )}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div className={cn('text-2xl font-bold mb-1', colorClass)}>{value}</div>
      <div className="text-sm text-slate-400 font-medium">{title}</div>
      {subtitle && <div className="text-xs text-slate-600 mt-1">{subtitle}</div>}
    </Card>
  )
}

// --- Badge ---
interface BadgeProps {
  children: ReactNode
  className?: string
}
export function Badge({ children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      className
    )}>
      {children}
    </span>
  )
}

// --- Skeleton ---
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'animate-pulse rounded bg-slate-800/60',
      className
    )} />
  )
}

// --- Section Header ---
interface SectionHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}
export function SectionHeader({ title, subtitle, actions }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// --- Page Header ---
export function PageHeader({ children }: { children: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-slate-800/50 px-6 py-4">
      {children}
    </header>
  )
}

// --- Empty State ---
interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4 text-slate-500">
        {icon}
      </div>
      <h3 className="text-slate-300 font-semibold mb-2">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

// --- Loading Spinner ---
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div className={cn('animate-spin rounded-full border-2 border-slate-700 border-t-brand-500', sizes[size])} />
  )
}
