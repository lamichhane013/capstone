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

/**
 * Generate sample students for seeding/testing
 */
export async function generateSampleStudents(): Promise<
  Array<{
    full_name: string;
    age: number;
    gender: string;
    grade: string;
    study_hours: number;
    attendance: number;
    previous_gpa: number;
    participation: number;
    assignment_score: number;
    eca_participation: number;
    predicted_gpa: number;
    risk_level: string;
    performance_category: string;
  }>
> {
  const names = [
    "Emma Johnson",
    "Liam Williams",
    "Olivia Brown",
    "Noah Davis",
    "Ava Martinez",
    "Ethan Wilson",
    "Sophia Anderson",
    "Mason Taylor",
    "Isabella Thomas",
    "Logan Jackson",
    "Mia White",
    "Lucas Harris",
    "Charlotte Martin",
    "Alexander Thompson",
    "Amelia Garcia",
    "Benjamin Martinez",
    "Harper Robinson",
    "James Clark",
    "Evelyn Rodriguez",
    "Daniel Lewis",
    "Abigail Lee",
    "Henry Walker",
    "Emily Hall",
    "Michael Allen",
    "Elizabeth Young",
    "William Hernandez",
    "Sofia King",
    "Sebastian Wright",
    "Avery Scott",
    "Jack Green",
  ];

  const grades = ["9", "10", "11", "12"];
  const genders = ["Male", "Female", "Non-binary"];

  return Promise.all(
    names.map(async (name) => {
      const isHighPerformer = Math.random() > 0.6;
      const isAtRisk = !isHighPerformer && Math.random() > 0.6;

      const attendance = isHighPerformer
        ? 80 + Math.random() * 20
        : isAtRisk
          ? 50 + Math.random() * 25
          : 65 + Math.random() * 20;

      const study_hours = isHighPerformer
        ? 15 + Math.random() * 15
        : isAtRisk
          ? 2 + Math.random() * 8
          : 8 + Math.random() * 10;

      const previous_gpa = isHighPerformer
        ? 3.0 + Math.random() * 1.0
        : isAtRisk
          ? 1.5 + Math.random() * 1.0
          : 2.0 + Math.random() * 1.5;

      const assignment_score = isHighPerformer
        ? 75 + Math.random() * 25
        : isAtRisk
          ? 40 + Math.random() * 30
          : 55 + Math.random() * 25;

      const participation = isHighPerformer
        ? 65 + Math.random() * 35
        : isAtRisk
          ? 20 + Math.random() * 30
          : 40 + Math.random() * 30;

      const eca_participation = Math.random() * 100;

      const prediction = await predictPerformance({
        attendance,
        study_hours,
        assignment_score,
        participation,
        previous_gpa,
        eca_participation,
      });

      return {
        full_name: name,
        age: 14 + Math.floor(Math.random() * 5),
        gender: genders[Math.floor(Math.random() * genders.length)],
        grade: grades[Math.floor(Math.random() * grades.length)],
        study_hours: Math.round(study_hours * 10) / 10,
        attendance: Math.round(attendance * 10) / 10,
        previous_gpa: Math.round(previous_gpa * 100) / 100,
        participation: Math.round(participation * 10) / 10,
        assignment_score: Math.round(assignment_score * 10) / 10,
        eca_participation: Math.round(eca_participation * 10) / 10,
        predicted_gpa: prediction.predicted_gpa,
        risk_level: prediction.risk_level,
        performance_category: prediction.performance_category,
      };
    }),
  );
}
