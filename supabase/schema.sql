-- =============================================
-- RateMe MVP - Full Database Schema
-- Paste this into Supabase SQL Editor and run it
-- =============================================

-- Profiles (linked to Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  full_name text not null,
  bio text default '',
  avatar_url text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Friendships
create table if not exists friendships (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references profiles(id) on delete cascade not null,
  addressee_id uuid references profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending' not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint no_self_friendship check (requester_id != addressee_id),
  unique(requester_id, addressee_id)
);

-- Ratings (one rating per pair, updatable)
create table if not exists ratings (
  id uuid default gen_random_uuid() primary key,
  rater_id uuid references profiles(id) on delete cascade not null,
  ratee_id uuid references profiles(id) on delete cascade not null,
  trust integer check (trust between 1 and 5) not null,
  communication integer check (communication between 1 and 5) not null,
  helpfulness integer check (helpfulness between 1 and 5) not null,
  respect integer check (respect between 1 and 5) not null,
  comment text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint no_self_rating check (rater_id != ratee_id),
  unique(rater_id, ratee_id)
);

-- Reports
create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references profiles(id) on delete cascade not null,
  rating_id uuid references ratings(id) on delete cascade not null,
  reason text not null,
  status text check (status in ('pending', 'reviewed', 'resolved')) default 'pending',
  created_at timestamptz default now()
);

-- =============================================
-- View: Average scores per user
-- =============================================
create or replace view user_scores as
select
  ratee_id as user_id,
  round(avg((trust::numeric + communication::numeric + helpfulness::numeric + respect::numeric) / 4.0), 1) as overall_score,
  round(avg(trust::numeric), 1) as trust_avg,
  round(avg(communication::numeric), 1) as communication_avg,
  round(avg(helpfulness::numeric), 1) as helpfulness_avg,
  round(avg(respect::numeric), 1) as respect_avg,
  count(*) as rating_count
from ratings
group by ratee_id;

-- =============================================
-- Auto-update timestamps trigger
-- =============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

drop trigger if exists friendships_updated_at on friendships;
create trigger friendships_updated_at
  before update on friendships
  for each row execute function update_updated_at();

drop trigger if exists ratings_updated_at on ratings;
create trigger ratings_updated_at
  before update on ratings
  for each row execute function update_updated_at();

-- =============================================
-- Row Level Security (RLS)
-- =============================================
alter table profiles enable row level security;
alter table friendships enable row level security;
alter table ratings enable row level security;
alter table reports enable row level security;

-- Profiles: anyone can read, only owner can insert/update
drop policy if exists "profiles_select_all" on profiles;
create policy "profiles_select_all" on profiles for select using (true);

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Friendships: only participants can see their own friendships
drop policy if exists "friendships_select" on friendships;
create policy "friendships_select" on friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "friendships_insert" on friendships;
create policy "friendships_insert" on friendships for insert
  with check (auth.uid() = requester_id);

drop policy if exists "friendships_update" on friendships;
create policy "friendships_update" on friendships for update
  using (auth.uid() = addressee_id);

-- Ratings: public read, only rater can write
drop policy if exists "ratings_select_all" on ratings;
create policy "ratings_select_all" on ratings for select using (true);

drop policy if exists "ratings_insert" on ratings;
create policy "ratings_insert" on ratings for insert
  with check (auth.uid() = rater_id);

drop policy if exists "ratings_update_own" on ratings;
create policy "ratings_update_own" on ratings for update
  using (auth.uid() = rater_id);

-- Reports: reporter can insert and view their own reports
drop policy if exists "reports_insert" on reports;
create policy "reports_insert" on reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "reports_select_own" on reports;
create policy "reports_select_own" on reports for select
  using (auth.uid() = reporter_id);

-- =============================================
-- Grants: allow anon + authenticated roles to access tables
-- (Required when tables are created via SQL Editor)
-- =============================================
grant usage on schema public to anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

grant select on public.friendships to authenticated;
grant insert, update on public.friendships to authenticated;

grant select on public.ratings to anon, authenticated;
grant insert, update on public.ratings to authenticated;

grant select, insert on public.reports to authenticated;

grant select on public.user_scores to anon, authenticated;
