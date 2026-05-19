'use client'

import { useState } from 'react'
import {
  Brain, Sparkles, Loader2, CheckCircle, AlertTriangle,
  TrendingUp, BookOpen, Users, Activity, Clock, Target
} from 'lucide-react'
import { Card, Badge, PageHeader } from '@/components/ui/Cards'
import { ScoreBreakdownRadar } from '@/components/charts/DashboardCharts'
import { cn, getRiskBadgeClass, getPerformanceBadgeClass, getGPAColor } from '@/utils/helpers'
import { predictPerformance, type PredictionResult } from '@/lib/prediction'
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

// Slider input component
function SliderInput({
  label, name, value, min, max, step = 1, unit = '%',
  onChange, icon, description
}: {
  label: string; name: string; value: string; min: number; max: number;
  step?: number; unit?: string; onChange: (v: string) => void;
  icon: React.ReactNode; description?: string
}) {
  const numVal = Number(value)
  const pct = ((numVal - min) / (max - min)) * 100
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          {icon}
          {label}
        </label>
        <span className="font-mono text-sm font-bold text-brand-400">
          {numVal}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #38bdf8 0%, #818cf8 ${pct}%, #1e293b ${pct}%, #1e293b 100%)`
        }}
      />
      {description && <p className="text-xs text-slate-600">{description}</p>}
    </div>
  )
}

