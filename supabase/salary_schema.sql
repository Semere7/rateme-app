-- =============================================
-- RateMe — Salary Profiles Schema
-- Run AFTER schema.sql
-- =============================================

CREATE TABLE IF NOT EXISTS public.salary_profiles (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  salary_min       numeric     NOT NULL CHECK (salary_min >= 0),
  salary_max       numeric     NOT NULL CHECK (salary_max >= salary_min),
  currency         text        NOT NULL DEFAULT 'ILS',
  field            text        NOT NULL,
  experience_level text        NOT NULL,
  country          text        NOT NULL,
  employment_type  text        NOT NULL,
  is_private       boolean     NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- ── New column: benchmark opt-in (safe to re-run) ───────────────────────────
ALTER TABLE public.salary_profiles
  ADD COLUMN IF NOT EXISTS include_in_benchmarks boolean NOT NULL DEFAULT true;

-- Migrate any pre-existing rows (no-op once DEFAULT is applied)
UPDATE public.salary_profiles SET include_in_benchmarks = true WHERE include_in_benchmarks IS NULL;

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.salary_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "salary_select_own" ON public.salary_profiles;
DROP POLICY IF EXISTS "salary_insert_own" ON public.salary_profiles;
DROP POLICY IF EXISTS "salary_update_own" ON public.salary_profiles;
DROP POLICY IF EXISTS "salary_delete_own" ON public.salary_profiles;

CREATE POLICY "salary_select_own"  ON public.salary_profiles FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "salary_insert_own"  ON public.salary_profiles FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "salary_update_own"  ON public.salary_profiles FOR UPDATE  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "salary_delete_own"  ON public.salary_profiles FOR DELETE  USING (auth.uid() = user_id);

-- ── Table-level grants ────────────────────────────────────────────────────────
-- RLS policies control which rows are visible, but the role must also have
-- table-level permission to query the table at all. Without this, Postgres
-- returns "permission denied for table salary_profiles" before RLS runs.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.salary_profiles TO authenticated;


-- ── Aggregated benchmark function (bypasses RLS) ─────────────────────────────
-- Returns aggregate salary stats + the requesting user's rank in the same pool.
-- Privacy: returns hidden=true if pool has fewer than 5 users.
-- Falls back progressively: exact → field+exp+country → field+exp → field → all.

CREATE OR REPLACE FUNCTION get_salary_benchmark(
  p_user_id          uuid,
  p_field            text    DEFAULT NULL,
  p_experience_level text    DEFAULT NULL,
  p_country          text    DEFAULT NULL,
  p_employment_type  text    DEFAULT NULL,
  p_currency         text    DEFAULT 'ILS'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count      bigint;
  v_my_mid     numeric;
  v_above      bigint := 0;
  v_scope      text;
  v_f  text; v_e text; v_c text; v_t text;
  v_result     json;
BEGIN
  -- User's own midpoint (may be NULL if no salary profile yet)
  SELECT (salary_min + salary_max) / 2.0
  INTO v_my_mid
  FROM salary_profiles WHERE user_id = p_user_id;

  -- ── Find narrowest scope with >= 5 users (only opt-in rows) ────────────
  IF p_field IS NOT NULL AND p_experience_level IS NOT NULL
     AND p_country IS NOT NULL AND p_employment_type IS NOT NULL THEN
    SELECT COUNT(*) INTO v_count FROM salary_profiles
    WHERE field = p_field AND experience_level = p_experience_level
      AND country = p_country AND employment_type = p_employment_type
      AND currency = p_currency AND include_in_benchmarks = true;
    IF v_count >= 5 THEN
      v_scope := 'exact';
      v_f := p_field; v_e := p_experience_level;
      v_c := p_country; v_t := p_employment_type;
    END IF;
  END IF;

  IF v_scope IS NULL AND p_field IS NOT NULL AND p_experience_level IS NOT NULL AND p_country IS NOT NULL THEN
    SELECT COUNT(*) INTO v_count FROM salary_profiles
    WHERE field = p_field AND experience_level = p_experience_level
      AND country = p_country AND currency = p_currency
      AND include_in_benchmarks = true;
    IF v_count >= 5 THEN
      v_scope := 'field_exp_country';
      v_f := p_field; v_e := p_experience_level; v_c := p_country;
    END IF;
  END IF;

  IF v_scope IS NULL AND p_field IS NOT NULL AND p_experience_level IS NOT NULL THEN
    SELECT COUNT(*) INTO v_count FROM salary_profiles
    WHERE field = p_field AND experience_level = p_experience_level
      AND currency = p_currency AND include_in_benchmarks = true;
    IF v_count >= 5 THEN
      v_scope := 'field_exp';
      v_f := p_field; v_e := p_experience_level;
    END IF;
  END IF;

  IF v_scope IS NULL AND p_field IS NOT NULL THEN
    SELECT COUNT(*) INTO v_count FROM salary_profiles
    WHERE field = p_field AND currency = p_currency
      AND include_in_benchmarks = true;
    IF v_count >= 5 THEN
      v_scope := 'field';
      v_f := p_field;
    END IF;
  END IF;

  IF v_scope IS NULL THEN
    SELECT COUNT(*) INTO v_count FROM salary_profiles
    WHERE currency = p_currency AND include_in_benchmarks = true;
    IF v_count >= 5 THEN
      v_scope := 'all';
    END IF;
  END IF;

  IF v_scope IS NULL THEN
    RETURN json_build_object('hidden', true, 'count', COALESCE(v_count, 0));
  END IF;

  -- ── Count how many in pool are above user's midpoint ───────────────────
  IF v_my_mid IS NOT NULL THEN
    SELECT COUNT(*) INTO v_above FROM salary_profiles
    WHERE (salary_min + salary_max) / 2.0 > v_my_mid
      AND (v_f IS NULL OR field            = v_f)
      AND (v_e IS NULL OR experience_level = v_e)
      AND (v_c IS NULL OR country          = v_c)
      AND (v_t IS NULL OR employment_type  = v_t)
      AND currency = p_currency AND include_in_benchmarks = true;
  END IF;

  -- ── Aggregate stats ─────────────────────────────────────────────────────
  SELECT json_build_object(
    'hidden',       false,
    'scope',        v_scope,
    'count',        v_count,
    'avg_midpoint', ROUND(AVG((salary_min + salary_max) / 2.0)::numeric, 0),
    'p10_midpoint', ROUND(PERCENTILE_CONT(0.10) WITHIN GROUP (ORDER BY (salary_min + salary_max) / 2.0)::numeric, 0),
    'p50_midpoint', ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY (salary_min + salary_max) / 2.0)::numeric, 0),
    'p90_midpoint', ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY (salary_min + salary_max) / 2.0)::numeric, 0),
    'my_midpoint',  v_my_mid,
    'my_rank',      CASE WHEN v_my_mid IS NOT NULL THEN v_above + 1 ELSE NULL END,
    'my_top_pct',   CASE WHEN v_my_mid IS NOT NULL
                         THEN CEIL(((v_above + 1)::numeric / v_count) * 100)
                         ELSE NULL END
  )
  INTO v_result
  FROM salary_profiles
  WHERE (v_f IS NULL OR field            = v_f)
    AND (v_e IS NULL OR experience_level = v_e)
    AND (v_c IS NULL OR country          = v_c)
    AND (v_t IS NULL OR employment_type  = v_t)
    AND currency = p_currency AND include_in_benchmarks = true;

  RETURN v_result;
