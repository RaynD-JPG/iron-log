"use client";

import { useState, useTransition } from "react";
import { saveWorkout, type EntryInput } from "@/app/(app)/log/actions";

type SetRow = { reps: string; weight: string };

export type LogExercise = {
  exerciseId: string;
  name: string;
  machine: string | null;
  // Pre-filled sets from the last session (empty => one blank set).
  sets: SetRow[];
};

export default function LogForm({
  dayId,
  dayName,
  exercises,
}: {
  dayId: string;
  dayName: string;
  exercises: LogExercise[];
}) {
  const [state, setState] = useState<LogExercise[]>(
    exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.length > 0 ? ex.sets : [{ reps: "", weight: "" }],
    })),
  );
  const [isPending, startTransition] = useTransition();

  function updateSet(exIdx: number, setIdx: number, field: keyof SetRow, value: string) {
    setState((prev) =>
      prev.map((ex, i) =>
        i !== exIdx
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, j) =>
                j !== setIdx ? s : { ...s, [field]: value },
              ),
            },
      ),
    );
  }

  function addSet(exIdx: number) {
    setState((prev) =>
      prev.map((ex, i) =>
        i !== exIdx
          ? ex
          : { ...ex, sets: [...ex.sets, { reps: "", weight: "" }] },
      ),
    );
  }

  function removeSet(exIdx: number, setIdx: number) {
    setState((prev) =>
      prev.map((ex, i) =>
        i !== exIdx
          ? ex
          : { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) },
      ),
    );
  }

  function handleSave() {
    const entries: EntryInput[] = [];
    state.forEach((ex) => {
      ex.sets.forEach((s, idx) => {
        const reps = s.reps.trim() === "" ? null : Number(s.reps);
        const weight = s.weight.trim() === "" ? null : Number(s.weight);
        entries.push({
          exercise_id: ex.exerciseId,
          set_number: idx + 1,
          reps: Number.isFinite(reps as number) ? reps : null,
          weight: Number.isFinite(weight as number) ? weight : null,
        });
      });
    });
    startTransition(() => {
      saveWorkout(dayId, entries);
    });
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      <header>
        <h1 className="text-2xl font-bold">{dayName}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enter your sets. Last time&apos;s numbers are pre-filled.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {state.map((ex, exIdx) => (
          <div
            key={ex.exerciseId}
            className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div>
              <p className="font-semibold">{ex.name}</p>
              {ex.machine && (
                <p className="text-xs text-zinc-500">{ex.machine}</p>
              )}
            </div>

            <div className="flex items-center gap-2 px-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              <span className="w-8">Set</span>
              <span className="flex-1 text-center">Reps</span>
              <span className="flex-1 text-center">Weight</span>
              <span className="w-6" />
            </div>

            {ex.sets.map((s, setIdx) => (
              <div key={setIdx} className="flex items-center gap-2">
                <span className="w-8 text-center text-sm font-semibold text-zinc-400">
                  {setIdx + 1}
                </span>
                <input
                  inputMode="numeric"
                  value={s.reps}
                  onChange={(e) =>
                    updateSet(exIdx, setIdx, "reps", e.target.value)
                  }
                  placeholder="–"
                  className="w-full flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-center text-base outline-none focus:border-emerald-500"
                />
                <input
                  inputMode="decimal"
                  value={s.weight}
                  onChange={(e) =>
                    updateSet(exIdx, setIdx, "weight", e.target.value)
                  }
                  placeholder="–"
                  className="w-full flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-center text-base outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => removeSet(exIdx, setIdx)}
                  className="w-6 text-zinc-600 hover:text-red-400"
                  aria-label="Remove set"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addSet(exIdx)}
              className="self-start text-sm font-medium text-emerald-400 hover:underline"
            >
              + Add set
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="sticky bottom-4 rounded-xl bg-emerald-500 px-4 py-4 text-base font-bold text-zinc-950 shadow-lg hover:bg-emerald-400 disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Finish & save workout"}
      </button>
    </div>
  );
}
