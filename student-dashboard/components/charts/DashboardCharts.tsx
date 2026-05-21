'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, PieChart, Pie, Cell, LineChart, Line,
  Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts'

// --- Color palette ---
const COLORS = {
  blue: '#38bdf8',
  purple: '#c084fc',
  emerald: '#34d399',
  amber: '#fbbf24',
  rose: '#fb7185',
  indigo: '#818cf8',
}

const RISK_COLORS: Record<string, string> = {
  Low: COLORS.emerald,
  Medium: COLORS.amber,
  High: COLORS.rose,
  Unknown: '#64748b',
}

const PERF_COLORS: Record<string, string> = {
  Excellent: COLORS.blue,
  Good: COLORS.emerald,
  Average: COLORS.amber,
  'At Risk': COLORS.rose,
  Unknown: '#64748b',
}

// Shared tooltip style
const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '12px',
    color: '#374151',
  },
  cursor: { fill: 'rgba(0, 0, 0, 0.03)' },
}

// --- GPA Distribution Bar Chart ---
export function GPADistributionChart({ data }: { data: { range: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="count" fill={COLORS.blue} radius={[6, 6, 0, 0]} maxBarSize={50}>
          {data.map((_, index) => (
            <Cell key={index} fill={`rgba(56, 189, 248, ${0.4 + (index / data.length) * 0.6})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// --- Attendance vs GPA Scatter Chart ---
export function AttendanceVsGPAChart({ data }: { data: { name: string; attendance: number; gpa: number | null; risk: string | null }[] }) {
  const grouped = {
    Low: data.filter((d) => d.risk === 'Low'),
    Medium: data.filter((d) => d.risk === 'Medium'),
    High: data.filter((d) => d.risk === 'High'),
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ScatterChart margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="attendance" name="Attendance" unit="%" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[40, 100]} />
        <YAxis dataKey="gpa" name="GPA" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 4]} />
        <Tooltip
          {...tooltipStyle}
          cursor={{ strokeDasharray: '3 3', stroke: '#d1d5db' }}
          formatter={(value, name) => [
            name === 'gpa' ? `${Number(value).toFixed(2)} GPA` : `${value}%`,
            name === 'gpa' ? 'Predicted GPA' : 'Attendance',
          ]}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
        {Object.entries(grouped).map(([risk, points]) => (
          <Scatter
            key={risk}
            name={`${risk} Risk`}
            data={points}
            fill={RISK_COLORS[risk]}
            opacity={0.75}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  )
}

// --- Study Hours vs GPA Scatter Chart ---
export function StudyHoursVsGPAChart({ data }: { data: { name: string; study_hours: number; gpa: number | null; risk: string | null }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ScatterChart margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="study_hours" name="Study Hours" unit="h" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis dataKey="gpa" name="GPA" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 4]} />
        <Tooltip
          {...tooltipStyle}
          cursor={{ strokeDasharray: '3 3', stroke: '#d1d5db' }}
          formatter={(value, name) => [
            name === 'gpa' ? `${Number(value).toFixed(2)} GPA` : `${value} hrs`,
            name === 'gpa' ? 'Predicted GPA' : 'Study Hours',
          ]}
        />
        <Scatter name="Students" data={data} fill={COLORS.purple} opacity={0.7} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

// --- Grade-wise Performance Bar Chart ---
export function GradePerformanceChart({ data }: { data: { grade: string; avgGPA: number; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="grade" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 4]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} formatter={(v) => [`${Number(v).toFixed(2)} avg GPA`, 'Average GPA']} />
        <Bar dataKey="avgGPA" name="Avg GPA" fill={COLORS.indigo} radius={[6, 6, 0, 0]} maxBarSize={60} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// --- Risk Level Pie Chart ---
export function RiskPieChart({ data }: { data: { name: string; value: number }[] }) {
  const RADIAN = Math.PI / 180
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
    cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="600">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={45}
          dataKey="value"
          labelLine={false}
          label={renderLabel}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={RISK_COLORS[entry.name] ?? '#64748b'} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} formatter={(v, n) => [`${v} students`, n]} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// --- Performance Category Pie Chart ---
export function PerformancePieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={45}
          dataKey="value"
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={PERF_COLORS[entry.name] ?? '#64748b'} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} formatter={(v, n) => [`${v} students`, n]} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

// --- ECA Analytics Bar Chart ---
export function ECAAnalyticsChart({ data }: { data: { label: string; count: number; avgGPA: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" />
        <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" domain={[0, 4]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
        <Bar yAxisId="left" dataKey="count" name="# Students" fill={COLORS.emerald} radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar yAxisId="right" dataKey="avgGPA" name="Avg GPA" fill={COLORS.amber} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// --- Score Breakdown Radar ---
export function ScoreBreakdownRadar({ data }: { data: { subject: string; score: number; fullMark: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
        <Radar name="Score" dataKey="score" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.25} strokeWidth={2} />
        <Tooltip {...tooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Score']} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
