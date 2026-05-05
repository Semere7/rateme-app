-- ── Remove verification flow ──────────────────────────────────────────────────
-- Achievements are self-reported and count immediately.
-- Run in Supabase SQL Editor. Safe to re-run.

-- 1. Mark any lingering 'pending' or 'rejected' achievements as 'verified'
UPDATE public.achievements
  SET verification_status = 'verified'
  WHERE verification_status != 'verified';

-- 2. Change column default so new rows are always 'verified'
ALTER TABLE public.achievements
  ALTER COLUMN verification_status SET DEFAULT 'verified';

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
