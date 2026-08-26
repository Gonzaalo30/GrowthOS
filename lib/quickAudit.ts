import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { ScoreCategory } from "@/lib/scoreCategories";

export interface QuickAuditCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
  category: ScoreCategory;
}

export interface QuickAuditResult {
  domain: string;
  score: number;
  checks: QuickAuditCheck[];
  unreachable?: boolean;
}

const FETCH_TIMEOUT_MS = 6000;
const LINK_CHECK_TIMEOUT_MS = 3000;
const MAX_BODY_BYTES = 2_000_000;
const MAX_LINKS_TO_CHECK = 5;
const SPEED_THRESHOLD_MS = 1500;

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

async function isSafeHost(url: string): Promise<boolean> {
  try {
    const hostname = new URL(url).hostname;
    const { address } = await lookup(hostname);
    return !isPrivateAddress(address);
  } catch {
    return false;
  }
}

async function safeFetchText(
  url: string,
): Promise<{ html: string; usedUrl: string; elapsedMs: number; headers: Headers } | null> {
  if (!(await isSafeHost(url))) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const startedAt = Date.now();

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
    return { html, usedUrl: res.url, elapsedMs: Date.now() - startedAt, headers: res.headers };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** true si http:// redirige de verdad a https:// (no solo si https responde por su cuenta). */
async function checkHttpsRedirect(domain: string): Promise<boolean> {
  const url = `http://${domain}`;
  if (!(await isSafeHost(url))) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LINK_CHECK_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "manual",
      headers: { "User-Agent": "GrowthOS-QuickAudit/1.0" },
    });
    if (res.status < 300 || res.status >= 400) return false;
    const location = res.headers.get("location") ?? "";
    return location.startsWith("https://");
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/** true = responde con 200. Usado para robots.txt / sitemap.xml, donde solo nos importa si existe. */
async function urlExists(url: string): Promise<boolean> {
  const result = await safeFetchText(url);
  return result !== null;
}

/** Comprueba una muestra de enlaces internos y devuelve cuántos responden con error. */
async function countBrokenLinks(links: string[]): Promise<number> {
  let broken = 0;
  await Promise.all(
    links.map(async (link) => {
      if (!(await isSafeHost(link))) return;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), LINK_CHECK_TIMEOUT_MS);
      try {
        const res = await fetch(link, {
          method: "HEAD",
          signal: controller.signal,
          redirect: "follow",
          headers: { "User-Agent": "GrowthOS-QuickAudit/1.0" },
        });
        if (res.status >= 400) broken++;
      } catch {
        // Fallo de red propio (timeout, DNS): no lo contamos como enlace roto del sitio.
      } finally {
        clearTimeout(timeout);
      }
    }),
  );
  return broken;
}

