export interface PredictionInput {
  attendance: number; // 0-100
  study_hours: number; // 0-40 hrs/week
  assignment_score: number; // 0-100
  participation: number; // 0-100
  previous_gpa: number; // 0-4.0
  eca_participation: number; // 0-100
}

export interface PredictionResult {
  predicted_gpa: number;
  risk_level: "Low" | "Medium" | "High";
  performance_category: "Excellent" | "Good" | "Average" | "At Risk";
  confidence: number;
  recommendations: string[];
  score_breakdown: {
    attendance_score: number;
    study_score: number;
    assignment_score: number;
    participation_score: number;
    previous_gpa_score: number;
    eca_score: number;
  };
}

export async function predictPerformance(
  input: PredictionInput,
): Promise<PredictionResult> {
  const apiKey = process.env.OPENROUTER_AI_KEY;
  if (!apiKey)
    throw new Error("OPENROUTER_AI_KEY environment variable is not set");

  const prompt = `You are an academic performance prediction AI. Given the following student metrics, predict their academic performance.

Student Data:
- Attendance: ${input.attendance}% (scale: 0-100)
- Study Hours per week: ${input.study_hours} (scale: 0-40)
- Assignment Score: ${input.assignment_score}% (scale: 0-100)
- Class Participation: ${input.participation}% (scale: 0-100)
- Previous GPA: ${input.previous_gpa} (scale: 0.0-4.0)
- Extracurricular Activity Participation: ${input.eca_participation}% (scale: 0-100)

Respond ONLY with a valid JSON object — no markdown, no explanation. Use exactly this structure:
{
  "predicted_gpa": <number 0.00-4.00, two decimal places>,
  "risk_level": <"Low" | "Medium" | "High">,
  "performance_category": <"Excellent" | "Good" | "Average" | "At Risk">,
  "confidence": <integer 0-100>,
  "recommendations": [<up to 4 personalized recommendation strings>],
  "score_breakdown": {
    "attendance_score": <number 0-25>,
    "study_score": <number 0-20>,
    "assignment_score": <number 0-25>,
    "participation_score": <number 0-15>,
    "previous_gpa_score": <number 0-10>,
    "eca_score": <number 0-5>
  }
}

Constraints:
- predicted_gpa >= 3.5 → performance_category = "Excellent"
- predicted_gpa >= 3.0 → performance_category = "Good"
- predicted_gpa >= 2.0 → performance_category = "Average"
- predicted_gpa < 2.0  → performance_category = "At Risk"
- score_breakdown values represent each factor's weighted contribution toward the overall score (max totals: attendance 25, study 20, assignments 25, participation 15, prev_gpa 10, eca 5)`;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  const text = (data.choices[0].message.content as string).trim();

  // Strip markdown code fences if the model wraps the response
  const jsonText = text
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  const parsed = JSON.parse(jsonText) as PredictionResult;
  parsed.predicted_gpa =
    Math.round(Math.max(0, Math.min(4.0, parsed.predicted_gpa)) * 100) / 100;

  return parsed;
}
