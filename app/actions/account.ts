"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner, updateBusiness } from "@/services/business.service";
import { updateProfileName, updateAvatarUrl, updateDateFormat } from "@/services/profile.service";
import { uploadAvatar } from "@/services/avatar.service";
import { normalizeDomain } from "@/lib/utils";
import { BUSINESS_TYPES } from "@/lib/businessTypes";
import type { DateFormat } from "@/types/database.types";

export interface AccountState {
  error?: string;
  success?: boolean;
}

export async function updateProfileAction(
  _prevState: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const name = String(formData.get("name") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!name) return { error: "El nombre no puede estar vacío." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión ha caducado, inicia sesión de nuevo." };

  await updateProfileName(supabase, user.id, name, title || null);
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

export async function updateAvatarAction(_prevState: AccountState, formData: FormData): Promise<AccountState> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una imagen." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión ha caducado, inicia sesión de nuevo." };

  try {
    const avatarUrl = await uploadAvatar(supabase, user.id, file);
    await updateAvatarUrl(supabase, user.id, avatarUrl);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No hemos podido subir la imagen." };
  }

  revalidatePath("/account");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updatePasswordAction(_prevState: AccountState, formData: FormData): Promise<AccountState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión ha caducado, inicia sesión de nuevo." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "No hemos podido cambiar tu contraseña. Inténtalo de nuevo." };

  return { success: true };
}

export async function updateDateFormatAction(
  _prevState: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const dateFormat = String(formData.get("dateFormat") ?? "") as DateFormat;
  if (!["long", "short_dmy", "short_mdy"].includes(dateFormat)) {
    return { error: "Selecciona un formato válido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión ha caducado, inicia sesión de nuevo." };

  try {
    await updateDateFormat(supabase, user.id, dateFormat);
  } catch {
    return { error: "No hemos podido guardar la preferencia. Inténtalo de nuevo." };
  }

  revalidatePath("/account");
  revalidatePath("/dashboard");
  return { success: true };
}
