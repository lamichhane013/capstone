'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Search, Filter, Plus, Download, Pencil, Trash2,
  ChevronLeft, ChevronRight, X, Users, Save, Loader2
} from 'lucide-react'
import { Card, Badge, Skeleton, EmptyState, PageHeader } from '@/components/ui/Cards'
import { formatGPA, getRiskBadgeClass, getPerformanceBadgeClass, exportToCSV, debounce } from '@/utils/helpers'
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
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendance: form.attendance,
          study_hours: form.study_hours,
          assignment_score: form.assignment_score,
          participation: form.participation,
          previous_gpa: form.previous_gpa,
          eca_participation: form.eca_participation,
        }),
      })
      if (!res.ok) throw new Error('Prediction failed')
      const data = await res.json()
      const prediction = data.prediction
      await onSave({
        ...form,
        predicted_gpa: prediction.predicted_gpa,
        risk_level: prediction.risk_level,
        performance_category: prediction.performance_category,
      })
    } finally {
      setSaving(false)
    }
  }

  const field = (key: keyof typeof form, label: string, type = 'number', min?: number, max?: number) => (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
        min={min}
        max={max}
        step={type === 'number' ? '0.1' : undefined}
        className="w-full px-3 py-2 rounded border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white border border-gray-200 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Edit Student</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">{field('full_name', 'Full Name', 'text')}</div>
          {field('age', 'Age', 'number', 10, 25)}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full px-3 py-2 rounded border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-blue-500"
            >
              {['Male', 'Female', 'Non-binary'].map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Grade</label>
            <select
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              className="w-full px-3 py-2 rounded border border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-blue-500"
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
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded text-sm text-gray-600 border border-gray-300 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Delete Confirm Dialog ---
function DeleteDialog({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-sm shadow-lg">
        <h3 className="text-base font-bold text-gray-900 mb-2">Delete Student?</h3>
        <p className="text-gray-600 text-sm mb-6">
          Are you sure you want to delete <strong>{name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded text-sm text-gray-600 border border-gray-300 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded text-sm bg-red-600 hover:bg-red-700 text-white">
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
    <div>
      <PageHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Students</h1>
            <p className="text-sm text-gray-500">{total} total records</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 rounded text-sm text-gray-600 border border-gray-300 hover:bg-gray-50">
              <Download size={15} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <a href="/predict" className="flex items-center gap-2 px-3 py-2 rounded text-sm bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={15} />
              <span>Add Student</span>
            </a>
          </div>
        </div>
      </PageHeader>

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 rounded border border-gray-300 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
            />
            {search && (
              <button onClick={() => { setSearch(''); fetchStudents(1, '', grade) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <div className="flex gap-1">
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => handleGradeChange(g)}
                  className={`px-3 py-1.5 rounded text-xs border ${grade === g ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
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
                <tr className="border-b border-gray-200 bg-gray-50">
                  {['Student', 'Grade', 'GPA', 'Attendance', 'Study Hrs', 'Assignment', 'Predicted GPA', 'Risk', 'Performance', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
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
                        description={search ? "Try adjusting your search or filters" : "Add students via Predict or seed sample data from the dashboard"}
                      />
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 table-row-hover">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{s.full_name}</p>
                          <p className="text-xs text-gray-400">{s.gender}, {s.age}y</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.grade}</td>
                      <td className="px-4 py-3 text-gray-700 text-xs">{formatGPA(s.previous_gpa)}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{s.attendance}%</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{s.study_hours}h</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{s.assignment_score}%</td>
                      <td className="px-4 py-3 font-bold text-xs text-blue-600">{formatGPA(s.predicted_gpa)}</td>
                      <td className="px-4 py-3">
                        <Badge className={getRiskBadgeClass(s.risk_level)}>{s.risk_level ?? '—'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getPerformanceBadgeClass(s.performance_category)}>{s.performance_category ?? '—'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditingStudent(s)} className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeletingStudent(s)} className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50">
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded text-gray-500 hover:text-gray-800 disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const p = i + 1
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded text-xs ${page === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded text-gray-500 hover:text-gray-800 disabled:opacity-30"
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