// Result card
function ResultCard({ label, value, sub, colorClass, icon }: {
  label: string; value: string; sub?: string; colorClass: string; icon: React.ReactNode
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 bg-slate-800/60', colorClass)}>
        {icon}
      </div>
      <div className={cn('text-2xl font-bold mb-1 count-up', colorClass)}>{value}</div>
      <div className="text-xs text-slate-400 font-medium">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
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
    // Small delay for UX effect
    await new Promise((r) => setTimeout(r, 600))
    try {
      const prediction = predictPerformance({
        attendance: Number(form.attendance),
        study_hours: Number(form.study_hours),
        assignment_score: Number(form.assignment_score),
        participation: Number(form.participation),
        previous_gpa: Number(form.previous_gpa),
        eca_participation: Number(form.eca_participation),
      })
      setResult(prediction)
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

  // Build radar chart data from score breakdown
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
    <div className="flex flex-col h-full">
      <PageHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">AI Performance Predictor</h1>
              <p className="text-slate-500 text-sm">Weighted scoring model • Instant analysis</p>
            </div>
          </div>
        </div>
      </PageHeader>

      <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
        {/* LEFT: Form */}
        <div className="space-y-5">
          {/* Student Info */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Users size={14} className="text-brand-400" />
              Student Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1 font-medium">Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter student name..."
                  value={form.full_name}
                  onChange={(e) => update('full_name')(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm placeholder:text-slate-600 input-focus"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Age</label>
                <input
                  type="number" min={10} max={25}
                  value={form.age}
                  onChange={(e) => update('age')(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm input-focus"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => update('gender')(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm input-focus"
                >
                  {['Male', 'Female', 'Non-binary'].map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Grade</label>
                <select
                  value={form.grade}
                  onChange={(e) => update('grade')(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm input-focus"
                >
                  {['9', '10', '11', '12'].map((g) => <option key={g}>Grade {g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Previous GPA</label>
                <input
                  type="number" min={0} max={4} step={0.1}
                  value={form.previous_gpa}
                  onChange={(e) => update('previous_gpa')(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm input-focus"
                />
              </div>
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card className="p-5 space-y-5">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Activity size={14} className="text-amber-400" />
              Performance Metrics
              <span className="text-xs text-slate-600 font-normal ml-auto">Drag sliders to adjust</span>
            </h3>

            <SliderInput
              label="Attendance" name="attendance" value={form.attendance}
              min={0} max={100} unit="%" onChange={update('attendance')}
              icon={<Activity size={14} className="text-amber-400" />}
              description="25% weight — most impactful factor"
            />
            <SliderInput
              label="Weekly Study Hours" name="study_hours" value={form.study_hours}
              min={0} max={40} step={0.5} unit="h" onChange={update('study_hours')}
              icon={<Clock size={14} className="text-brand-400" />}
              description="20% weight"
            />
            <SliderInput
              label="Assignment Score" name="assignment_score" value={form.assignment_score}
              min={0} max={100} unit="%" onChange={update('assignment_score')}
              icon={<BookOpen size={14} className="text-purple-400" />}
              description="25% weight — tied with attendance"
            />
            <SliderInput
              label="Class Participation" name="participation" value={form.participation}
              min={0} max={100} unit="%" onChange={update('participation')}
              icon={<Users size={14} className="text-emerald-400" />}
              description="15% weight"
            />
            <SliderInput
              label="ECA Participation" name="eca_participation" value={form.eca_participation}
              min={0} max={100} unit="%" onChange={update('eca_participation')}
              icon={<Target size={14} className="text-rose-400" />}
              description="5% weight"
            />
          </Card>

          {/* Predict button */}
          <button
            onClick={handlePredict}
            disabled={loading || !form.full_name.trim()}
            className={cn(
              'w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-base font-semibold transition-all',
              'bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500',
              'text-white shadow-lg shadow-brand-500/20',
              'disabled:opacity-60 disabled:cursor-not-allowed'
            )}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Analyzing Performance...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Predict Performance
              </>
            )}
          </button>
        </div>

        {/* RIGHT: Results */}
        <div className="space-y-5">
          {!result && !loading && (
            <Card className="p-10 flex flex-col items-center justify-center text-center min-h-64">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
                <Brain size={28} className="text-slate-600" />
              </div>
              <h3 className="text-slate-400 font-semibold mb-2">Ready to Predict</h3>
              <p className="text-slate-600 text-sm max-w-xs">
                Fill in the student information and performance metrics, then click Predict to generate AI-powered insights.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-xs">
                {[
                  { label: 'Attendance', w: '25%' },
                  { label: 'Assignments', w: '25%' },
                  { label: 'Study Hours', w: '20%' },
                  { label: 'Participation', w: '15%' },
                  { label: 'Prev GPA', w: '10%' },
                  { label: 'ECA', w: '5%' },
                ].map((f) => (
                  <div key={f.label} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                    <div className="text-brand-400 text-xs font-bold font-mono">{f.w}</div>
                    <div className="text-slate-600 text-xs mt-0.5">{f.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {loading && (
            <Card className="p-10 flex flex-col items-center justify-center text-center min-h-64">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 animate-pulse-slow">
                <Brain size={28} className="text-brand-400" />
              </div>
              <h3 className="text-slate-300 font-semibold mb-2">Analyzing {form.full_name}...</h3>
              <p className="text-slate-600 text-sm">Running weighted prediction model</p>
              <div className="mt-4 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </Card>
          )}

          {result && !loading && (
            <>
              {/* Main Result Cards */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400" />
                    Prediction Results for{' '}
                    <span className="text-white">{form.full_name}</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    {result.confidence}% confidence
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <ResultCard
                    label="Predicted GPA"
                    value={result.predicted_gpa.toFixed(2)}
                    sub="out of 4.0"
                    colorClass={getGPAColor(result.predicted_gpa)}
                    icon={<TrendingUp size={18} />}
                  />
                  <ResultCard
                    label="Risk Level"
                    value={result.risk_level}
                    colorClass={result.risk_level === 'Low' ? 'text-emerald-400' : result.risk_level === 'Medium' ? 'text-amber-400' : 'text-rose-400'}
                    icon={<AlertTriangle size={18} />}
                  />
                  <ResultCard
                    label="Performance"
                    value={result.performance_category}
                    colorClass={result.performance_category === 'Excellent' ? 'text-brand-400' : result.performance_category === 'Good' ? 'text-emerald-400' : result.performance_category === 'Average' ? 'text-amber-400' : 'text-rose-400'}
                    icon={<Sparkles size={18} />}
                  />
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={getRiskBadgeClass(result.risk_level)}>
                    {result.risk_level} Risk
                  </Badge>
                  <Badge className={getPerformanceBadgeClass(result.performance_category)}>
                    {result.performance_category}
                  </Badge>
                  <Badge className="bg-slate-800 text-slate-400 border-slate-700">
                    Grade {form.grade} · Age {form.age}
                  </Badge>
                </div>
              </Card>

              {/* Radar Chart */}
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <Activity size={14} className="text-brand-400" />
                  Factor Score Breakdown
                </h3>
                <ScoreBreakdownRadar data={radarData} />
              </Card>

              {/* Recommendations */}
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <Brain size={14} className="text-purple-400" />
                  AI Recommendations
                </h3>
                <div className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                      <div className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-brand-400 text-xs font-bold">{i + 1}</span>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={cn(
                  'w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-base font-semibold transition-all',
                  saved
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600',
                  saving && 'opacity-70'
                )}
              >
                {saving ? (
                  <><Loader2 size={18} className="animate-spin" /> Saving...</>
                ) : saved ? (
                  <><CheckCircle size={18} /> Saved to Database</>
                ) : (
                  <><TrendingUp size={18} /> Save Student to Database</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
