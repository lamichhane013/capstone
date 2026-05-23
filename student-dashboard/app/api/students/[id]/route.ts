import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient<Database>(url, key);
}

// GET /api/students/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ student: data });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/students/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    const allowedFields = [
      "full_name",
      "age",
      "gender",
      "grade",
      "study_hours",
      "attendance",
      "previous_gpa",
      "participation",
      "assignment_score",
      "eca_participation",
      "predicted_gpa",
      "risk_level",
      "performance_category",
    ];
    for (const field of allowedFields) {
      if (field in body) updateData[field] = body[field];
    }

    const { data, error } = await supabase
      .from("students")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ student: data });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 },
    );
  }
}

// DELETE /api/students/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 },
    );
  }
}
