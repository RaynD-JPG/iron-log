import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type SessionRow = {
  id: string;
  performed_at: string;
  workout_day: { name: string } | null;
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_sessions")
    .select("id, performed_at, workout_day:workout_days(name)")
    .order("performed_at", { ascending: false });

  const sessions = (data ?? []) as unknown as SessionRow[];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="mt-1 text-sm text-zinc-500">Every workout you&apos;ve logged.</p>
      </header>

      {sessions.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No workouts yet. Start one from the{" "}
          <Link href="/" className="text-emerald-400">
            home screen
          </Link>
          .
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sessions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/history/${s.id}`}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-4 hover:border-zinc-700"
              >
                <div>
                  <p className="font-semibold">
                    {s.workout_day?.name ?? "Workout"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(s.performed_at).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-zinc-500">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
