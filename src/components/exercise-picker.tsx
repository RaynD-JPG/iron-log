"use client";

import { useRouter } from "next/navigation";

type Option = { id: string; name: string };

export default function ExercisePicker({
  options,
  selected,
}: {
  options: Option[];
  selected: string | null;
}) {
  const router = useRouter();

  return (
    <select
      value={selected ?? ""}
      onChange={(e) => router.push(`/progress?exercise=${e.target.value}`)}
      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-base outline-none focus:border-emerald-500"
    >
      <option value="" disabled>
        Choose an exercise…
      </option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
}
