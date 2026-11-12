"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeDayExercise, updateExercise } from "@/app/(app)/days/actions";

export default function DayExerciseItem({
  linkId,
  exerciseId,
  dayId,
  name,
  machine,
}: {
  linkId: string; // day_exercises row id
  exerciseId: string; // exercises row id
  dayId: string;
  name: string;
  machine: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editMachine, setEditMachine] = useState(machine ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    if (isPending || !editName.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await updateExercise(exerciseId, editName, editMachine);
      if (res.ok) {
        setEditing(false);
        router.refresh();
      } else {
        setError(res.error ?? "Could not save.");
      }
    });
  }

  function remove() {
    if (isPending) return;
    startTransition(async () => {
      const res = await removeDayExercise(linkId, dayId);
      if (res.ok) router.refresh();
      else alert(res.error ?? "Could not remove.");
    });
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-2 rounded-xl border border-emerald-600 bg-zinc-900/60 p-3">
        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Exercise name"
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-base outline-none focus:border-emerald-500"
        />
        <input
          value={editMachine}
          onChange={(e) => setEditMachine(e.target.value)}
          placeholder="Machine / equipment (optional)"
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-base outline-none focus:border-emerald-500"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={isPending || !editName.trim()}
            className="flex-1 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setEditName(name);
              setEditMachine(machine ?? "");
              setError(null);
            }}
            disabled={isPending}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-600"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-semibold">{name}</p>
        {machine && <p className="truncate text-xs text-zinc-500">{machine}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={isPending}
          className="text-xs text-zinc-400 hover:text-emerald-400 disabled:opacity-50"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={isPending}
          className="text-xs text-zinc-500 hover:text-red-400 disabled:opacity-50"
        >
          {isPending ? "…" : "Remove"}
        </button>
      </div>
    </li>
  );
}
