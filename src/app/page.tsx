import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already guards this, but double-check for safety.
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col bg-zinc-950 text-zinc-50">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-10 px-6 py-16">
        <header className="flex flex-col gap-3">
          <span className="text-sm font-medium uppercase tracking-widest text-emerald-400">
            Gym Tracker
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            You&apos;re in. Let&apos;s lift.
          </h1>
          <p className="text-lg leading-relaxed text-zinc-400">
            Signed in as <span className="text-zinc-200">{user.email}</span>
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <Feature title="Your splits" desc="Push, Pull, Legs — build any routine you want." />
          <Feature title="Log fast" desc="Sets × reps × weight, pre-filled from last time." />
          <Feature title="See progress" desc="Charts of your lifts over weeks and months." />
        </section>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-500">
          <p className="font-medium text-zinc-300">Phase 2 — Accounts ✅</p>
          <p className="mt-1">
            Login &amp; database are wired up. Up next: building splits &amp; exercises.
          </p>
        </div>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-100"
          >
            Sign out
          </button>
        </form>
      </main>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-zinc-400">{desc}</p>
      </div>
    </div>
  );
}
