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

## How to run

- `npm run dev` — local dev server at http://localhost:3000
- `npm run build` — production build (also runs TypeScript + ESLint checks)
- Stack installed: Next.js 16.4.6, React 19.3, Tailwind v4, App Router, `src/` dir, `@/*` alias.

## Status

- **Phase 1 — Foundation ✅ (2026-11-12)**: Next.js + TS + Tailwind scaffolded; mobile-first
  landing placeholder; iOS Safari metadata/viewport; git initialized; first commit made;
  build + dev server verified. Not yet deployed to Vercel.
- **Current focus: personal use only.** Multi-user/public is a possible future step — keep the
  data model user-keyed so it stays easy, but do not build onboarding/payments/landing yet.
- **Phase 2 — Accounts (code ✅, 2026-11-12)**: Supabase packages installed; browser/server
  clients (`src/lib/supabase/`); session refresh + route guard via `src/proxy.ts` (Next 16
  renamed `middleware`→`proxy`); email/password login+signup at `/login`; auth callback &
  signout routes; protected home. Schema in `supabase/schema.sql` (tables + RLS). Build green.
  - **Note:** `cacheComponents`/`partialPrefetching` disabled in `next.config.ts` so cookie-based
    auth pages render dynamically without extra Suspense/cache boilerplate.
  - **User action still required** before login works: follow `docs/PHASE2-SETUP.md` — create the
    Supabase project, run the schema SQL, and paste URL + anon key into `.env.local`.
- **Phases 3–6 — Core app (code ✅, 2026-11-12)**: all feature code complete and building green.
  - **Routing**: authenticated pages live under the `src/app/(app)/` route group, which has a
    layout enforcing login + a bottom `Nav` (`src/components/nav.tsx`). `/login` stays outside it.
  - **Phase 3**: exercises CRUD (`(app)/exercises`), workout days + day-detail with add/remove
    exercises (`(app)/days`, `(app)/days/[id]`). Mutations via Server Actions (`actions.ts` files).
  - **Phase 4**: logging at `(app)/log/[dayId]` — server page pre-fills from the last session;
    interactive client form `src/components/log-form.tsx`; `saveWorkout` creates a session + sets.
  - **Phase 5**: history list/detail (`(app)/history`), progress charts (`(app)/progress`) using
    Recharts (`src/components/exercise-chart.tsx`, `exercise-picker.tsx`) — top weight per day.
  - **Phase 6 (PWA)**: `src/app/icon.tsx`, `apple-icon.tsx` (generated via `next/og`),
    `src/app/manifest.ts`, and `appleWebApp` metadata for iOS "Add to Home Screen".
- **Still required from the user before anything runs**: do `docs/PHASE2-SETUP.md` (create Supabase
  project, run `supabase/schema.sql`, fill `.env.local`). Then deploy to Vercel (set the same two
  env vars in the Vercel project) to get an iPhone-reachable URL.
- **Next up — Phase 7 (Deploy)**: push to GitHub (done after this), then connect Vercel.
