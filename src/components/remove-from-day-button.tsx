"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeDayExercise } from "@/app/(app)/days/actions";

export default function RemoveFromDayButton({
  id,
  dayId,
}: {
  id: string;
  dayId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    if (isPending) return;
    startTransition(async () => {
      const res = await removeDayExercise(id, dayId);
      if (res.ok) router.refresh();
      else alert(res.error ?? "Could not remove.");
    });
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isPending}
      className="text-xs text-zinc-500 hover:text-red-400 disabled:opacity-50"
    >
      {isPending ? "…" : "Remove"}
    </button>
  );
}
