# EduPredict — Student Performance Analytics Dashboard

> AI-powered student performance prediction and learning analytics platform built with Next.js 14, Supabase, and Recharts.

<!-- https://github.com/lamichhane013/capstone -->
## Features

- **AI Performance Prediction** — Powered by DeepSeek V4 Flash via OpenRouter API; predicts GPA, risk level, and performance category
- **Real-time Analytics Dashboard** — 7+ chart types powered by Recharts
- **Student Management** — Full CRUD with search, filter, pagination
- **CSV Export** — Export all student data
- **Dark/Light Mode** — Toggle between themes
- **Responsive** — Works on mobile, tablet, desktop
- **Sample Data Seeding** — One-click seed 30 realistic students

## Tech Stack

| Layer         | Technology                           |
| ------------- | ------------------------------------ |
| Framework     | Next.js 14 (App Router)              |
| Styling       | Tailwind CSS                         |
| Charts        | Recharts                             |
| Database      | Supabase (PostgreSQL)                |
| AI Prediction | DeepSeek V4 Flash via OpenRouter API |
| Hosting       | Vercel                               |
| Language      | TypeScript                           |

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/lamichhane013/capstone.git
cd student-performance-dashboard
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open the **SQL Editor** in your project dashboard
3. Copy and run the contents of `supabase-schema.sql`
4. Go to **Settings → API** and copy your Project URL and anon key

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
OPENROUTER_AI_KEY=your_openrouter_api_key_here
```

> **Getting your OpenRouter API key:** Sign up at [openrouter.ai](https://openrouter.ai), go to **Keys** in your account settings, and create a new key. The prediction feature will not work without this key.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).


---

## Project Structure

```
student-performance-dashboard/
├── app/
│   ├── api/
│   │   ├── students/
│   │   │   ├── route.ts         # GET (list), POST (create)
│   │   │   └── [id]/route.ts    # GET, PATCH, DELETE by ID
│   │   ├── predict/route.ts     # POST — run prediction
│   │   ├── dashboard/route.ts   # GET — aggregated stats
│   │   └── seed/route.ts        # POST — seed sample data
│   ├── dashboard/page.tsx       # Analytics dashboard
│   ├── students/page.tsx        # Student management
│   ├── predict/page.tsx         # AI prediction form
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   ├── charts/
│   │   └── DashboardCharts.tsx  # All 7 Recharts visualizations
│   └── ui/
│       ├── Cards.tsx            # StatCard, Badge, Skeleton, etc.
│       ├── Sidebar.tsx          # Navigation sidebar
│       └── ThemeProvider.tsx    # Dark/light mode context
│
├── lib/
│   ├── prediction.ts            # AI prediction engine
│   ├── supabase.ts              # Supabase client
│   └── database.types.ts        # TypeScript types
│
├── utils/
│   └── helpers.ts               # Utility functions, CSV export
│
├── supabase-schema.sql          # Database schema
└── .env.example
```

---

## AI Prediction Engine

The prediction system delegates all inference to an **external Large Language Model** accessed through the [OpenRouter](https://openrouter.ai) API. No scoring logic runs locally — the application constructs a structured prompt from the student's metrics, sends it to the model, and parses the JSON response it returns.

### Model

| Property     | Value                                                     |
| ------------ | --------------------------------------------------------- |
| Provider     | [OpenRouter](https://openrouter.ai)                       |
| Model        | `deepseek/deepseek-v4-flash`                              |
| API Endpoint | `https://openrouter.ai/api/v1/chat/completions`           |
| Auth         | Bearer token via `OPENROUTER_AI_KEY` environment variable |

### How It Works

1. **Input collection** — The `/api/predict` endpoint receives six student metrics from the client.
2. **Prompt construction** — `lib/prediction.ts` builds a deterministic system prompt that describes each metric, its valid range, and the exact JSON schema the model must return.
3. **API call** — The prompt is sent to OpenRouter using the `deepseek/deepseek-v4-flash` model. The model reasons holistically about the student's profile — it is not constrained to a fixed formula.
4. **Response parsing** — The raw text response is stripped of any markdown code fences and parsed as JSON. The `predicted_gpa` is clamped to `[0.00, 4.00]` before being returned to the client.
5. **No persistence** — The prediction result is returned directly in the API response and is never written to the database.

### Input Factors

The following six factors are passed verbatim to the model in the prompt:

| Factor              | Scale           | Notes                                      |
| ------------------- | --------------- | ------------------------------------------ |
| Attendance          | 0 – 100%        | Percentage of classes attended             |
| Study Hours         | 0 – 40 hrs/week | Self-reported weekly study time            |
| Assignment Score    | 0 – 100%        | Average score across submitted assignments |
| Class Participation | 0 – 100%        | Engagement level during lectures           |
| Previous GPA        | 0.0 – 4.0       | GPA from the preceding term                |
| ECA Participation   | 0 – 100%        | Involvement in extracurricular activities  |

The model is instructed to return a `score_breakdown` object that reflects each factor's weighted contribution (attendance: max 25, study: max 20, assignments: max 25, participation: max 15, previous GPA: max 10, ECA: max 5), giving a total possible score of 100.

### Output

The model returns — and the API forwards — the following fields:

| Field                  | Type                                              | Description                                              |
| ---------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| `predicted_gpa`        | `number`                                          | Predicted GPA on a 0.00 – 4.00 scale, two decimal places |
| `risk_level`           | `"Low" \| "Medium" \| "High"`                     | Academic risk classification                             |
| `performance_category` | `"Excellent" \| "Good" \| "Average" \| "At Risk"` | Categorical performance label                            |
| `confidence`           | `integer 0–100`                                   | Model's self-reported confidence in the prediction       |
| `recommendations`      | `string[]`                                        | Up to 4 personalized, actionable improvement suggestions |
| `score_breakdown`      | `object`                                          | Per-factor score contributions (see table above)         |

**Performance category thresholds enforced via prompt:**

| Predicted GPA | Category  |
| ------------- | --------- |
| ≥ 3.5         | Excellent |
| ≥ 3.0         | Good      |
| ≥ 2.0         | Average   |
| < 2.0         | At Risk   |

### Error Handling

- If `OPENROUTER_AI_KEY` is not set, `predictPerformance()` throws immediately before making any network call.
- If the OpenRouter API returns a non-2xx status, the error body is captured and re-thrown with the HTTP status code included.
- If the model wraps its JSON in markdown code fences (` ```json … ``` `), the fences are stripped before `JSON.parse()` is called.

---

## Deployment on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add OPENROUTER_AI_KEY
```

> `OPENROUTER_AI_KEY` is a **server-only** variable (no `NEXT_PUBLIC_` prefix). It is never exposed to the browser.

Or connect your GitHub repo directly at [vercel.com](https://vercel.com).

---

## API Reference

### Students

| Method   | Endpoint             | Description                        |
| -------- | -------------------- | ---------------------------------- |
| `GET`    | `/api/students`      | List with search/filter/pagination |
| `POST`   | `/api/students`      | Create student                     |
| `PATCH`  | `/api/students/[id]` | Update student                     |
| `DELETE` | `/api/students/[id]` | Delete student                     |

### Prediction & Analytics

| Method | Endpoint         | Description                                   |
| ------ | ---------------- | --------------------------------------------- |
| `POST` | `/api/predict`   | Run AI prediction via OpenRouter (no DB save) |
| `GET`  | `/api/dashboard` | Aggregated dashboard stats                    |
| `POST` | `/api/seed`      | Seed 30 sample students                       |

---

## License

MIT — free to use, modify, and deploy.
