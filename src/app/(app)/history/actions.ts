"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function deleteSession(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  // set_entries are removed automatically via ON DELETE CASCADE.
  await supabase.from("workout_sessions").delete().eq("id", id);

  revalidatePath("/history");
  revalidatePath("/");
  redirect("/history");
}
