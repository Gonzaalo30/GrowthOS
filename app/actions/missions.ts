"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { completeMission } from "@/services/mission.service";

export async function completeMissionAction(missionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticado");

  await completeMission(supabase, missionId);
  revalidatePath("/dashboard");
}
