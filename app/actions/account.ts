"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner, updateBusiness } from "@/services/business.service";
import { updateProfileName } from "@/services/profile.service";
import { normalizeDomain } from "@/lib/utils";
import { BUSINESS_TYPES } from "@/lib/businessTypes";

export interface AccountState {
  error?: string;
  success?: boolean;
}

export async function updateProfileAction(
  _prevState: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre no puede estar vacío." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión ha caducado, inicia sesión de nuevo." };

  await updateProfileName(supabase, user.id, name);
  revalidatePath("/account");
  return { success: true };
}

export async function updateBusinessAction(
  _prevState: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const domain = normalizeDomain(String(formData.get("domain") ?? ""));
  const businessType = String(formData.get("businessType") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const companySize = String(formData.get("companySize") ?? "").trim();

  if (!domain || !businessType || !city || !companySize) {
    return { error: "Completa todos los campos." };
  }
  if (!(BUSINESS_TYPES as readonly string[]).includes(businessType)) {
    return { error: "Selecciona un tipo de negocio válido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión ha caducado, inicia sesión de nuevo." };

  const business = await getBusinessByOwner(supabase, user.id);
  if (!business) return { error: "No tienes un negocio asociado." };

  await updateBusiness(supabase, business.id, { domain, businessType, city, companySize });
  revalidatePath("/account");
  revalidatePath("/dashboard");
  return { success: true };
}
