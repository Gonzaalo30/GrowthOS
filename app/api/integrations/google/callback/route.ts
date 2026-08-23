import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { exchangeCodeForTokens } from "@/lib/googleApis";
import { saveInitialConnection } from "@/services/googleIntegration.service";

const STATE_COOKIE = "google_oauth_state";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const cookieStore = await cookies();
  const expectedNonce = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (errorParam) {
    return NextResponse.redirect(`${origin}/integraciones?error=cancelado`);
  }

  const [receivedNonce] = (state ?? "").split(".");
  if (!code || !state || !expectedNonce || receivedNonce !== expectedNonce) {
    return NextResponse.redirect(`${origin}/integraciones?error=estado_invalido`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  const business = await getBusinessByOwner(supabase, user.id);
  if (!business) return NextResponse.redirect(`${origin}/onboarding`);

  try {
    const { refreshToken, email } = await exchangeCodeForTokens(code);
    await saveInitialConnection(supabase, business.id, { googleEmail: email, refreshToken });
  } catch {
    return NextResponse.redirect(`${origin}/integraciones?error=conexion_fallida`);
  }

  return NextResponse.redirect(`${origin}/integraciones?connected=1`);
}
