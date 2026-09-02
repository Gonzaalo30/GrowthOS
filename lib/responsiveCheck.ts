import type { QuickAuditCheck } from "@/lib/quickAudit";

const NAV_TIMEOUT_MS = 20_000;
// Pequeño margen de tolerancia (barras de scroll, redondeos de sub-píxel).
const OVERFLOW_TOLERANCE_PX = 4;

const BREAKPOINTS = {
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

async function launchBrowser() {
  const chromium = (await import("@sparticuz/chromium")).default;
  const { launch } = await import("puppeteer-core");
  const executablePath = await chromium.executablePath();
  // El viewport real se fija por página con `page.setViewport()` para cada
  // breakpoint, así que no hace falta uno por defecto aquí.
  return launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });
}

/**
 * Señal real e inequívoca de "esto no es responsive de verdad": la página se
 * desborda hacia los lados a este ancho. Nada de comparar capturas de
 * pantalla — eso sería mucho más frágil y no es lo que se pidió.
 */
async function hasNoHorizontalOverflow(
  browser: Awaited<ReturnType<typeof launchBrowser>>,
  url: string,
  breakpoint: Breakpoint,
): Promise<boolean> {
  const page = await browser.newPage();
  try {
    await page.setViewport(BREAKPOINTS[breakpoint]);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    return scrollWidth <= clientWidth + OVERFLOW_TOLERANCE_PX;
  } finally {
    await page.close();
  }
}

/**
 * Comprobación real de adaptabilidad a tablet y móvil, renderizando la
 * página de verdad con Puppeteer (no una suposición a partir de la etiqueta
 * viewport, que es lo que ya hace el análisis rápido). Si algo falla
 * (Puppeteer, red, timeout), devuelve un array vacío — un paso más de la
 * auditoría profunda que no aporta nada, no rompe el resto.
 */
export async function runResponsiveChecks(url: string): Promise<QuickAuditCheck[]> {
  let browser: Awaited<ReturnType<typeof launchBrowser>> | null = null;
  try {
    browser = await launchBrowser();
    const activeBrowser = browser;

    const [tabletOk, mobileOk] = await Promise.all([
      hasNoHorizontalOverflow(activeBrowser, url, "tablet").catch(() => null),
      hasNoHorizontalOverflow(activeBrowser, url, "mobile").catch(() => null),
    ]);

    const checks: QuickAuditCheck[] = [];
    if (tabletOk !== null) {
      checks.push({
        id: "responsive-tablet",
        label: "Adaptable a tablet",
        passed: tabletOk,
        detail: tabletOk
          ? "Comprobado de verdad: tu web se ve bien en tablet, sin desbordarse hacia los lados."
          : "En tablet tu web se desborda hacia los lados — algo no se adapta bien a este tamaño.",
        category: "velocidad",
      });
    }
    if (mobileOk !== null) {
      checks.push({
        id: "responsive-mobile",
        label: "Adaptable a móvil (comprobación real)",
        passed: mobileOk,
        detail: mobileOk
          ? "Comprobado de verdad: tu web se ve bien en móvil, sin desbordarse hacia los lados."
          : "En móvil tu web se desborda hacia los lados — algo no se adapta bien a este tamaño.",
        category: "velocidad",
      });
    }
    return checks;
  } catch {
    return [];
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
