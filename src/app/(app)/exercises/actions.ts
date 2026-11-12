"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createExercise(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const machine = String(formData.get("machine") ?? "").trim();
  const muscleGroup = String(formData.get("muscle_group") ?? "").trim();

  if (!name) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("exercises").insert({
    user_id: user.id,
    name,
    machine: machine || null,
    muscle_group: muscleGroup || null,
  });

  revalidatePath("/exercises");
}

export async function deleteExercise(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("exercises").delete().eq("id", id);

  revalidatePath("/exercises");
}
