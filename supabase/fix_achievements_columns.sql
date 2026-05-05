-- ── Fix achievements columns ──────────────────────────────────────────────────
-- Run in Supabase SQL Editor.
-- Safe to re-run: all statements use IF NOT EXISTS / IF EXISTS guards.

-- 1. Add category column (with check constraint)
ALTER TABLE public.achievements
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'education';

ALTER TABLE public.achievements
  DROP CONSTRAINT IF EXISTS achievements_category_check;

ALTER TABLE public.achievements
  ADD CONSTRAINT achievements_category_check
  CHECK (category IN ('global_impact','technology','human_rights','sports','business','education'));

-- 2. Add impact_level column
ALTER TABLE public.achievements
  ADD COLUMN IF NOT EXISTS impact_level integer NOT NULL DEFAULT 1;

ALTER TABLE public.achievements
  DROP CONSTRAINT IF EXISTS achievements_impact_level_check;

ALTER TABLE public.achievements
  ADD CONSTRAINT achievements_impact_level_check
  CHECK (impact_level BETWEEN 1 AND 5);

-- 3. Ensure points column exists (it should already)
ALTER TABLE public.achievements
  ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 0;

-- 4. Reload PostgREST schema cache so new columns are visible immediately
NOTIFY pgrst, 'reload schema';
