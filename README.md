# RateMe — Setup Guide

## Prerequisites

- Node.js 18+ installed (`node -v` to check)
- A free [Supabase](https://supabase.com) account

---

## Step 1 — Create Supabase Project

1. Go to https://supabase.com and sign up / log in
2. Click **New Project**, give it a name (e.g. "rateme"), set a database password
3. Wait ~1 minute for the project to initialize

---

## Step 2 — Run the Database Schema

1. In your Supabase project dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/schema.sql` from this project
4. Paste the entire contents into the SQL editor
5. Click **Run** — you should see "Success"

---

## Step 3 — Get Your API Keys

1. In your Supabase project, go to **Project Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (long JWT string)

---

## Step 4 — Configure Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 5 — Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it will redirect you to the login page.

---

## What's Built

| Feature | Where |
|---|---|
| Sign up / Log in | `/signup`, `/login` |
| View your profile | `/profile/[your-id]` |
| Edit bio & name | `/profile/edit` |
| Find & add friends | `/friends` |
| Accept / decline requests | `/dashboard` or `/friends` |
| Rate a friend (1–5, 4 categories) | `/profile/[friend-id]` |
| View average score breakdown | `/profile/[any-id]` |
| Report an abusive rating | Your own profile page |

---

## Folder Structure

```
rateme/
├── app/
│   ├── (auth)/          ← login & signup pages
│   ├── (app)/           ← protected pages (dashboard, profile, friends)
│   └── api/             ← REST API routes
├── components/          ← reusable UI components
├── lib/supabase/        ← Supabase client setup
├── types/               ← shared TypeScript types
├── supabase/
│   └── schema.sql       ← paste this into Supabase SQL Editor
└── middleware.ts        ← route protection
```

---

## Safety Rules Implemented

- Only accepted friends can rate each other (enforced in API)
- No anonymous ratings — rater identity always stored and shown
- Users can report ratings on their own profile
- Duplicate reports are blocked
- SQL check constraints ensure scores are always 1–5
- Row Level Security (RLS) prevents unauthorized database access
