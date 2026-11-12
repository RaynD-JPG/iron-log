import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteSession } from "../actions";

type SessionRow = {
  id: string;
  performed_at: string;
  workout_day: { name: string } | null;
};

type EntryRow = {
  id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  exercise: { name: string; machine: string | null } | null;
};

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: sessionData } = await supabase
    .from("workout_sessions")
    .select("id, performed_at, workout_day:workout_days(name)")
    .eq("id", id)
    .single();
  if (!sessionData) notFound();
  const session = sessionData as unknown as SessionRow;

  const { data: entriesData } = await supabase
    .from("set_entries")
    .select("id, exercise_id, set_number, reps, weight, exercise:exercises(name, machine)")
    .eq("session_id", id)
    .order("set_number");
  const entries = (entriesData ?? []) as unknown as EntryRow[];

  // Group sets by exercise, preserving first-seen order.
  const groups = new Map<string, { name: string; machine: string | null; sets: EntryRow[] }>();
  for (const e of entries) {
    const key = e.exercise_id;
    if (!groups.has(key)) {
      groups.set(key, {
        name: e.exercise?.name ?? "Exercise",
        machine: e.exercise?.machine ?? null,
        sets: [],
      });
    }
    groups.get(key)!.sets.push(e);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link href="/history" className="text-xs text-zinc-500">
            ← History
          </Link>
          <h1 className="mt-1 text-2xl font-bold">
            {session.workout_day?.name ?? "Workout"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {new Date(session.performed_at).toLocaleString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      </header>

      {groups.size === 0 ? (
        <p className="text-sm text-zinc-500">No sets were logged in this session.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {[...groups.values()].map((g) => (
            <div
              key={g.name}
              className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
            >
              <p className="font-semibold">{g.name}</p>
              <div className="flex flex-col gap-1">
                {g.sets.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between text-sm text-zinc-300"
                  >
                    <span className="text-zinc-500">Set {s.set_number}</span>
                    <span>
                      {s.reps ?? "–"} reps
                      {s.weight !== null ? ` × ${s.weight}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <form action={deleteSession} className="pt-2">
        <input type="hidden" name="id" value={session.id} />
        <button
          type="submit"
          className="w-full rounded-lg border border-zinc-800 px-4 py-3 text-sm text-zinc-500 hover:border-red-900 hover:text-red-400"
        >
          Delete this workout
        </button>
      </form>
    </div>
  );
}
