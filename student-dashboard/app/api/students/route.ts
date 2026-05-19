import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase environment variables')
  return createClient<Database>(url, key)
}

// GET /api/students — list all students with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''
    const grade = searchParams.get('grade') ?? ''
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '10')
    const offset = (page - 1) * limit

    let query = supabase
      .from('students')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('full_name', `%${search}%`)
    }
    if (grade && grade !== 'all') {
      query = query.eq('grade', grade)
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      students: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    })
  } catch (err) {
    console.error('GET /api/students error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// POST /api/students — create a new student
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    // Validation
    const required = ['full_name', 'age', 'gender', 'grade', 'study_hours', 'attendance', 'previous_gpa']
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { error: `Field '${field}' is required` },
          { status: 400 }
        )
      }
    }

    const { data, error } = await supabase
      .from('students')
      .insert({
        full_name: body.full_name,
        age: Number(body.age),
        gender: body.gender,
        grade: String(body.grade),
        study_hours: Number(body.study_hours),
        attendance: Number(body.attendance),
        previous_gpa: Number(body.previous_gpa),
        participation: Number(body.participation ?? 0),
        assignment_score: Number(body.assignment_score ?? 0),
        eca_participation: Number(body.eca_participation ?? 0),
        predicted_gpa: body.predicted_gpa ? Number(body.predicted_gpa) : null,
        risk_level: body.risk_level ?? null,
        performance_category: body.performance_category ?? null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ student: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/students error:', err)
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}
