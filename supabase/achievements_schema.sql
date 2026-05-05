-- =============================================
-- RateMe — Achievements Schema
-- Run this in the Supabase SQL Editor
-- =============================================

-- Achievements table
create table if not exists achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  achievement_type text not null check (achievement_type in (
    'high_school', 'bachelor', 'master', 'course', 'certification',
    'work_experience', 'military', 'volunteering', 'business'
  )),
  title text not null,
  description text default '',
  points integer not null check (points > 0),
  verification_status text
    check (verification_status in ('pending', 'verified', 'rejected'))
    default 'pending' not null,
  created_at timestamptz default now()
);

-- =============================================
-- View: total points per user (all achievements)
-- Ranking is based on total_points so the system
-- is functional before admin verification is set up.
-- Switch the ranking query to verified_points once
-- the admin approval flow is built.
-- =============================================
create or replace view achievement_scores as
select
  user_id,
  coalesce(sum(points), 0)::integer                                                   as total_points,
  coalesce(sum(case when verification_status = 'verified' then points else 0 end), 0)::integer as verified_points,
  count(*)::integer                                                                   as achievement_count,
  count(case when verification_status = 'verified' then 1 end)::integer              as verified_count
from achievements
group by user_id;

-- =============================================
-- Row Level Security
-- =============================================
alter table achievements enable row level security;

drop policy if exists "achievements_select_all" on achievements;
create policy "achievements_select_all" on achievements
  for select using (true);

drop policy if exists "achievements_insert_own" on achievements;
create policy "achievements_insert_own" on achievements
  for insert with check (auth.uid() = user_id);

drop policy if exists "achievements_delete_own" on achievements;
create policy "achievements_delete_own" on achievements
  for delete using (auth.uid() = user_id);

-- =============================================
-- Grants
-- =============================================
grant select on public.achievements to anon, authenticated;
grant insert, delete on public.achievements to authenticated;
grant select on public.achievement_scores to anon, authenticated;
