import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export interface QuickAuditCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface QuickAuditResult {
  domain: string;
  score: number;
  checks: QuickAuditCheck[];
  unreachable?: boolean;
}

const FETCH_TIMEOUT_MS = 6000;
const MAX_BODY_BYTES = 2_000_000;

// Evita SSRF: nunca dejamos que el servidor haga fetch a IPs privadas/locales
// aunque el usuario introduzca "localhost" o una IP interna como "dominio".
function isPrivateAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) {
    const [a, b] = address.split(".").map(Number);
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    return false;
  }
  if (version === 6) {
    const lower = address.toLowerCase();
    return lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80");
  }
  return true;
}

async function safeFetchHtml(url: string): Promise<{ html: string; usedUrl: string } | null> {
  const hostname = new URL(url).hostname;

  try {
    const { address } = await lookup(hostname);
    if (isPrivateAddress(address)) return null;
  } catch {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "GrowthOS-QuickAudit/1.0" },
    });
    if (!res.ok || !res.body) return null;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let html = "";
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) break;
      html += decoder.decode(value, { stream: true });
    }
    return { html, usedUrl: res.url };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractTag(html: string, regex: RegExp): string | null {
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

export async function runQuickAudit(domain: string): Promise<QuickAuditResult> {
  const httpsResult = await safeFetchHtml(`https://${domain}`);
  const result = httpsResult ?? (await safeFetchHtml(`http://${domain}`));

  if (!result) {
    return {
      domain,
      score: 0,
      unreachable: true,
      checks: [],
    };
  }

  const hasSsl = httpsResult !== null;
  const title = extractTag(result.html, /<title[^>]*>([^<]*)<\/title>/i);
  const description = extractTag(
    result.html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
  );
  const hasH1 = /<h1[^>]*>[^<]+<\/h1>/i.test(result.html);
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(result.html);

  const checks: QuickAuditCheck[] = [
    {
      id: "ssl",
      label: "Conexión segura (SSL)",
      passed: hasSsl,
      detail: hasSsl
        ? "Tu web funciona con conexión segura, lo que da confianza a tus clientes."
        : "Tu web no responde de forma segura (https). Los navegadores avisan a los visitantes de esto.",
    },
    {
      id: "title",
      label: "Título de la página",
      passed: Boolean(title && title.length >= 10 && title.length <= 65),
      detail: title
        ? `Título actual: "${title}"`
        : "No encontramos un título claro. Google lo usa como primera impresión de tu negocio.",
    },
    {
      id: "description",
      label: "Descripción para buscadores",
      passed: Boolean(description && description.length >= 50),
      detail: description
        ? "Tienes una descripción que Google puede mostrar en los resultados de búsqueda."
        : "Falta una descripción que explique tu negocio en los resultados de Google.",
    },
    {
      id: "h1",
      label: "Encabezado principal",
      passed: hasH1,
      detail: hasH1
        ? "Tu página tiene un encabezado principal claro."
        : "No encontramos un encabezado principal que resuma de qué trata tu página.",
    },
    {
      id: "mobile",
      label: "Adaptada a móvil",
      passed: hasViewport,
      detail: hasViewport
        ? "Tu web está preparada para verse bien en el móvil."
        : "Tu web podría no verse bien en el móvil, donde llegan la mayoría de tus clientes.",
    },
  ];

  const score = Math.round((checks.filter((c) => c.passed).length / checks.length) * 100);

  return { domain, score, checks };
}

export function growthPotentialLabel(score: number): string {
  return score < 70 ? "Alto" : "Medio";
}
