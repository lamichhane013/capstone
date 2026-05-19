export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          full_name: string
          age: number
          gender: string
          grade: string
          study_hours: number
          attendance: number
          previous_gpa: number
          participation: number
          assignment_score: number
          eca_participation: number
          predicted_gpa: number | null
          risk_level: string | null
          performance_category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          age: number
          gender: string
          grade: string
          study_hours: number
          attendance: number
          previous_gpa: number
          participation: number
          assignment_score: number
          eca_participation: number
          predicted_gpa?: number | null
          risk_level?: string | null
          performance_category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          age?: number
          gender?: string
          grade?: string
          study_hours?: number
          attendance?: number
          previous_gpa?: number
          participation?: number
          assignment_score?: number
          eca_participation?: number
          predicted_gpa?: number | null
          risk_level?: string | null
          performance_category?: string | null
          updated_at?: string
        }
      }
    }
  }
}

export type Student = Database['public']['Tables']['students']['Row']
export type StudentInsert = Database['public']['Tables']['students']['Insert']
export type StudentUpdate = Database['public']['Tables']['students']['Update']
