"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDay } from "@/app/(app)/days/actions";

export default function DeleteDayButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (isPending) return;
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    startTransition(async () => {
      const res = await deleteDay(id);
      if (res.ok) router.refresh();
      else alert(res.error ?? "Could not delete.");
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-zinc-500 hover:text-red-400 disabled:opacity-50"
    >
      {isPending ? "…" : "Delete"}
    </button>
  );
}
