import { NextRequest, NextResponse } from "next/server";
import { predictPerformance } from "@/lib/prediction";

// POST /api/predict — run AI prediction (does not save to DB)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = [
      "attendance",
      "study_hours",
      "assignment_score",
      "participation",
      "previous_gpa",
      "eca_participation",
    ];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `Missing field: ${field}` },
          { status: 400 },
        );
      }
    }

    const result = await predictPerformance({
      attendance: Number(body.attendance),
      study_hours: Number(body.study_hours),
      assignment_score: Number(body.assignment_score),
      participation: Number(body.participation),
      previous_gpa: Number(body.previous_gpa),
      eca_participation: Number(body.eca_participation),
    });

    return NextResponse.json({ prediction: result });
  } catch (err) {
    console.error("POST /api/predict error:", err);
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 });
  }
}
