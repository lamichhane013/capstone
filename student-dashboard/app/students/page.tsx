'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Search, Filter, Plus, Download, Pencil, Trash2,
  ChevronLeft, ChevronRight, X, Users, Save, Loader2
} from 'lucide-react'
import { Card, Badge, Skeleton, EmptyState, PageHeader } from '@/components/ui/Cards'
import { cn, formatGPA, getRiskBadgeClass, getPerformanceBadgeClass, exportToCSV, debounce } from '@/utils/helpers'
import { predictPerformance } from '@/lib/prediction'
import toast from 'react-hot-toast'
import type { Student } from '@/lib/database.types'

const GRADES = ['all', '9', '10', '11', '12']
const PAGE_SIZE = 10

// --- Edit Modal ---
function EditModal({ student, onClose, onSave }: {
  student: Student
  onClose: () => void
  onSave: (updated: Partial<Student>) => Promise<void>
}) {
  const [form, setForm] = useState({
    full_name: student.full_name,
    age: student.age,
    gender: student.gender,
    grade: student.grade,
    study_hours: student.study_hours,
    attendance: student.attendance,
    previous_gpa: student.previous_gpa,
    participation: student.participation,
    assignment_score: student.assignment_score,
    eca_participation: student.eca_participation,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const prediction = predictPerformance({
      attendance: form.attendance,
      study_hours: form.study_hours,
      assignment_score: form.assignment_score,
      participation: form.participation,
      previous_gpa: form.previous_gpa,
      eca_participation: form.eca_participation,
    })
    await onSave({
      ...form,
      predicted_gpa: prediction.predicted_gpa,
      risk_level: prediction.risk_level,
      performance_category: prediction.performance_category,
    })
    setSaving(false)
  }

  const field = (key: keyof typeof form, label: string, type = 'number', min?: number, max?: number) => (
    <div>
      <label className="block text-xs text-slate-400 mb-1 font-medium">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
        min={min}
        max={max}
        step={type === 'number' ? '0.1' : undefined}
        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm input-focus"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        <div className="sticky top-0 bg-[#111827] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Edit Student</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">{field('full_name', 'Full Name', 'text')}</div>
          {field('age', 'Age', 'number', 10, 25)}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm input-focus"
            >
              {['Male', 'Female', 'Non-binary'].map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Grade</label>
            <select
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm input-focus"
            >
              {['9', '10', '11', '12'].map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          {field('previous_gpa', 'Previous GPA (0-4)', 'number', 0, 4)}
          {field('study_hours', 'Study Hrs/Week', 'number', 0, 40)}
          {field('attendance', 'Attendance %', 'number', 0, 100)}
          {field('assignment_score', 'Assignment Score %', 'number', 0, 100)}
          {field('participation', 'Participation %', 'number', 0, 100)}
          {field('eca_participation', 'ECA Participation %', 'number', 0, 100)}
        </div>
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 border border-slate-700 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-brand-500 hover:bg-brand-400 text-white transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Delete Confirm Dialog ---
function DeleteDialog({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
        <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-4">
          <Trash2 size={20} className="text-rose-400" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">Delete Student?</h3>
        <p className="text-slate-400 text-sm mb-6">
          Are you sure you want to delete <strong className="text-slate-200">{name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg text-sm text-slate-400 border border-slate-700 hover:text-slate-200 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg text-sm bg-rose-500 hover:bg-rose-400 text-white transition-all">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Main Page ---
export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [grade, setGrade] = useState('all')
  const [loading, setLoading] = useState(true)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null)
  const searchRef = useRef<string>('')

  const fetchStudents = useCallback(async (p = 1, q = search, g = grade) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE), search: q, grade: g })
      const res = await fetch(`/api/students?${params}`)
      const json = await res.json()
      setStudents(json.students ?? [])
      setTotal(json.total ?? 0)
      setTotalPages(json.totalPages ?? 1)
    } catch {
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [search, grade])

  useEffect(() => { fetchStudents(page, search, grade) }, [page, grade])

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((q: string) => {
      setPage(1)
      fetchStudents(1, q, grade)
    }, 400),
    [grade]
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setSearch(q)
    searchRef.current = q
    debouncedSearch(q)
  }

  const handleGradeChange = (g: string) => {
    setGrade(g)
    setPage(1)
    fetchStudents(1, search, g)
  }

  const handleEdit = async (updated: Partial<Student>) => {
    if (!editingStudent) return
    try {
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (!res.ok) throw new Error('Update failed')
      toast.success('Student updated!')
      setEditingStudent(null)
      fetchStudents(page, search, grade)
    } catch {
      toast.error('Failed to update student')
    }
  }

  const handleDelete = async () => {
    if (!deletingStudent) return
    try {
      await fetch(`/api/students/${deletingStudent.id}`, { method: 'DELETE' })
      toast.success('Student deleted')
      setDeletingStudent(null)
      fetchStudents(page, search, grade)
    } catch {
      toast.error('Failed to delete student')
    }
  }

  const handleExport = async () => {
    const res = await fetch('/api/students?limit=1000')
    const json = await res.json()
    exportToCSV(json.students, 'students.csv')
    toast.success('Exported to CSV!')
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Students</h1>
            <p className="text-slate-500 text-sm">{total} total records</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-all">
              <Download size={15} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <a href="/predict" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-brand-500 hover:bg-brand-400 text-white transition-all">
              <Plus size={15} />
              <span>Add Student</span>
            </a>
          </div>
        </div>
      </PageHeader>

      <div className="p-6 space-y-4 animate-fade-in">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--bg-card)] border border-slate-800 text-slate-200 text-sm placeholder:text-slate-600 input-focus"
            />
            {search && (
              <button onClick={() => { setSearch(''); fetchStudents(1, '', grade) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500" />
            <div className="flex gap-1">
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => handleGradeChange(g)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                    grade === g
                      ? 'bg-brand-500/15 text-brand-400 border-brand-500/30'
                      : 'text-slate-500 border-slate-700/50 hover:border-slate-600 hover:text-slate-300'
                  )}
                >
                  {g === 'all' ? 'All' : `Gr ${g}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/80">
                  {['Student', 'Grade', 'GPA', 'Attendance', 'Study Hrs', 'Assignment', 'Predicted GPA', 'Risk', 'Performance', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-800/40">
                      {Array.from({ length: 10 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <EmptyState
                        icon={<Users size={28} />}
                        title="No students found"
                        description={search ? "Try adjusting your search or filters" : "Add students via AI Predict or seed sample data from the dashboard"}
                      />
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id} className="border-b border-slate-800/40 table-row-hover">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-200">{s.full_name}</p>
                          <p className="text-xs text-slate-500">{s.gender}, {s.age}y</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{s.grade}</td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-xs">{formatGPA(s.previous_gpa)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', s.attendance >= 85 ? 'bg-emerald-400' : s.attendance >= 70 ? 'bg-amber-400' : 'bg-rose-400')}
                              style={{ width: `${s.attendance}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{s.attendance}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{s.study_hours}h</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{s.assignment_score}%</td>
                      <td className="px-4 py-3 font-bold font-mono text-xs text-brand-400">{formatGPA(s.predicted_gpa)}</td>
                      <td className="px-4 py-3">
                        <Badge className={getRiskBadgeClass(s.risk_level)}>{s.risk_level ?? '—'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getPerformanceBadgeClass(s.performance_category)}>{s.performance_category ?? '—'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditingStudent(s)} className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeletingStudent(s)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/60">
              <span className="text-xs text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const p = i + 1
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        'w-7 h-7 rounded-lg text-xs transition-all',
                        page === p ? 'bg-brand-500/20 text-brand-400' : 'text-slate-500 hover:text-slate-200'
                      )}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {editingStudent && <EditModal student={editingStudent} onClose={() => setEditingStudent(null)} onSave={handleEdit} />}
      {deletingStudent && <DeleteDialog name={deletingStudent.full_name} onConfirm={handleDelete} onClose={() => setDeletingStudent(null)} />}
    </div>
  )
}
