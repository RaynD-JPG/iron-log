# Phase 2 setup — Supabase (one-time)

Do these steps once in your browser, then the app's login will work locally.

## 1. Create the Supabase project
1. Go to https://supabase.com and sign up / log in (free).
2. Click **New project**. Pick a name (e.g. `gym-tracker`), set a database password
   (save it somewhere), choose the region closest to you, and create it.
3. Wait ~1 minute for it to provision.

## 2. Create the database tables
1. In the project, open **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this repo, copy the whole file, paste it in, and click **Run**.
3. You should see "Success". This creates all tables and Row-Level Security.

## 3. Get your API keys
1. Go to **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL** and the **anon / public** key.
3. Paste them into `.env.local` in this repo:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

## 4. (Recommended for personal use) Turn off email confirmation
So you can sign up and use the app instantly without clicking an email link:
1. Go to **Authentication** → **Sign In / Providers** (or **Providers → Email**).
2. Disable **Confirm email**. Save.

> If you keep confirmation ON, after signing up you'll get an email with a link.
> For that link to work, add your URLs under **Authentication → URL Configuration**:
> Site URL `http://localhost:3000`, and later your Vercel URL.

## 5. Run it
```
npm run dev
```
Open http://localhost:3000 — you'll be redirected to `/login`. Sign up, and you're in.

---
The anon key is safe to expose in the browser (that's what Row-Level Security protects).
Never commit `.env.local` — it's gitignored.
