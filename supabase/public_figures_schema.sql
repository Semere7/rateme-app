-- =============================================
-- RateMe — Public Figure Profiles Schema
-- Run this BEFORE seed_public_figures.sql
-- =============================================

-- 1. Add profile_type column
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS profile_type text
  DEFAULT 'user' NOT NULL
  CHECK (profile_type IN ('user', 'public_figure'));

-- 2. Drop the FK constraint so public figure profiles can exist
--    without a corresponding auth.users row.
--    Real user sign-up still works via the handle_new_user() trigger.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 3. Recreate cascade-delete behaviour via a trigger so that when a
--    real auth user is deleted their profile is also removed.
CREATE OR REPLACE FUNCTION handle_auth_user_deleted()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id AND profile_type = 'user';
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_auth_user_deleted();

-- 4. Public figure achievements are inserted by the seed script using the
--    service role (bypasses RLS). No additional policy changes needed:
--    - achievements_select_all: anyone can read  ✓
--    - achievements_insert_own: auth.uid() = user_id — public figures have
--      no auth user so normal users can never insert for them  ✓
--    - achievements_delete_own: same guard  ✓
