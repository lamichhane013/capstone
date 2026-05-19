import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatGPA(gpa: number | null | undefined): string {
  if (gpa === null || gpa === undefined) return 'N/A'
  return gpa.toFixed(2)
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A'
  return `${Math.round(value)}%`
}

export function getRiskColor(risk: string | null): string {
  switch (risk) {
    case 'Low': return 'text-emerald-400'
    case 'Medium': return 'text-amber-400'
    case 'High': return 'text-rose-400'
    default: return 'text-slate-400'
  }
}

export function getRiskBadgeClass(risk: string | null): string {
  switch (risk) {
    case 'Low': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    case 'Medium': return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    case 'High': return 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    default: return 'bg-slate-500/15 text-slate-400 border-slate-500/30'
  }
}

export function getPerformanceBadgeClass(category: string | null): string {
  switch (category) {
    case 'Excellent': return 'bg-brand-500/15 text-brand-400 border-brand-500/30'
    case 'Good': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    case 'Average': return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    case 'At Risk': return 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    default: return 'bg-slate-500/15 text-slate-400 border-slate-500/30'
  }
}

export function getGPAColor(gpa: number | null): string {
  if (!gpa) return 'text-slate-400'
  if (gpa >= 3.5) return 'text-brand-400'
  if (gpa >= 3.0) return 'text-emerald-400'
  if (gpa >= 2.0) return 'text-amber-400'
  return 'text-rose-400'
}

/**
 * Export students data to CSV and trigger download
 */
export function exportToCSV(students: Record<string, unknown>[], filename = 'students.csv') {
  if (!students.length) return

  const headers = [
    'Full Name', 'Age', 'Gender', 'Grade',
    'Study Hours/Week', 'Attendance %', 'Previous GPA',
    'Participation %', 'Assignment Score', 'ECA %',
    'Predicted GPA', 'Risk Level', 'Performance Category', 'Created At',
  ]

  const rows = students.map((s) => [
    s.full_name,
    s.age,
    s.gender,
    s.grade,
    s.study_hours,
    s.attendance,
    s.previous_gpa,
    s.participation,
    s.assignment_score,
    s.eca_participation,
    s.predicted_gpa,
    s.risk_level,
    s.performance_category,
    s.created_at ? new Date(s.created_at as string).toLocaleDateString() : '',
  ])

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell ?? ''}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
