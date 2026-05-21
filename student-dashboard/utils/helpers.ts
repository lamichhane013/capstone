import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGPA(gpa: number | null | undefined): string {
  if (gpa === null || gpa === undefined) return "N/A";
  return gpa.toFixed(2);
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  return `${Math.round(value)}%`;
}

export function getRiskColor(risk: string | null): string {
  switch (risk) {
    case "Low":
      return "text-green-600";
    case "Medium":
      return "text-yellow-600";
    case "High":
      return "text-red-600";
    default:
      return "text-gray-400";
  }
}

export function getRiskBadgeClass(risk: string | null): string {
  switch (risk) {
    case "Low":
      return "bg-green-100 text-green-700 border-green-300";
    case "Medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "High":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-gray-100 text-gray-600 border-gray-300";
  }
}

export function getPerformanceBadgeClass(category: string | null): string {
  switch (category) {
    case "Excellent":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "Good":
      return "bg-green-100 text-green-700 border-green-300";
    case "Average":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "At Risk":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-gray-100 text-gray-600 border-gray-300";
  }
}

export function getGPAColor(gpa: number | null): string {
  if (!gpa) return "text-gray-400";
  if (gpa >= 3.5) return "text-blue-600";
  if (gpa >= 3.0) return "text-green-600";
  if (gpa >= 2.0) return "text-yellow-600";
  return "text-red-600";
}

/**
 * Export students data to CSV and trigger download
 */
export function exportToCSV(
  students: Record<string, unknown>[],
  filename = "students.csv",
) {
  if (!students.length) return;

  const headers = [
    "Full Name",
    "Age",
    "Gender",
    "Grade",
    "Study Hours/Week",
    "Attendance %",
    "Previous GPA",
    "Participation %",
    "Assignment Score",
    "ECA %",
    "Predicted GPA",
    "Risk Level",
    "Performance Category",
    "Created At",
  ];

  const rows = students.map((s) => [
    s.full_name,
    s.age,
    s.gender,
    s.grade,
    s.study_hours,
    s.attendance,
    s.previous_gpa,
    s.participation,
    s.assignment_score,
    s.eca_participation,
    s.predicted_gpa,
    s.risk_level,
    s.performance_category,
    s.created_at ? new Date(s.created_at as string).toLocaleDateString() : "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell ?? ""}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
