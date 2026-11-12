"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createExerciseInDay,
  addExistingExerciseToDay,
} from "@/app/(app)/days/actions";
import type { Exercise } from "@/lib/types";

export default function AddExerciseToDay({
  dayId,
  available,
}: {
  dayId: string;
  available: Exercise[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [machine, setMachine] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function flashAdded(label: string) {
    setAdded(label);
    setTimeout(() => setAdded(null), 2500);
  }

  function submitNew(e: React.FormEvent) {
    e.preventDefault();
    if (isPending || !name.trim()) return; // prevent double-submit
    setError(null);
    const label = name.trim();
    startTransition(async () => {
      const res = await createExerciseInDay(dayId, name, machine);
      if (res.ok) {
        setName("");
        setMachine("");
        flashAdded(label);
        router.refresh();
      } else {
        setError(res.error ?? "Could not add exercise.");
      }
    });
  }

  function addExisting(exerciseId: string, label: string) {
    if (isPending || !exerciseId) return;
    setError(null);
    startTransition(async () => {
      const res = await addExistingExerciseToDay(dayId, exerciseId);
      if (res.ok) {
        flashAdded(label);
        router.refresh();
      } else {
        setError(res.error ?? "Could not add exercise.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={submitNew}
        className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New exercise (e.g. Bench Press)"
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-base outline-none focus:border-emerald-500"
        />
        <input
          value={machine}
          onChange={(e) => setMachine(e.target.value)}
          placeholder="Machine / equipment (optional)"
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-base outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add to this day"}
        </button>
        {added && (
          <p className="text-sm font-medium text-emerald-400">
            ✓ Added {added}
          </p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      {available.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Or reuse one you already made
          </p>
          <div className="flex flex-wrap gap-2">
            {available.map((ex) => (
              <button
                key={ex.id}
                type="button"
                disabled={isPending}
                onClick={() => addExisting(ex.id, ex.name)}
                className="rounded-full border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-50"
              >
                + {ex.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
