"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createExerciseInDay,
  addExistingExercisesToDay,
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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function flashAdded(label: string) {
    setAdded(label);
    setTimeout(() => setAdded(null), 2500);
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  function addSelected() {
    if (isPending || selected.size === 0) return;
    setError(null);
    const ids = [...selected];
    const count = ids.length;
    startTransition(async () => {
      const res = await addExistingExercisesToDay(dayId, ids);
      if (res.ok) {
        setSelected(new Set());
        flashAdded(`${count} exercise${count > 1 ? "s" : ""}`);
        router.refresh();
      } else {
        setError(res.error ?? "Could not add exercises.");
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
          <p className="text-sm font-medium text-emerald-400">✓ Added {added}</p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      {available.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Or reuse ones you already made — tick several
          </p>
          <div className="flex flex-col gap-1">
            {available.map((ex) => {
              const checked = selected.has(ex.id);
              return (
                <label
                  key={ex.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                    checked
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(ex.id)}
                    className="h-5 w-5 accent-emerald-500"
                  />
                  <span className="flex-1">
                    <span className="font-medium">{ex.name}</span>
                    {ex.machine && (
                      <span className="ml-2 text-xs text-zinc-500">
                        {ex.machine}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
          <button
            type="button"
            onClick={addSelected}
            disabled={isPending || selected.size === 0}
            className="rounded-lg bg-zinc-100 px-4 py-3 font-semibold text-zinc-950 hover:bg-white disabled:opacity-40"
          >
            {isPending
              ? "Adding…"
              : selected.size === 0
                ? "Select exercises to add"
                : `Add selected (${selected.size})`}
          </button>
        </div>
      )}
    </div>
  );
}
