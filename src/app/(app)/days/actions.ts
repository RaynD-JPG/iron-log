"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; error?: string; id?: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createDay(name: string): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Enter a name." };

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data, error } = await supabase
    .from("workout_days")
    .insert({ user_id: user.id, name: trimmed })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/days");
  revalidatePath("/");
  return { ok: true, id: data.id };
}

export async function deleteDay(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Missing id." };
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase.from("workout_days").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/days");
  revalidatePath("/");
  return { ok: true };
}

// Create a brand-new exercise AND add it to this day in one step.
export async function createExerciseInDay(
  dayId: string,
  name: string,
  machine: string,
): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!dayId) return { ok: false, error: "Missing day." };
  if (!trimmed) return { ok: false, error: "Enter an exercise name." };

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: ex, error: exError } = await supabase
    .from("exercises")
    .insert({
      user_id: user.id,
      name: trimmed,
      machine: machine.trim() || null,
    })
    .select("id")
    .single();
  if (exError) return { ok: false, error: exError.message };

  const link = await addExistingExerciseToDay(dayId, ex.id);
  return link;
}

// Add an exercise you already created to this day.
export async function addExistingExerciseToDay(
  dayId: string,
  exerciseId: string,
): Promise<ActionResult> {
  if (!dayId || !exerciseId) return { ok: false, error: "Missing data." };
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { count } = await supabase
    .from("day_exercises")
    .select("*", { count: "exact", head: true })
    .eq("workout_day_id", dayId);

  const { error } = await supabase.from("day_exercises").insert({
    user_id: user.id,
    workout_day_id: dayId,
    exercise_id: exerciseId,
    position: count ?? 0,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/days/${dayId}`);
  return { ok: true };
}

// Rename / update an exercise. Applies everywhere the exercise is used.
export async function updateExercise(
  id: string,
  name: string,
  machine: string,
): Promise<ActionResult> {
  const trimmed = name.trim();
  if (!id) return { ok: false, error: "Missing id." };
  if (!trimmed) return { ok: false, error: "Enter a name." };

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("exercises")
    .update({ name: trimmed, machine: machine.trim() || null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/days", "layout");
  return { ok: true };
}

// Add several existing exercises to a day at once.
export async function addExistingExercisesToDay(
  dayId: string,
  exerciseIds: string[],
): Promise<ActionResult> {
  if (!dayId) return { ok: false, error: "Missing day." };
  if (!exerciseIds.length) return { ok: false, error: "Select at least one." };

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { count } = await supabase
    .from("day_exercises")
    .select("*", { count: "exact", head: true })
    .eq("workout_day_id", dayId);

  const start = count ?? 0;
  const rows = exerciseIds.map((exercise_id, i) => ({
    user_id: user.id,
    workout_day_id: dayId,
    exercise_id,
    position: start + i,
  }));

  const { error } = await supabase.from("day_exercises").insert(rows);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/days/${dayId}`);
  return { ok: true };
}

// Remove an exercise from a day (keeps the exercise itself + its history).
export async function removeDayExercise(
  id: string,
  dayId: string,
): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Missing id." };
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase.from("day_exercises").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/days/${dayId}`);
  return { ok: true };
}
