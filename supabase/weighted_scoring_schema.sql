-- =============================================
-- RateMe — Weighted Achievement Scoring
-- Run this in Supabase SQL Editor
-- =============================================

-- Add category and impact_level to achievements
ALTER TABLE achievements
  ADD COLUMN IF NOT EXISTS category text
    DEFAULT 'education' NOT NULL
    CHECK (category IN ('global_impact', 'technology', 'human_rights', 'sports', 'business', 'education')),
  ADD COLUMN IF NOT EXISTS impact_level integer
    DEFAULT 1 NOT NULL
    CHECK (impact_level BETWEEN 1 AND 5);

-- Existing user achievements keep their stored points.
-- New achievements use: points = category_weight × impact_level (computed in API).
-- Re-run seed_public_figures.sql to apply correct values for public figures.
