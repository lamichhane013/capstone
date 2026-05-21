import { ReactNode } from 'react'

// --- Card ---
interface CardProps {
  children: ReactNode
  className?: string
}
export function Card({ children, className }: CardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className || ''}`}>
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
  colorClass?: string
}
export function StatCard({ title, value, subtitle, icon, colorClass = 'text-blue-600' }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={colorClass}>{icon}</div>
        <span className="text-sm text-gray-600">{title}</span>
      </div>
      <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
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
    <span className={`inline-block px-2 py-0.5 text-xs rounded border ${className || ''}`}>
      {children}
    </span>
  )
}

// --- Skeleton ---
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-gray-200 ${className || ''}`} />
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
    <div className="flex items-start justify-between mb-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// --- Page Header ---
export function PageHeader({ children }: { children: ReactNode }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
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
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-gray-300 mb-3">{icon}</div>
      <h3 className="text-gray-700 font-medium mb-1">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// --- Loading Spinner ---
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 ${sizes[size]}`} />
  )
}