END;
$$;

-- ── Achievement-based salary benchmark ───────────────────────────────────────
-- Returns average salary of users whose achievement score is within [p_min, p_max].
-- Privacy: hidden if fewer than 5 users match.

CREATE OR REPLACE FUNCTION get_achievement_salary_benchmark(
  p_min_points numeric,
  p_max_points numeric,
  p_currency   text DEFAULT 'ILS'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count  bigint;
  v_result json;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM salary_profiles sp
  JOIN achievement_scores acs ON acs.user_id = sp.user_id
  WHERE acs.total_points BETWEEN p_min_points AND p_max_points
    AND sp.currency = p_currency AND sp.include_in_benchmarks = true;

  IF v_count < 5 THEN
    RETURN json_build_object('hidden', true, 'count', v_count);
  END IF;

  SELECT json_build_object(
    'hidden',       false,
    'count',        v_count,
    'avg_midpoint', ROUND(AVG((sp.salary_min + sp.salary_max) / 2.0)::numeric, 0)
  )
  INTO v_result
  FROM salary_profiles sp
  JOIN achievement_scores acs ON acs.user_id = sp.user_id
  WHERE acs.total_points BETWEEN p_min_points AND p_max_points
    AND sp.currency = p_currency AND sp.include_in_benchmarks = true;

  RETURN v_result;
END;
$$;

-- ── Grant EXECUTE on both benchmark functions ─────────────────────────────────
-- Must come AFTER the CREATE OR REPLACE so it applies to the current definition.
-- Without this the PostgREST RPC call fails with "permission denied for function".
GRANT EXECUTE ON FUNCTION get_salary_benchmark(uuid, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_achievement_salary_benchmark(numeric, numeric, text)  TO authenticated;

NOTIFY pgrst, 'reload schema';
