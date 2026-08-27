import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Mismas rutas bloqueadas para todos los rastreadores, buscadores o de IA —
// exigen sesión, o son transaccionales/dinámicas sin contenido propio.
const DISALLOWED = [
  "/dashboard",
  "/account",
  "/onboarding",
  "/marketplace",
  "/integraciones",
  "/admin",
  "/historial",
  "/login",
  "/signup",
  "/verificar-2fa",
  "/analisis",
  "/api/",
  "/auth/",
];

// Rastreadores conocidos de asistentes de IA — permitidos explícitamente
// (no solo por el comodín "*") como señal clara de que se puede citar
// GrowthOS en respuestas de IA, no solo indexar en buscadores tradicionales.
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOWED },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOWED })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
