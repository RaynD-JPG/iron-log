"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createDay(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("workout_days").insert({ user_id: user.id, name });
  revalidatePath("/days");
}

export async function deleteDay(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("workout_days").delete().eq("id", id);
  revalidatePath("/days");
}

export async function addExerciseToDay(formData: FormData) {
  const dayId = String(formData.get("day_id") ?? "");
  const exerciseId = String(formData.get("exercise_id") ?? "");
  if (!dayId || !exerciseId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Place the new exercise at the end of the list.
  const { count } = await supabase
    .from("day_exercises")
    .select("*", { count: "exact", head: true })
    .eq("workout_day_id", dayId);

  await supabase.from("day_exercises").insert({
    user_id: user.id,
    workout_day_id: dayId,
    exercise_id: exerciseId,
    position: count ?? 0,
  });

  revalidatePath(`/days/${dayId}`);
}

export async function removeExerciseFromDay(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const dayId = String(formData.get("day_id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("day_exercises").delete().eq("id", id);
  revalidatePath(`/days/${dayId}`);
}

export async function createDayAndRedirect(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from("workout_days")
    .insert({ user_id: user.id, name })
    .select("id")
    .single();

  revalidatePath("/days");
  if (data?.id) redirect(`/days/${data.id}`);
}
