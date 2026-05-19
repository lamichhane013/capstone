-- ============================================================
-- EduPredict: Student Performance Dashboard
-- Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if re-running
DROP TABLE IF EXISTS students CASCADE;

-- Create students table
CREATE TABLE students (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name        TEXT NOT NULL CHECK (char_length(full_name) >= 2),
  age              INTEGER NOT NULL CHECK (age BETWEEN 10 AND 30),
  gender           TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Non-binary')),
  grade            TEXT NOT NULL CHECK (grade IN ('9', '10', '11', '12')),

  -- Academic inputs
  study_hours      NUMERIC(4,1) NOT NULL DEFAULT 0 CHECK (study_hours BETWEEN 0 AND 40),
  attendance       NUMERIC(5,1) NOT NULL DEFAULT 0 CHECK (attendance BETWEEN 0 AND 100),
  previous_gpa     NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (previous_gpa BETWEEN 0 AND 4),
  participation    NUMERIC(5,1) NOT NULL DEFAULT 0 CHECK (participation BETWEEN 0 AND 100),
  assignment_score NUMERIC(5,1) NOT NULL DEFAULT 0 CHECK (assignment_score BETWEEN 0 AND 100),
  eca_participation NUMERIC(5,1) NOT NULL DEFAULT 0 CHECK (eca_participation BETWEEN 0 AND 100),

  -- AI prediction outputs
  predicted_gpa    NUMERIC(3,2) CHECK (predicted_gpa BETWEEN 0 AND 4),
  risk_level       TEXT CHECK (risk_level IN ('Low', 'Medium', 'High')),
  performance_category TEXT CHECK (performance_category IN ('Excellent', 'Good', 'Average', 'At Risk')),

  -- Timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_students_grade ON students(grade);
CREATE INDEX idx_students_risk_level ON students(risk_level);
CREATE INDEX idx_students_performance ON students(performance_category);
CREATE INDEX idx_students_name ON students(full_name);
CREATE INDEX idx_students_created ON students(created_at DESC);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) — enable for production
-- For development/demo, allow all operations
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (for demo — tighten for production)
CREATE POLICY "Allow all operations" ON students
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Verification query — run to confirm setup
-- ============================================================
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;
