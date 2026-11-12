"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EntryInput = {
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
};

export async function saveWorkout(dayId: string, entries: EntryInput[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Create the session for this gym visit.
  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .insert({ user_id: user.id, workout_day_id: dayId })
    .select("id")
    .single();

  if (sessionError || !session) {
    throw new Error(sessionError?.message ?? "Could not create session");
  }

  // Keep only sets that have at least a weight or reps entered.
  const rows = entries
    .filter((e) => e.reps !== null || e.weight !== null)
    .map((e) => ({
      user_id: user.id,
      session_id: session.id,
      exercise_id: e.exercise_id,
      set_number: e.set_number,
      reps: e.reps,
      weight: e.weight,
    }));

  if (rows.length > 0) {
    const { error: entriesError } = await supabase
      .from("set_entries")
      .insert(rows);
    if (entriesError) throw new Error(entriesError.message);
  }

  revalidatePath("/history");
  revalidatePath("/");
  redirect(`/history/${session.id}`);
}
