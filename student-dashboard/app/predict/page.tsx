'use client'

import { useState } from 'react'
import {
  Brain, Loader2, CheckCircle, AlertTriangle,
  TrendingUp, BookOpen, Users, Activity, Clock, Target
} from 'lucide-react'
import { Card, Badge, PageHeader } from '@/components/ui/Cards'
import { ScoreBreakdownRadar } from '@/components/charts/DashboardCharts'
import { getRiskBadgeClass, getPerformanceBadgeClass, getGPAColor } from '@/utils/helpers'
import type { PredictionResult } from '@/lib/prediction'
import toast from 'react-hot-toast'

interface FormData {
  full_name: string
  age: string
  gender: string
  grade: string
  study_hours: string
  attendance: string
  previous_gpa: string
  participation: string
  assignment_score: string
  eca_participation: string
}

const INITIAL_FORM: FormData = {
  full_name: '',
  age: '16',
  gender: 'Male',
  grade: '10',
  study_hours: '12',
  attendance: '80',
  previous_gpa: '3.0',
  participation: '60',
  assignment_score: '70',
  eca_participation: '40',
}

function SliderInput({
  label, value, min, max, step = 1, unit = '%',
  onChange, description
}: {
  label: string; value: string; min: number; max: number;
  step?: number; unit?: string; onChange: (v: string) => void;
  description?: string
}) {
  const numVal = Number(value)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700">{label}</label>
        <span className="text-sm font-bold text-blue-600">{numVal}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
      {description && <p className="text-xs text-gray-400">{description}</p>}
    </div>
  )
}

