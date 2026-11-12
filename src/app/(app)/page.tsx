import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { WorkoutDay, WorkoutSession } from "@/lib/types";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: days }, { data: recent }] = await Promise.all([
    supabase.from("workout_days").select("*").order("created_at"),
    supabase
      .from("workout_sessions")
      .select("*")
      .order("performed_at", { ascending: false })
      .limit(3),
  ]);

  const workoutDays = (days ?? []) as WorkoutDay[];
  const recentSessions = (recent ?? []) as WorkoutSession[];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-medium uppercase tracking-widest text-emerald-400">
            Gym Tracker
          </span>
          <h1 className="mt-1 text-2xl font-bold">Ready to train?</h1>
          <p className="mt-1 text-sm text-zinc-500">{user?.email}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
          >
            Sign out
          </button>
        </form>
      </header>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Start a workout
          </h2>
          <Link href="/days" className="text-xs font-medium text-emerald-400">
            Manage days
          </Link>
        </div>

        {workoutDays.length === 0 ? (
          <EmptyCard
            text="No workout days yet."
            cta="Create your first day"
            href="/days"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {workoutDays.map((day) => (
              <Link
                key={day.id}
                href={`/log/${day.id}`}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 transition-colors hover:border-emerald-600"
              >
                <span className="font-semibold">{day.name}</span>
                <span className="rounded-lg bg-emerald-500 px-3 py-1 text-sm font-semibold text-zinc-950">
                  Start →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Recent
          </h2>
          <Link href="/history" className="text-xs font-medium text-emerald-400">
            All history
          </Link>
        </div>
        {recentSessions.length === 0 ? (
          <p className="text-sm text-zinc-500">No workouts logged yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentSessions.map((s) => (
              <Link
                key={s.id}
                href={`/history/${s.id}`}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm hover:border-zinc-700"
              >
                <span className="text-zinc-300">
                  {new Date(s.performed_at).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-zinc-500">View →</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyCard({
  text,
  cta,
  href,
}: {
  text: string;
  cta: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 px-4 py-8 text-center"
    >
      <span className="text-sm text-zinc-500">{text}</span>
      <span className="text-sm font-semibold text-emerald-400">{cta} →</span>
    </Link>
  );
}
