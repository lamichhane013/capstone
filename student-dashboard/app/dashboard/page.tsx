'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Users, GraduationCap, Activity, AlertTriangle,
  TrendingUp, RefreshCw, Download, Database
} from 'lucide-react'
import { StatCard, Card, Badge, Skeleton, PageHeader, SectionHeader } from '@/components/ui/Cards'
import {
  GPADistributionChart, AttendanceVsGPAChart, StudyHoursVsGPAChart,
  GradePerformanceChart, RiskPieChart, PerformancePieChart, ECAAnalyticsChart
} from '@/components/charts/DashboardCharts'
import { formatGPA, getRiskBadgeClass, getPerformanceBadgeClass, exportToCSV } from '@/utils/helpers'
import toast from 'react-hot-toast'
import type { Student } from '@/lib/database.types'

interface DashboardData {
  totalStudents: number
  averageGPA: number
  averageAttendance: number
  atRiskCount: number
  topPerformers: Student[]
  atRiskStudents: Student[]
  riskDistribution: { name: string; value: number }[]
  gradeDistribution: { grade: string; avgGPA: number; count: number }[]
  gpaDistribution: { range: string; count: number }[]
  attendanceVsGPA: { name: string; attendance: number; gpa: number | null; risk: string | null }[]
  studyHoursVsGPA: { name: string; study_hours: number; gpa: number | null; risk: string | null }[]
  performanceCategories: { name: string; value: number }[]
  ecaAnalytics: { label: string; count: number; avgGPA: number }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load')
      const json = await res.json()
      setData(json)
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(`Seeded ${json.count} sample students!`)
      fetchDashboard()
    } catch (err) {
      toast.error('Seeding failed. Check Supabase connection.')
    } finally {
      setSeeding(false)
    }
  }

  const handleExport = async () => {
    try {
      const res = await fetch('/api/students?limit=1000')
      const json = await res.json()
      exportToCSV(json.students, 'students_export.csv')
      toast.success('CSV exported successfully!')
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Analytics Dashboard</h1>
            <p className="text-slate-500 text-sm">Real-time student performance overview</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 border border-slate-700/60 hover:border-slate-600 transition-all"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 border border-slate-700/60 hover:border-slate-600 transition-all disabled:opacity-50"
            >
              <Database size={15} className={seeding ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{seeding ? 'Seeding...' : 'Seed Data'}</span>
            </button>
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-brand-500/15 text-brand-400 hover:bg-brand-500/25 border border-brand-500/30 transition-all disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </PageHeader>

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                title="Total Students"
                value={data?.totalStudents ?? 0}
                icon={<Users size={18} />}
                colorClass="text-brand-400"
                delay={50}
              />
              <StatCard
                title="Average GPA"
                value={formatGPA(data?.averageGPA)}
                subtitle="Predicted across all students"
                icon={<GraduationCap size={18} />}
                colorClass="text-emerald-400"
                delay={100}
              />
              <StatCard
                title="Avg Attendance"
                value={`${data?.averageAttendance ?? 0}%`}
                icon={<Activity size={18} />}
                colorClass="text-amber-400"
                delay={150}
              />
              <StatCard
                title="At-Risk Students"
                value={data?.atRiskCount ?? 0}
                subtitle="High risk level"
                icon={<AlertTriangle size={18} />}
                colorClass="text-rose-400"
                delay={200}
              />
            </>
          )}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5 animate-slide-up opacity-0 [animation-fill-mode:forwards] stagger-3">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-400" />
              GPA Distribution
            </h3>
            {loading ? <Skeleton className="h-48" /> : <GPADistributionChart data={data?.gpaDistribution ?? []} />}
          </Card>
          <Card className="p-5 animate-slide-up opacity-0 [animation-fill-mode:forwards] stagger-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Risk Level Distribution
            </h3>
            {loading ? <Skeleton className="h-48" /> : <RiskPieChart data={data?.riskDistribution ?? []} />}
          </Card>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5 animate-slide-up opacity-0 [animation-fill-mode:forwards] stagger-3">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Attendance vs Predicted GPA
            </h3>
            {loading ? <Skeleton className="h-52" /> : <AttendanceVsGPAChart data={data?.attendanceVsGPA ?? []} />}
          </Card>
          <Card className="p-5 animate-slide-up opacity-0 [animation-fill-mode:forwards] stagger-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Study Hours vs Performance
            </h3>
            {loading ? <Skeleton className="h-52" /> : <StudyHoursVsGPAChart data={data?.studyHoursVsGPA ?? []} />}
          </Card>
        </div>

        {/* Charts row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-5 lg:col-span-1 animate-slide-up opacity-0 [animation-fill-mode:forwards] stagger-3">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              Performance Categories
            </h3>
            {loading ? <Skeleton className="h-52" /> : <PerformancePieChart data={data?.performanceCategories ?? []} />}
          </Card>
          <Card className="p-5 lg:col-span-2 animate-slide-up opacity-0 [animation-fill-mode:forwards] stagger-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              Grade-wise Average GPA
            </h3>
            {loading ? <Skeleton className="h-52" /> : <GradePerformanceChart data={data?.gradeDistribution ?? []} />}
          </Card>
        </div>

        {/* ECA Chart */}
        <Card className="p-5 animate-slide-up opacity-0 [animation-fill-mode:forwards] stagger-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            ECA Participation Impact on Performance
          </h3>
          {loading ? <Skeleton className="h-48" /> : <ECAAnalyticsChart data={data?.ecaAnalytics ?? []} />}
        </Card>

        {/* Top Performers & At-Risk Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Performers */}
          <Card className="p-5 animate-slide-up opacity-0 [animation-fill-mode:forwards] stagger-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-400" />
              Top Performing Students
            </h3>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : data?.topPerformers.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No students yet</p>
            ) : (
              <div className="space-y-2">
                {data?.topPerformers.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500 w-5">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{s.full_name}</p>
                        <p className="text-xs text-slate-500">Grade {s.grade}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">{formatGPA(s.predicted_gpa)}</p>
                      <Badge className={getPerformanceBadgeClass(s.performance_category)}>
                        {s.performance_category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* At-Risk Students */}
          <Card className="p-5 animate-slide-up opacity-0 [animation-fill-mode:forwards] stagger-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <AlertTriangle size={14} className="text-rose-400" />
              Students Requiring Attention
            </h3>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : data?.atRiskStudents.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No at-risk students</p>
            ) : (
              <div className="space-y-2">
                {data?.atRiskStudents.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-rose-950/20 border border-rose-900/30">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{s.full_name}</p>
                      <p className="text-xs text-slate-500">Grade {s.grade} · Att: {s.attendance}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-400">{formatGPA(s.predicted_gpa)}</p>
                      <Badge className={getRiskBadgeClass(s.risk_level)}>
                        {s.risk_level} Risk
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
