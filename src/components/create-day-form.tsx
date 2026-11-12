"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDay } from "@/app/(app)/days/actions";

export default function CreateDayForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending || !name.trim()) return; // guard against double-submit
    setError(null);
    startTransition(async () => {
      const res = await createDay(name);
      if (res.ok && res.id) {
        setName("");
        router.push(`/days/${res.id}`);
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"
    >
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New day name (e.g. Push)"
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-base outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
