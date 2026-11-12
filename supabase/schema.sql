-- Gym Tracker — database schema
-- Paste this whole file into the Supabase SQL Editor (Dashboard → SQL Editor → New query) and run it.
-- It is safe to re-run: it uses "if not exists" and recreates policies.

-- ============================================================
-- Tables
-- ============================================================

-- Exercises: private to each user (name + machine/equipment).
create table if not exists public.exercises (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null,
  machine       text,
  muscle_group  text,
  created_at    timestamptz not null default now()
);

-- Workout days / splits: reusable templates (e.g. "Push", "Pull", "Legs").
create table if not exists public.workout_days (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

-- Links an exercise into a workout day, with an order for display.
create table if not exists public.day_exercises (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  workout_day_id  uuid not null references public.workout_days (id) on delete cascade,
  exercise_id     uuid not null references public.exercises (id) on delete cascade,
  position        integer not null default 0,
  created_at      timestamptz not null default now()
);

-- A workout session: one actual gym visit performing a workout day.
create table if not exists public.workout_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  workout_day_id  uuid references public.workout_days (id) on delete set null,
  performed_at    timestamptz not null default now(),
  notes           text,
  created_at      timestamptz not null default now()
);

-- A single logged set within a session.
create table if not exists public.set_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  session_id  uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  set_number  integer not null,
  reps        integer,
  weight      numeric(6, 2),
  created_at  timestamptz not null default now()
);

-- Helpful indexes for common lookups.
create index if not exists idx_exercises_user          on public.exercises (user_id);
create index if not exists idx_workout_days_user       on public.workout_days (user_id);
create index if not exists idx_day_exercises_day       on public.day_exercises (workout_day_id);
create index if not exists idx_sessions_user_date      on public.workout_sessions (user_id, performed_at desc);
create index if not exists idx_set_entries_session     on public.set_entries (session_id);
create index if not exists idx_set_entries_exercise    on public.set_entries (exercise_id, created_at);

-- ============================================================
-- Row-Level Security: each user can only touch their own rows.
-- ============================================================

alter table public.exercises         enable row level security;
alter table public.workout_days      enable row level security;
alter table public.day_exercises     enable row level security;
alter table public.workout_sessions  enable row level security;
alter table public.set_entries       enable row level security;

-- One "owner" policy per table covers select/insert/update/delete.
do $$
declare
  t text;
begin
  foreach t in array array[
    'exercises', 'workout_days', 'day_exercises', 'workout_sessions', 'set_entries'
  ]
  loop
    execute format('drop policy if exists "owner_all" on public.%I;', t);
    execute format(
      'create policy "owner_all" on public.%I
         for all
         using (auth.uid() = user_id)
         with check (auth.uid() = user_id);', t);
  end loop;
end $$;
