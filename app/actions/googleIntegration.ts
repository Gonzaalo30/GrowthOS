"use server";

import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness } from "@/services/business.service";
import { canUseGoogleIntegrations } from "@/lib/plans";
import { buildGoogleAuthUrl } from "@/lib/googleApis";
import * as googleIntegrationService from "@/services/googleIntegration.service";

const STATE_COOKIE = "google_oauth_state";

export interface GoogleIntegrationActionState {
  error?: string;
}

/**
 * Redirige al consentimiento real de Google. El nonce en una cookie httpOnly
 * es la protección estándar de OAuth contra fijación de estado (sin esto,
 * alguien podría colar su propio "code" en el callback de otra persona).
 */
export async function connectGoogleAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) redirect("/onboarding");
  if (!canUseGoogleIntegrations(business.plan)) redirect("/precios");

  const nonce = randomBytes(24).toString("hex");
  const state = `${nonce}.${business.id}`;

  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  let authUrl: string;
  try {
    authUrl = buildGoogleAuthUrl(state);
  } catch {
    redirect("/integraciones?error=no_configurado");
  }
  redirect(authUrl);
}

export async function selectSearchConsoleSiteAction(
  _prevState: GoogleIntegrationActionState,
  formData: FormData,
): Promise<GoogleIntegrationActionState> {
  const siteUrl = formData.get("siteUrl");
  if (typeof siteUrl !== "string" || !siteUrl) {
    return { error: "Elige un sitio de Search Console." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) redirect("/onboarding");

  try {
    await googleIntegrationService.selectSearchConsoleSite(supabase, business.id, siteUrl);
    const integration = await googleIntegrationService.getIntegration(supabase, business.id);
    if (integration) await googleIntegrationService.syncNow(supabase, business.id, integration);
  } catch {
    return { error: "No hemos podido guardar tu sitio o sincronizar los datos. Inténtalo de nuevo." };
  }

  redirect("/integraciones");
}

export async function selectAnalyticsPropertyAction(
  _prevState: GoogleIntegrationActionState,
  formData: FormData,
): Promise<GoogleIntegrationActionState> {
  const propertyId = formData.get("propertyId");
  const propertyName = formData.get("propertyName");
  if (typeof propertyId !== "string" || !propertyId) {
    return { error: "Elige una propiedad de Analytics." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) redirect("/onboarding");

  try {
    await googleIntegrationService.selectAnalyticsProperty(supabase, business.id, {
      propertyId,
      propertyName: typeof propertyName === "string" && propertyName ? propertyName : propertyId,
    });
    const integration = await googleIntegrationService.getIntegration(supabase, business.id);
    if (integration) await googleIntegrationService.syncNow(supabase, business.id, integration);
  } catch {
    return { error: "No hemos podido guardar tu propiedad o sincronizar los datos. Inténtalo de nuevo." };
  }

  redirect("/integraciones");
}

export async function clearSearchConsoleSiteAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) redirect("/onboarding");

  await googleIntegrationService.clearSearchConsoleSite(supabase, business.id);
  redirect("/integraciones");
}

export async function clearAnalyticsPropertyAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) redirect("/onboarding");

  await googleIntegrationService.clearAnalyticsProperty(supabase, business.id);
  redirect("/integraciones");
}

export async function refreshGoogleDataAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) redirect("/onboarding");

  const integration = await googleIntegrationService.getIntegration(supabase, business.id);
  if (integration) {
    try {
      await googleIntegrationService.syncNow(supabase, business.id, integration);
    } catch {
      redirect("/integraciones?error=sync_fallido");
    }
  }
  redirect("/integraciones");
}

export async function disconnectGoogleAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) redirect("/onboarding");

  await googleIntegrationService.disconnect(supabase, business.id);
  redirect("/integraciones");
}
