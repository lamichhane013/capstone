import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createClient<Database>(url, key)
}

// GET /api/dashboard — aggregated stats for dashboard
export async function GET() {
  try {
    const supabase = getSupabase()

    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!students || students.length === 0) {
      return NextResponse.json({
        totalStudents: 0,
        averageGPA: 0,
        averageAttendance: 0,
        atRiskCount: 0,
        topPerformers: [],
        atRiskStudents: [],
        riskDistribution: [],
        gradeDistribution: [],
        gpaDistribution: [],
        attendanceVsGPA: [],
        studyHoursVsGPA: [],
        performanceCategories: [],
        ecaAnalytics: [],
      })
    }

    // Core stats
    const totalStudents = students.length
    const validGPAs = students.filter((s) => s.predicted_gpa !== null)
    const averageGPA =
      validGPAs.length > 0
        ? validGPAs.reduce((acc, s) => acc + (s.predicted_gpa ?? 0), 0) / validGPAs.length
        : 0
    const averageAttendance =
      students.reduce((acc, s) => acc + s.attendance, 0) / students.length

    // At-risk and top performers
    const atRiskStudents = students.filter((s) => s.risk_level === 'High').slice(0, 5)
    const topPerformers = [...students]
      .filter((s) => s.predicted_gpa !== null)
      .sort((a, b) => (b.predicted_gpa ?? 0) - (a.predicted_gpa ?? 0))
      .slice(0, 5)

    // Risk distribution for pie chart
    const riskCounts = students.reduce<Record<string, number>>((acc, s) => {
      const r = s.risk_level ?? 'Unknown'
      acc[r] = (acc[r] ?? 0) + 1
      return acc
    }, {})
    const riskDistribution = Object.entries(riskCounts).map(([name, value]) => ({ name, value }))

    // Performance category distribution
    const catCounts = students.reduce<Record<string, number>>((acc, s) => {
      const c = s.performance_category ?? 'Unknown'
      acc[c] = (acc[c] ?? 0) + 1
      return acc
    }, {})
    const performanceCategories = Object.entries(catCounts).map(([name, value]) => ({ name, value }))

    // GPA distribution (buckets)
    const gpaBuckets = [
      { range: '0.0–1.0', min: 0, max: 1 },
      { range: '1.0–2.0', min: 1, max: 2 },
      { range: '2.0–2.5', min: 2, max: 2.5 },
      { range: '2.5–3.0', min: 2.5, max: 3 },
      { range: '3.0–3.5', min: 3, max: 3.5 },
      { range: '3.5–4.0', min: 3.5, max: 4.01 },
    ]
    const gpaDistribution = gpaBuckets.map(({ range, min, max }) => ({
      range,
      count: students.filter((s) => {
        const g = s.predicted_gpa ?? 0
        return g >= min && g < max
      }).length,
    }))

    // Grade-wise average GPA
    const gradeGroups = students.reduce<Record<string, number[]>>((acc, s) => {
      acc[s.grade] = acc[s.grade] ?? []
      if (s.predicted_gpa !== null) acc[s.grade].push(s.predicted_gpa)
      return acc
    }, {})
    const gradeDistribution = Object.entries(gradeGroups)
      .map(([grade, gpas]) => ({
        grade: `Grade ${grade}`,
        avgGPA: gpas.length > 0 ? Math.round((gpas.reduce((a, b) => a + b, 0) / gpas.length) * 100) / 100 : 0,
        count: gpas.length,
      }))
      .sort((a, b) => a.grade.localeCompare(b.grade))

    // Attendance vs GPA scatter (sample up to 50 points)
    const attendanceVsGPA = students
      .filter((s) => s.predicted_gpa !== null)
      .slice(0, 50)
      .map((s) => ({
        name: s.full_name,
        attendance: s.attendance,
        gpa: s.predicted_gpa,
        risk: s.risk_level,
      }))

    // Study hours vs GPA
    const studyHoursVsGPA = students
      .filter((s) => s.predicted_gpa !== null)
      .slice(0, 50)
      .map((s) => ({
        name: s.full_name,
        study_hours: s.study_hours,
        gpa: s.predicted_gpa,
        risk: s.risk_level,
      }))

    // ECA analytics by participation bucket
    const ecaBuckets = [
      { label: 'None (0%)', min: 0, max: 10 },
      { label: 'Low (10-30%)', min: 10, max: 30 },
      { label: 'Medium (30-60%)', min: 30, max: 60 },
      { label: 'High (60-80%)', min: 60, max: 80 },
      { label: 'Very High (80%+)', min: 80, max: 101 },
    ]
    const ecaAnalytics = ecaBuckets.map(({ label, min, max }) => {
      const bucket = students.filter((s) => s.eca_participation >= min && s.eca_participation < max)
      const avgGPA = bucket.length > 0
        ? bucket.filter((s) => s.predicted_gpa !== null).reduce((acc, s) => acc + (s.predicted_gpa ?? 0), 0) /
          bucket.filter((s) => s.predicted_gpa !== null).length
        : 0
      return { label, count: bucket.length, avgGPA: Math.round(avgGPA * 100) / 100 }
    })

    return NextResponse.json({
      totalStudents,
      averageGPA: Math.round(averageGPA * 100) / 100,
      averageAttendance: Math.round(averageAttendance * 10) / 10,
      atRiskCount: atRiskStudents.length,
      topPerformers,
      atRiskStudents,
      riskDistribution,
      gradeDistribution,
      gpaDistribution,
      attendanceVsGPA,
      studyHoursVsGPA,
      performanceCategories,
      ecaAnalytics,
    })
  } catch (err) {
    console.error('GET /api/dashboard error:', err)
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 })
  }
}