export default function PredictPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [saved, setSaved] = useState(false)

  const update = (key: keyof FormData) => (v: string) => setForm({ ...form, [key]: v })

  const handlePredict = async () => {
    if (!form.full_name.trim()) {
      toast.error('Please enter student name')
      return
    }
    setLoading(true)
    setResult(null)
    setSaved(false)
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendance: Number(form.attendance),
          study_hours: Number(form.study_hours),
          assignment_score: Number(form.assignment_score),
          participation: Number(form.participation),
          previous_gpa: Number(form.previous_gpa),
          eca_participation: Number(form.eca_participation),
        }),
      })
      if (!res.ok) throw new Error('Prediction failed')
      const data = await res.json()
      setResult(data.prediction)
    } catch {
      toast.error('Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result) return
    setSaving(true)
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          age: Number(form.age),
          gender: form.gender,
          grade: form.grade,
          study_hours: Number(form.study_hours),
          attendance: Number(form.attendance),
          previous_gpa: Number(form.previous_gpa),
          participation: Number(form.participation),
          assignment_score: Number(form.assignment_score),
          eca_participation: Number(form.eca_participation),
          predicted_gpa: result.predicted_gpa,
          risk_level: result.risk_level,
          performance_category: result.performance_category,
        }),
      })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error)
      }
      toast.success(`${form.full_name} saved to database!`)
      setSaved(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const radarData = result
    ? [
        { subject: 'Attendance', score: result.score_breakdown.attendance_score / 0.25, fullMark: 100 },
        { subject: 'Study Hours', score: result.score_breakdown.study_score / 0.20, fullMark: 100 },
        { subject: 'Assignments', score: result.score_breakdown.assignment_score / 0.25, fullMark: 100 },
        { subject: 'Participation', score: result.score_breakdown.participation_score / 0.15, fullMark: 100 },
        { subject: 'Prev GPA', score: result.score_breakdown.previous_gpa_score / 0.10, fullMark: 100 },
        { subject: 'ECA', score: result.score_breakdown.eca_score / 0.05, fullMark: 100 },
      ]
    : []

  return (
    <div>
      <PageHeader>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Predict Performance</h1>
          <p className="text-sm text-gray-500">Fill in student details to predict GPA and risk level</p>
        </div>
      </PageHeader>

      <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div className="space-y-4">
          {/* Student Info */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter student name"
                  value={form.full_name}
                  onChange={(e) => update('full_name')(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Age</label>
                <input
                  type="number" min={10} max={25}
                  value={form.age}
                  onChange={(e) => update('age')(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => update('gender')(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-blue-500"
                >
                  {['Male', 'Female', 'Non-binary'].map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Grade</label>
                <select
                  value={form.grade}
                  onChange={(e) => update('grade')(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-blue-500"
                >
                  {['9', '10', '11', '12'].map((g) => <option key={g}>Grade {g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Previous GPA</label>
                <input
                  type="number" min={0} max={4} step={0.1}
                  value={form.previous_gpa}
                  onChange={(e) => update('previous_gpa')(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card className="p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Performance Metrics</h3>

            <SliderInput
              label="Attendance" value={form.attendance}
              min={0} max={100} unit="%" onChange={update('attendance')}
              description="25% weight"
            />
            <SliderInput
              label="Weekly Study Hours" value={form.study_hours}
              min={0} max={40} step={0.5} unit="h" onChange={update('study_hours')}
              description="20% weight"
            />
            <SliderInput
              label="Assignment Score" value={form.assignment_score}
              min={0} max={100} unit="%" onChange={update('assignment_score')}
              description="25% weight"
            />
            <SliderInput
              label="Class Participation" value={form.participation}
              min={0} max={100} unit="%" onChange={update('participation')}
              description="15% weight"
            />
            <SliderInput
              label="ECA Participation" value={form.eca_participation}
              min={0} max={100} unit="%" onChange={update('eca_participation')}
              description="5% weight"
            />
          </Card>

          {/* Predict button */}
          <button
            onClick={handlePredict}
            disabled={loading || !form.full_name.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
            ) : (
              <><Brain size={16} /> Predict Performance</>
            )}
          </button>
        </div>

        {/* RIGHT: Results */}
        <div className="space-y-4">
          {!result && !loading && (
            <Card className="p-8 flex flex-col items-center justify-center text-center">
              <Brain size={32} className="text-gray-300 mb-3" />
              <h3 className="text-gray-600 font-medium mb-1">Ready to Predict</h3>
              <p className="text-gray-400 text-sm">Fill in the form and click Predict</p>
            </Card>
          )}

          {loading && (
            <Card className="p-8 flex flex-col items-center justify-center text-center">
              <Loader2 size={32} className="text-blue-600 animate-spin mb-3" />
              <h3 className="text-gray-700 font-medium">Analyzing {form.full_name}...</h3>
            </Card>
          )}

          {result && !loading && (
            <>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Results for {form.full_name}
                  </h3>
                  <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded">
                    {result.confidence}% confidence
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center border border-gray-200 rounded p-3">
                    <div className={`text-2xl font-bold ${getGPAColor(result.predicted_gpa)}`}>{result.predicted_gpa.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1">Predicted GPA</div>
                    <div className="text-xs text-gray-400">out of 4.0</div>
                  </div>
                  <div className="text-center border border-gray-200 rounded p-3">
                    <div className={`text-2xl font-bold ${result.risk_level === 'Low' ? 'text-green-600' : result.risk_level === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {result.risk_level}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Risk Level</div>
                  </div>
                  <div className="text-center border border-gray-200 rounded p-3">
                    <div className={`text-lg font-bold ${result.performance_category === 'Excellent' ? 'text-blue-600' : result.performance_category === 'Good' ? 'text-green-600' : result.performance_category === 'Average' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {result.performance_category}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Performance</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={getRiskBadgeClass(result.risk_level)}>{result.risk_level} Risk</Badge>
                  <Badge className={getPerformanceBadgeClass(result.performance_category)}>{result.performance_category}</Badge>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Score Breakdown</h3>
                <ScoreBreakdownRadar data={radarData} />
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600 p-2 bg-gray-50 rounded border border-gray-100">
                      <span className="text-blue-600 font-bold flex-shrink-0">{i + 1}.</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </Card>

              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded text-sm font-semibold ${saved ? 'bg-green-50 text-green-700 border border-green-200 cursor-default' : 'bg-gray-800 hover:bg-gray-900 text-white'} disabled:opacity-60`}
              >
                {saving ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving...</>
                ) : saved ? (
                  <><CheckCircle size={16} /> Saved to Database</>
                ) : (
                  <><TrendingUp size={16} /> Save Student to Database</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
