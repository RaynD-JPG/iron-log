# CLAUDE.md

Guidance for Claude Code (and future me) when working in this repository.

## What this is

A personal **gym workout tracker**, shipped as a **web app (PWA)** — not a native iOS app — so it can run in Safari on iPhone and be added to the home screen (no Apple developer account required).

Core user flow:
1. Create an account (log in).
2. Define **exercises** (name + machine/equipment), private to each user.
3. Build **workout days** / splits (e.g. Push, Pull, Legs, Upper, Lower) by adding exercises to them.
4. Open a workout day at the gym, log **sets × reps × weight** for each exercise, and save it as a dated session.
5. Track **progress over time** with per-exercise charts.

Goal: make tracking gym progress easier, workout after workout.

## Decisions (locked in)

- **Logging granularity:** sets × reps × weight per exercise (e.g. 3×8 @ 185).
- **Offline:** NOT required for now — online-only. (Simplifies everything; can add caching later without data-model changes.)
- **Progress view:** charts of progress over time. No PR badges/alerts for now.
- **Exercises:** private per user (not a shared global library).
- **Scope:** personal use first, but designed so it can grow into a public multi-user product later. Build the personal version first; defer onboarding/payments/landing pages.
- **Hosting:** Vercel (free, auto-deploy from GitHub).
- **Developer:** comfortable coding.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database + Auth | Supabase (Postgres + Supabase Auth: email + Google) |
| Charts | Recharts |
| Hosting | Vercel |
| Code hosting | GitHub |
| Editor | VS Code / Cursor |

All chosen to be free to start and not need replacing when going public.

## Data model

```
User (Supabase Auth)
 └─ Exercise          name, machine/equipment, muscle_group, user_id
 └─ WorkoutDay        name (e.g. "Push"), user_id
      └─ DayExercise  links an Exercise into a WorkoutDay (ordered)
 └─ WorkoutSession    a dated instance of performing a WorkoutDay
      └─ SetEntry     session_id, exercise_id, set_number, reps, weight
```

Key idea: **WorkoutDay is a reusable template**; **WorkoutSession is one actual gym visit** where numbers get filled in. This separation enables weekly reuse of a split and charting one exercise across all sessions.

Everything is keyed by `user_id` with Supabase **Row-Level Security (RLS)** so each user only sees their own data — this makes the eventual multi-user/public step clean.

## Build phases

1. **Foundation** — Next.js + Tailwind scaffold; deploy an empty app to Vercel to prove the pipeline. Create Supabase project, tables, enable RLS.
2. **Accounts** — Supabase Auth (email + Google); protect pages behind login.
3. **Build splits** — CRUD for Exercises and Workout Days.
4. **Log a workout** (core loop) — open a day, enter sets/reps/weight, save a session. Pre-fill last session's numbers so only changes are edited.
5. **Progress** — history list + per-exercise charts (weight and estimated volume over time).
6. **iPhone polish** — PWA manifest + icon for "Add to Home Screen"; mobile-first layout with large tap targets.

Recommendation: actually use it at the gym after Phase 4 before building more.

## Conventions

- TypeScript throughout; prefer type safety over `any`.
- Mobile-first UI — this is used one-handed at the gym; big tap targets, minimal typing.
- Keep secrets (Supabase keys) in `.env.local`; never commit them. Use `NEXT_PUBLIC_` prefix only for the anon key / public URL.
- Match existing file style and structure when adding code.

## Status

Planning complete. No code scaffolded yet — next step is Phase 1.
