# RateMe

**Full-stack social ranking, achievements, comparison, and salary benchmarking platform.**

Users build a profile across three dimensions — social reputation, personal achievements, and salary — then compare themselves against friends, other users, and public figures.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-rateme--app--lilac.vercel.app-brightgreen)](https://rateme-app-lilac.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com)

**[→ View Live Demo](https://rateme-app-lilac.vercel.app)**

---

## Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Compare & Rank
![Compare](./screenshots/compare.png)

### Salary Insights
![Salary](./screenshots/salary.png)

### Achievements
![Achievements](./screenshots/achievements.png)

---

## Features

### Authentication
- Email/password sign-up and login via Supabase Auth
- Cookie-based sessions with server-side validation
- All protected routes enforce authentication via Next.js middleware
- Profile creation is automatic on first sign-in

### Social Rating System
- Rate friends across Trust, Communication, Helpfulness, and Respect
- Only accepted friends can rate each other
- No anonymous ratings — rater identity is always stored

### Achievement System
- Add achievements: education, work experience, business, military, volunteering, and more
- Each achievement is weighted by category and impact level
- Global ranking based on accumulated points

### Compare & Ranking Engine
- Compare your score against friends, other users, and public figures (e.g. Elon Musk)
- Category breakdown: Technology, Business, Education, Global Impact
- Shows exact score difference per category

### Salary Insights
- Enter a salary range (monthly, with currency)
- Benchmarks filtered by field, experience level, and country
- Shows average, top 10%, and percentile distribution
- Results hidden when fewer than 5 users match — no individual data is ever exposed
- Achievement-linked insight: shows average salary of users with a similar achievement score (±50% range)

### Language Settings
- Multi-language UI support: English, Hebrew (עברית), and Amharic (አማርኛ)
- Language preference stored per-user via React context
- Switchable from the dedicated Settings page without affecting profile data

---

## Tech Stack

| Layer    | Technology                                       |
|----------|--------------------------------------------------|
| Frontend | Next.js 14 (App Router), React, TypeScript       |
| Backend  | Next.js API Routes                               |
| Database | Supabase (PostgreSQL)                            |
| Auth     | Supabase Auth (cookie-based sessions)            |
| Security | Row Level Security (RLS), SECURITY DEFINER RPCs  |
| Styling  | Tailwind CSS                                     |

---

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait ~1 minute for initialization

### 2. Run Database Schema

Open the **SQL Editor** in your Supabase dashboard and run these files **in order**:

| Order | File | Purpose |
|-------|------|---------|
| 1 | `supabase/schema.sql` | Core tables: profiles, ratings, friendships |
| 2 | `supabase/achievements_schema.sql` | Achievement types and scoring |
| 3 | `supabase/weighted_scoring_schema.sql` | Category weights and ranking logic |
| 4 | `supabase/salary_schema.sql` | Salary profiles, RLS, benchmark RPC functions |
| 5 | `supabase/public_figures_schema.sql` | Public figure profile support |
| 6 | `supabase/seed_public_figures.sql` | Seed data for public figures |
| 7 | `supabase/fix_public_figure_categories.sql` | *(optional)* Corrects achievement category assignments |

### 3. Get API Keys

In your Supabase project: **Settings → API**

Copy:
- **Project URL** — `https://your-project-id.supabase.co`
- **anon / public** key

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> `.env.local` is gitignored and must never be committed.

### 5. Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Routes

| Page            | Route               |
|-----------------|---------------------|
| Sign up         | `/signup`           |
| Login           | `/login`            |
| Dashboard       | `/dashboard`        |
| Profile         | `/profile/[id]`     |
| Edit profile    | `/profile/edit`     |
| Friends         | `/friends`          |
| Achievements    | `/achievements`     |
| Compare & Rank  | `/compare`          |
| Salary Insights | `/salary`           |
| Settings        | `/settings`         |

---

## Folder Structure

```
rateme/
├── app/
│   ├── (auth)/          → login & signup pages
│   ├── (app)/           → protected app pages
│   ├── api/             → server-side API routes
│   └── LanguageContext.tsx
├── components/          → shared UI components
├── contexts/            → React context providers
├── lib/
│   ├── supabase/        → Supabase client (server + browser)
│   ├── salary.ts        → salary field/currency/country constants
│   └── achievements.ts
├── types/               → shared TypeScript types
├── supabase/            → SQL schema and seed files
├── screenshots/         → portfolio screenshots
└── middleware.ts        → route protection (redirects unauthenticated users)
```

---

## Security & Privacy

- **Row Level Security** on every table — users can only access their own data
- **Salary is private by default** — `is_private = true` on all new records
- **Anonymous benchmarking** — opt-in via `include_in_benchmarks`; salary is never exposed to other users
- **Minimum group threshold** — benchmarks require at least 5 matching users; results are hidden otherwise
- **SECURITY DEFINER functions** — aggregate queries run with elevated privileges inside Postgres; no raw salary rows are returned through the API
- **Server-side validation** on all POST routes — all inputs validated before reaching the database
- **No secrets in source** — `.env.local` is gitignored; only `NEXT_PUBLIC_*` keys are used client-side
