import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness } from "@/services/business.service";
import { checkAndSaveSnapshot } from "@/services/pageSpeed.service";

// Lighthouse corre de verdad contra la web (móvil + escritorio en paralelo):
// puede tardar bastante más que el límite por defecto de una función.
export const maxDuration = 60;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No has iniciado sesión." }, { status: 401 });

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) return NextResponse.json({ error: "No tienes ningún negocio todavía." }, { status: 404 });

  try {
    const snapshot = await checkAndSaveSnapshot(supabase, business.id, business.domain);
    return NextResponse.json({ snapshot });
  } catch {
    return NextResponse.json(
      { error: "No hemos podido completar el análisis de velocidad. Inténtalo de nuevo en un momento." },
      { status: 502 },
    );
  }
}
