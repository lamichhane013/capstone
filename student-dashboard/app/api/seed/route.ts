import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateSampleStudents } from '@/lib/prediction'
import type { Database } from '@/lib/database.types'

// POST /api/seed — populate database with sample students
export async function POST() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Missing Supabase environment variables')
    const supabase = createClient<Database>(url, key)

    const samples = generateSampleStudents()

    const { data, error } = await supabase
      .from('students')
      .insert(samples)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      count: data?.length ?? 0,
      message: `Successfully seeded ${data?.length} students`,
    })
  } catch (err) {
    console.error('POST /api/seed error:', err)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
