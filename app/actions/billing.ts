"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { getStripe } from "@/lib/stripe";
import { updateBillingInfo } from "@/services/billing.service";
import { COUNTRIES } from "@/lib/countries";

export interface BillingFormState {
  error?: string;
  success?: boolean;
}

export async function updateBillingInfoAction(
  _prevState: BillingFormState,
  formData: FormData,
): Promise<BillingFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const taxId = String(formData.get("taxId") ?? "").trim();
  const addressLine1 = String(formData.get("addressLine1") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();

  if (!name || !addressLine1 || !city || !postalCode || !country) {
    return { error: "Completa nombre, dirección, ciudad, código postal y país." };
  }
  if (!COUNTRIES.some((c) => c.code === country)) {
    return { error: "Selecciona un país válido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión ha caducado, inicia sesión de nuevo." };

  const business = await getBusinessByOwner(supabase, user.id);
  if (!business?.stripe_customer_id) {
    return { error: "Todavía no tienes datos de facturación — se crean al suscribirte por primera vez." };
  }

  try {
    const stripe = getStripe();
    await updateBillingInfo(stripe, business.stripe_customer_id, {
      name,
      taxId,
      addressLine1,
      city,
      postalCode,
      country,
    });
  } catch {
    return { error: "No hemos podido guardar tus datos de facturación. Inténtalo de nuevo." };
  }

  revalidatePath("/account");
  return { success: true };
}
