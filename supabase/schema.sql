-- LearnGennie database schema for Supabase.
-- Run once: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to re-run.

-- 1) Tables -----------------------------------------------------------------

-- One row per user. Created automatically at signup by the trigger below.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null default '',
  email      text,
  created_at timestamptz not null default now()
);

-- One row per (user, course) the user has started.
-- course_id matches the course page file name, e.g. 'ai-ml' -> ai-ml.html
create table if not exists public.enrollments (
  user_id     uuid not null references auth.users (id) on delete cascade,
  course_id   text not null,
  enrolled_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- 2) Row Level Security: each user can only touch their own rows ------------

alter table public.profiles    enable row level security;
alter table public.enrollments enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "enrollments_select_own" on public.enrollments;
create policy "enrollments_select_own" on public.enrollments
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "enrollments_insert_own" on public.enrollments;
create policy "enrollments_insert_own" on public.enrollments
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "enrollments_delete_own" on public.enrollments;
create policy "enrollments_delete_own" on public.enrollments
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- 3) Create the profile row automatically when someone signs up -------------
-- (Done by a trigger so it works even when email confirmation is on and the
--  browser has no session yet.)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
