import { NextResponse } from "next/server";

// Ruta de diagnóstico temporal — se borra en cuanto encontremos por qué
// triggerDeepAudit() no está consiguiendo que sus 4 pasos internos se
// disparen de verdad en producción. No toca ningún negocio real.
export async function GET() {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let selfFetchResult: unknown;
  try {
    const res = await fetch(`${origin}/api/deep-audit/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: "00000000-0000-0000-0000-000000000000", domain: "example.com" }),
    });
    selfFetchResult = { status: res.status, body: await res.text() };
  } catch (err) {
    selfFetchResult = { error: err instanceof Error ? err.message : String(err) };
  }

  return NextResponse.json({
    NEXT_PUBLIC_SITE_URL_raw: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    originUsed: origin,
    selfFetchResult,
  });
}
