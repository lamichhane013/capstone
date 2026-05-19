# EduPredict — Student Performance Analytics Dashboard

> AI-powered student performance prediction and learning analytics platform built with Next.js 14, Supabase, and Recharts.

![Dashboard Preview](https://via.placeholder.com/1200x600/080d14/38bdf8?text=EduPredict+Dashboard)

## Features

- **AI Performance Prediction** — Weighted scoring model predicts GPA, risk level, and performance category
- **Real-time Analytics Dashboard** — 7+ chart types powered by Recharts
- **Student Management** — Full CRUD with search, filter, pagination
- **CSV Export** — Export all student data
- **Dark/Light Mode** — Toggle between themes
- **Responsive** — Works on mobile, tablet, desktop
- **Sample Data Seeding** — One-click seed 30 realistic students

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| Language | TypeScript |

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/student-performance-dashboard.git
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
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Seed Sample Data

Visit the **Dashboard** and click the **"Seed Data"** button to populate 30 realistic sample students.

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

The prediction system uses a **weighted scoring algorithm** inspired by educational research:

| Factor | Weight | Rationale |
|--------|--------|-----------|
| Attendance | 25% | Strongest predictor of academic success |
| Assignment Score | 25% | Direct measure of learning effort |
| Study Hours | 20% | Time investment correlates with performance |
| Class Participation | 15% | Active learning improves retention |
| Previous GPA | 10% | Historical performance indicator |
| ECA Participation | 5% | Soft skills and holistic development |

### Output
- **Predicted GPA** — 0.0 to 4.0 scale
- **Risk Level** — Low / Medium / High
- **Performance Category** — Excellent / Good / Average / At Risk
- **Confidence Score** — 60–95%
- **Personalized Recommendations** — Up to 4 actionable insights

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
```

Or connect your GitHub repo directly at [vercel.com](https://vercel.com).

---

## API Reference

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/students` | List with search/filter/pagination |
| `POST` | `/api/students` | Create student |
| `PATCH` | `/api/students/[id]` | Update student |
| `DELETE` | `/api/students/[id]` | Delete student |

### Prediction & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predict` | Run prediction (no DB save) |
| `GET` | `/api/dashboard` | Aggregated dashboard stats |
| `POST` | `/api/seed` | Seed 30 sample students |

---

## License

MIT — free to use, modify, and deploy.
