import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  WorkoutDay,
  Exercise,
  DayExerciseWithExercise,
} from "@/lib/types";
import { addExerciseToDay, removeExerciseFromDay } from "../actions";

export default async function DayDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: dayData } = await supabase
    .from("workout_days")
    .select("*")
    .eq("id", id)
    .single();

  if (!dayData) notFound();
  const day = dayData as WorkoutDay;

  const [{ data: dayExData }, { data: allExData }] = await Promise.all([
    supabase
      .from("day_exercises")
      .select("*, exercise:exercises(*)")
      .eq("workout_day_id", id)
      .order("position"),
    supabase.from("exercises").select("*").order("name"),
  ]);

  const dayExercises = (dayExData ?? []) as DayExerciseWithExercise[];
  const allExercises = (allExData ?? []) as Exercise[];

  const usedIds = new Set(dayExercises.map((de) => de.exercise_id));
  const available = allExercises.filter((ex) => !usedIds.has(ex.id));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link href="/days" className="text-xs text-zinc-500">
            ← Days
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{day.name}</h1>
        </div>
        {dayExercises.length > 0 && (
          <Link
            href={`/log/${day.id}`}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
          >
            Start →
          </Link>
        )}
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Exercises in this day
        </h2>
        {dayExercises.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No exercises yet. Add some below.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {dayExercises.map((de) => (
              <li
                key={de.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
              >
                <div>
                  <p className="font-semibold">{de.exercise.name}</p>
                  {de.exercise.machine && (
                    <p className="text-xs text-zinc-500">
                      {de.exercise.machine}
                    </p>
                  )}
                </div>
                <form action={removeExerciseFromDay}>
                  <input type="hidden" name="id" value={de.id} />
                  <input type="hidden" name="day_id" value={day.id} />
                  <button
                    type="submit"
                    className="text-xs text-zinc-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Add an exercise
        </h2>
        {allExercises.length === 0 ? (
          <p className="text-sm text-zinc-500">
            You have no exercises yet.{" "}
            <Link href="/exercises" className="text-emerald-400">
              Create some first →
            </Link>
          </p>
        ) : available.length === 0 ? (
          <p className="text-sm text-zinc-500">
            All your exercises are already in this day.
          </p>
        ) : (
          <form
            action={addExerciseToDay}
            className="flex gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"
          >
            <input type="hidden" name="day_id" value={day.id} />
            <select
              name="exercise_id"
              required
              defaultValue=""
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-base outline-none focus:border-emerald-500"
            >
              <option value="" disabled>
                Choose exercise…
              </option>
              {available.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-zinc-950 hover:bg-emerald-400"
            >
              Add
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
