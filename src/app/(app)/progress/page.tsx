import { createClient } from "@/lib/supabase/server";
import type { Exercise } from "@/lib/types";
import ExercisePicker from "@/components/exercise-picker";
import ExerciseChart, { type ChartPoint } from "@/components/exercise-chart";

type EntryRow = {
  reps: number | null;
  weight: number | null;
  session: { performed_at: string } | null;
};

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ exercise?: string }>;
}) {
  const { exercise: selectedId } = await searchParams;
  const supabase = await createClient();

  const { data: exData } = await supabase
    .from("exercises")
    .select("*")
    .order("name");
  const exercises = (exData ?? []) as Exercise[];

  let points: ChartPoint[] = [];
  let selectedName: string | null = null;

  if (selectedId) {
    selectedName = exercises.find((e) => e.id === selectedId)?.name ?? null;

    const { data } = await supabase
      .from("set_entries")
      .select("reps, weight, session:workout_sessions(performed_at)")
      .eq("exercise_id", selectedId);
    const rows = (data ?? []) as unknown as EntryRow[];

    // Group by calendar day: top weight and total volume per session day.
    const byDay = new Map<string, { maxWeight: number; volume: number; ts: number }>();
    for (const r of rows) {
      if (!r.session?.performed_at) continue;
      const d = new Date(r.session.performed_at);
      const key = d.toISOString().slice(0, 10);
      const weight = r.weight ?? 0;
      const reps = r.reps ?? 0;
      const existing = byDay.get(key) ?? {
        maxWeight: 0,
        volume: 0,
        ts: d.getTime(),
      };
      existing.maxWeight = Math.max(existing.maxWeight, weight);
      existing.volume += weight * reps;
      byDay.set(key, existing);
    }

    points = [...byDay.entries()]
      .sort((a, b) => a[1].ts - b[1].ts)
      .map(([key, v]) => ({
        date: new Date(key).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        maxWeight: v.maxWeight,
        volume: Math.round(v.volume),
      }));
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Top weight per workout, over time.
        </p>
      </header>

      {exercises.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Add exercises and log workouts to see progress here.
        </p>
      ) : (
        <>
          <ExercisePicker options={exercises} selected={selectedId ?? null} />
          {selectedId ? (
            <div className="flex flex-col gap-3">
              {selectedName && (
                <h2 className="text-sm font-semibold text-zinc-300">
                  {selectedName}
                </h2>
              )}
              <ExerciseChart data={points} />
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              Pick an exercise to see its chart.
            </p>
          )}
        </>
      )}
    </div>
  );
}
