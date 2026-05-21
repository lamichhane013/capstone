'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Users, GraduationCap, Activity, AlertTriangle,
  TrendingUp, RefreshCw, Download, Database
} from 'lucide-react'
import { StatCard, Card, Badge, Skeleton, PageHeader } from '@/components/ui/Cards'
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
    <div>
      <PageHeader>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Student performance overview</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 rounded text-sm text-gray-600 border border-gray-300 hover:bg-gray-50"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-2 px-3 py-2 rounded text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              <Database size={15} />
              <span className="hidden sm:inline">{seeding ? 'Seeding...' : 'Seed Data'}</span>
            </button>
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))
          ) : (
            <>
              <StatCard
                title="Total Students"
                value={data?.totalStudents ?? 0}
                icon={<Users size={18} />}
                colorClass="text-blue-600"
              />
              <StatCard
                title="Average GPA"
                value={formatGPA(data?.averageGPA)}
                subtitle="Predicted across all students"
                icon={<GraduationCap size={18} />}
                colorClass="text-green-600"
              />
              <StatCard
                title="Avg Attendance"
                value={`${data?.averageAttendance ?? 0}%`}
                icon={<Activity size={18} />}
                colorClass="text-yellow-600"
              />
              <StatCard
                title="At-Risk Students"
                value={data?.atRiskCount ?? 0}
                subtitle="High risk level"
                icon={<AlertTriangle size={18} />}
                colorClass="text-red-500"
              />
            </>
          )}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">GPA Distribution</h3>
            {loading ? <Skeleton className="h-48" /> : <GPADistributionChart data={data?.gpaDistribution ?? []} />}
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Risk Level Distribution</h3>
            {loading ? <Skeleton className="h-48" /> : <RiskPieChart data={data?.riskDistribution ?? []} />}
          </Card>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Attendance vs Predicted GPA</h3>
            {loading ? <Skeleton className="h-52" /> : <AttendanceVsGPAChart data={data?.attendanceVsGPA ?? []} />}
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Study Hours vs Performance</h3>
            {loading ? <Skeleton className="h-52" /> : <StudyHoursVsGPAChart data={data?.studyHoursVsGPA ?? []} />}
          </Card>
        </div>

        {/* Charts row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-4 lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Performance Categories</h3>
            {loading ? <Skeleton className="h-52" /> : <PerformancePieChart data={data?.performanceCategories ?? []} />}
          </Card>
          <Card className="p-4 lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Grade-wise Average GPA</h3>
            {loading ? <Skeleton className="h-52" /> : <GradePerformanceChart data={data?.gradeDistribution ?? []} />}
          </Card>
        </div>

        {/* ECA Chart */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">ECA Participation Impact</h3>
          {loading ? <Skeleton className="h-48" /> : <ECAAnalyticsChart data={data?.ecaAnalytics ?? []} />}
        </Card>

        {/* Top Performers & At-Risk Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-green-600" />
              Top Performing Students
            </h3>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : data?.topPerformers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No students yet</p>
            ) : (
              <div className="space-y-2">
                {data?.topPerformers.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded border border-gray-100 hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-5">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{s.full_name}</p>
                        <p className="text-xs text-gray-400">Grade {s.grade}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{formatGPA(s.predicted_gpa)}</p>
                      <Badge className={getPerformanceBadgeClass(s.performance_category)}>
                        {s.performance_category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500" />
              Students Needing Attention
            </h3>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : data?.atRiskStudents.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No at-risk students</p>
            ) : (
              <div className="space-y-2">
                {data?.atRiskStudents.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded border border-red-100 bg-red-50">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.full_name}</p>
                      <p className="text-xs text-gray-400">Grade {s.grade} · Att: {s.attendance}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-500">{formatGPA(s.predicted_gpa)}</p>
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