function extractInternalLinks(html: string, origin: string, limit: number): string[] {
  const hrefs = [...html.matchAll(/<a\s[^>]*href=["']([^"'#][^"']*)["']/gi)].map((m) => m[1]);
  const seen = new Set<string>();
  const links: string[] = [];

  for (const href of hrefs) {
    try {
      const url = new URL(href, origin);
      if (url.origin !== origin) continue;
      if (url.protocol !== "http:" && url.protocol !== "https:") continue;
      const key = url.toString();
      if (seen.has(key)) continue;
      seen.add(key);
      links.push(key);
      if (links.length >= limit) break;
    } catch {
      // href no parseable (javascript:, mailto:, etc.) — se ignora
    }
  }

  return links;
}

function extractTag(html: string, regex: RegExp): string | null {
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

const MAX_IMAGES_TO_SAMPLE = 8;

/** Heurística (no un Lighthouse real): entre una muestra de imágenes, ¿la mayoría declara ancho y alto? */
function mostImagesAreSized(html: string): boolean {
  const imgTags = [...html.matchAll(/<img\s[^>]*>/gi)].slice(0, MAX_IMAGES_TO_SAMPLE).map((m) => m[0]);
  if (imgTags.length === 0) return true;
  const sized = imgTags.filter((tag) => /\swidth=["']?\d/i.test(tag) && /\sheight=["']?\d/i.test(tag));
  return sized.length / imgTags.length >= 0.5;
}

/** Heurística: entre una muestra de imágenes, ¿la mayoría declara un texto alternativo no vacío? */
function mostImagesHaveAlt(html: string): boolean {
  const imgTags = [...html.matchAll(/<img\s[^>]*>/gi)].slice(0, MAX_IMAGES_TO_SAMPLE).map((m) => m[0]);
  if (imgTags.length === 0) return true;
  const withAlt = imgTags.filter((tag) => /\salt=["'][^"']+["']/i.test(tag));
  return withAlt.length / imgTags.length >= 0.5;
}

export async function runQuickAudit(domain: string): Promise<QuickAuditResult> {
  const httpsResult = await safeFetchText(`https://${domain}`);
  const result = httpsResult ?? (await safeFetchText(`http://${domain}`));

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
  const hasSchema = /<script[^>]+type=["']application\/ld\+json["']/i.test(result.html) || /itemscope/i.test(result.html);
  const hasFavicon = /<link[^>]+rel=["'](?:shortcut icon|icon)["']/i.test(result.html);
  const hasCompression = /\b(gzip|br)\b/i.test(result.headers.get("content-encoding") ?? "");
  const imagesSized = mostImagesAreSized(result.html);
  const imagesHaveAlt = mostImagesHaveAlt(result.html);
  const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(result.html);

  const origin = new URL(result.usedUrl).origin;
  const sampledLinks = extractInternalLinks(result.html, origin, MAX_LINKS_TO_CHECK);

  const [hasRobots, hasSitemap, brokenLinkCount, httpsRedirects] = await Promise.all([
    urlExists(`${origin}/robots.txt`),
    urlExists(`${origin}/sitemap.xml`),
    countBrokenLinks(sampledLinks),
    hasSsl ? checkHttpsRedirect(domain) : Promise.resolve(false),
  ]);

  const checks: QuickAuditCheck[] = [
    {
      id: "ssl",
      label: "Conexión segura (SSL)",
      passed: hasSsl,
      detail: hasSsl
        ? "Tu web funciona con conexión segura, lo que da confianza a tus clientes."
        : "Tu web no responde de forma segura (https). Los navegadores avisan a los visitantes de esto.",
      category: "confianza",
    },
    {
      id: "title",
      label: "Título de la página",
      passed: Boolean(title && title.length >= 10 && title.length <= 65),
      detail: title
        ? `Título actual: "${title}"`
        : "No encontramos un título claro. Google lo usa como primera impresión de tu negocio.",
      category: "seo",
    },
    {
      id: "description",
      label: "Descripción para buscadores",
      passed: Boolean(description && description.length >= 50),
      detail: description
        ? "Tienes una descripción que Google puede mostrar en los resultados de búsqueda."
        : "Falta una descripción que explique tu negocio en los resultados de Google.",
      category: "seo",
    },
    {
      id: "h1",
      label: "Encabezado principal",
      passed: hasH1,
      detail: hasH1
        ? "Tu página tiene un encabezado principal claro."
        : "No encontramos un encabezado principal que resuma de qué trata tu página.",
      category: "seo",
    },
    {
      id: "mobile",
      label: "Adaptada a móvil",
      passed: hasViewport,
      detail: hasViewport
        ? "Tu web está preparada para verse bien en el móvil."
        : "Tu web podría no verse bien en el móvil, donde llegan la mayoría de tus clientes.",
      category: "velocidad",
    },
    {
      id: "schema",
      label: "Datos estructurados (Schema)",
      passed: hasSchema,
      detail: hasSchema
        ? "Tu web incluye información estructurada que ayuda a Google a entenderla mejor."
        : "Google no encuentra información estructurada sobre tu negocio (nombre, dirección, horario).",
      category: "seo",
    },
    {
      id: "robots",
      label: "Archivo robots.txt",
      passed: hasRobots,
      detail: hasRobots
        ? "Tienes un archivo robots.txt que guía a los buscadores por tu web."
        : "No encontramos un archivo robots.txt. No es grave, pero ayuda a que Google rastree tu web mejor.",
      category: "seo",
    },
    {
      id: "sitemap",
      label: "Mapa del sitio (sitemap.xml)",
      passed: hasSitemap,
      detail: hasSitemap
        ? "Tienes un sitemap.xml que ayuda a Google a encontrar todas tus páginas."
        : "No encontramos un sitemap.xml. Sin él, Google puede tardar más en descubrir tus páginas.",
      category: "seo",
    },
    {
      id: "speed",
      label: "Velocidad de respuesta",
      passed: result.elapsedMs < SPEED_THRESHOLD_MS,
      detail:
        result.elapsedMs < SPEED_THRESHOLD_MS
          ? `Tu web respondió en ${result.elapsedMs} ms, un tiempo saludable.`
          : `Tu web tardó ${result.elapsedMs} ms en responder. Cuanto más tarde, más visitantes se van antes de verla.`,
      category: "velocidad",
    },
    {
      id: "brokenLinks",
      label: "Enlaces sin errores",
      passed: brokenLinkCount === 0,
      detail:
        brokenLinkCount === 0
          ? "Los enlaces que revisamos en tu página principal funcionan bien."
          : `Encontramos ${brokenLinkCount} ${brokenLinkCount === 1 ? "enlace roto" : "enlaces rotos"} en tu página principal.`,
      category: "confianza",
    },
    {
      id: "httpsRedirect",
      label: "HTTP redirige a HTTPS",
      passed: httpsRedirects,
      detail: httpsRedirects
        ? "Quien escriba tu web sin \"https\" llega igualmente a la versión segura."
        : "La versión sin \"https\" de tu web no redirige a la segura — algunos visitantes podrían quedarse en ella sin darse cuenta.",
      category: "confianza",
    },
    {
      id: "compression",
      label: "Compresión de contenido",
      passed: hasCompression,
      detail: hasCompression
        ? "Tu web comprime el contenido antes de enviarlo, lo que la hace cargar más rápido."
        : "Tu web no está comprimiendo el contenido (gzip/brotli) — activarlo suele acelerar la carga sin coste.",
      category: "velocidad",
    },
    {
      id: "favicon",
      label: "Favicon",
      passed: hasFavicon,
      detail: hasFavicon
        ? "Tu web declara un favicon — el icono que se ve en la pestaña del navegador."
        : "No encontramos un favicon declarado en tu web (algunos navegadores prueban /favicon.ico igualmente, pero es mejor declararlo).",
      category: "seo",
    },
    {
      id: "imageSizing",
      label: "Imágenes con tamaño definido",
      passed: imagesSized,
      detail: imagesSized
        ? "La mayoría de tus imágenes declaran su tamaño, así que no deberían provocar saltos al cargar la página."
        : "Varias imágenes no declaran ancho y alto — pueden hacer que el contenido \"salte\" mientras la página carga.",
      category: "velocidad",
    },
    {
      id: "canonical",
      label: "URL canónica",
      passed: hasCanonical,
      detail: hasCanonical
        ? "Tu página declara cuál es su URL canónica, evitando confundir a Google con contenido duplicado."
        : "No encontramos una URL canónica declarada — sin ella, Google puede repartir tu posicionamiento entre varias versiones de la misma página.",
      category: "seo",
    },
    {
      id: "imageAlt",
      label: "Texto alternativo en imágenes",
      passed: imagesHaveAlt,
      detail: imagesHaveAlt
        ? "La mayoría de tus imágenes tienen texto alternativo, lo que ayuda a Google y a la accesibilidad de tu web."
        : "Varias imágenes no tienen texto alternativo (\"alt\") — Google no puede entender qué muestran, y tampoco los lectores de pantalla.",
      category: "seo",
    },
  ];

  const score = Math.round((checks.filter((c) => c.passed).length / checks.length) * 100);

  return { domain, score, checks };
}

export function growthPotentialLabel(score: number): string {
  return score < 70 ? "Alto" : "Medio";
}
