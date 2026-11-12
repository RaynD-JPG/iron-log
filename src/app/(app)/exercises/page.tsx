import { createClient } from "@/lib/supabase/server";
import type { Exercise } from "@/lib/types";
import { createExercise, deleteExercise } from "./actions";

export default async function ExercisesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exercises")
    .select("*")
    .order("name");
  const exercises = (data ?? []) as Exercise[];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Exercises</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Your exercises and the machines they use.
        </p>
      </header>

      <form
        action={createExercise}
        className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
      >
        <input
          name="name"
          required
          placeholder="Exercise name (e.g. Bench Press)"
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-base outline-none focus:border-emerald-500"
        />
        <input
          name="machine"
          placeholder="Machine / equipment (optional)"
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-base outline-none focus:border-emerald-500"
        />
        <input
          name="muscle_group"
          placeholder="Muscle group (optional, e.g. Chest)"
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-base outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-zinc-950 hover:bg-emerald-400"
        >
          Add exercise
        </button>
      </form>

      {exercises.length === 0 ? (
        <p className="text-sm text-zinc-500">No exercises yet. Add one above.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {exercises.map((ex) => (
            <li
              key={ex.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
            >
              <div>
                <p className="font-semibold">{ex.name}</p>
                <p className="text-xs text-zinc-500">
                  {[ex.machine, ex.muscle_group].filter(Boolean).join(" · ") ||
                    "No machine set"}
                </p>
              </div>
              <form action={deleteExercise}>
                <input type="hidden" name="id" value={ex.id} />
                <button
                  type="submit"
                  className="rounded-lg px-2 py-1 text-xs text-zinc-500 hover:text-red-400"
                  aria-label={`Delete ${ex.name}`}
                >
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
