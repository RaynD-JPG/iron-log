import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { WorkoutDay } from "@/lib/types";
import { createDayAndRedirect, deleteDay } from "./actions";

export default async function DaysPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_days")
    .select("*")
    .order("created_at");
  const days = (data ?? []) as WorkoutDay[];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Workout days</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Build your splits — Push, Pull, Legs, Upper, Lower…
        </p>
      </header>

      <form
        action={createDayAndRedirect}
        className="flex gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"
      >
        <input
          name="name"
          required
          placeholder="New day name (e.g. Push)"
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-base outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-zinc-950 hover:bg-emerald-400"
        >
          Add
        </button>
      </form>

      {days.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No days yet. Create one to start adding exercises.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {days.map((day) => (
            <li
              key={day.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
            >
              <Link href={`/days/${day.id}`} className="flex-1 font-semibold">
                {day.name}
              </Link>
              <div className="flex items-center gap-3">
                <Link
                  href={`/log/${day.id}`}
                  className="text-xs font-semibold text-emerald-400"
                >
                  Start
                </Link>
                <form action={deleteDay}>
                  <input type="hidden" name="id" value={day.id} />
                  <button
                    type="submit"
                    className="text-xs text-zinc-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
