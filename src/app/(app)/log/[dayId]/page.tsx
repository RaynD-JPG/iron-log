import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  WorkoutDay,
  DayExerciseWithExercise,
  SetEntry,
} from "@/lib/types";
import LogForm, { type LogExercise } from "@/components/log-form";

export default async function LogPage({
  params,
}: {
  params: Promise<{ dayId: string }>;
}) {
  const { dayId } = await params;
  const supabase = await createClient();

  const { data: dayData } = await supabase
    .from("workout_days")
    .select("*")
    .eq("id", dayId)
    .single();
  if (!dayData) notFound();
  const day = dayData as WorkoutDay;

  const { data: dayExData } = await supabase
    .from("day_exercises")
    .select("*, exercise:exercises(*)")
    .eq("workout_day_id", dayId)
    .order("position");
  const dayExercises = (dayExData ?? []) as DayExerciseWithExercise[];

  // Find the most recent prior session for this day to pre-fill numbers.
  const { data: lastSession } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("workout_day_id", dayId)
    .order("performed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let lastSets: SetEntry[] = [];
  if (lastSession?.id) {
    const { data } = await supabase
      .from("set_entries")
      .select("*")
      .eq("session_id", lastSession.id)
      .order("set_number");
    lastSets = (data ?? []) as SetEntry[];
  }

  const exercises: LogExercise[] = dayExercises.map((de) => {
    const prior = lastSets
      .filter((s) => s.exercise_id === de.exercise_id)
      .map((s) => ({
        reps: s.reps?.toString() ?? "",
        weight: s.weight?.toString() ?? "",
      }));
    return {
      exerciseId: de.exercise_id,
      name: de.exercise.name,
      machine: de.exercise.machine,
      sets: prior,
    };
  });

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/days" className="text-xs text-zinc-500">
          ← Days
        </Link>
        <h1 className="text-2xl font-bold">{day.name}</h1>
        <p className="text-sm text-zinc-500">
          This day has no exercises yet.
        </p>
        <Link
          href={`/days/${day.id}`}
          className="self-start rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950"
        >
          Add exercises →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href="/" className="text-xs text-zinc-500">
        ← Home
      </Link>
      <LogForm dayId={day.id} dayName={day.name} exercises={exercises} />
    </div>
  );
}
