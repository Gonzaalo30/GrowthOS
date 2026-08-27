import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Solo páginas reales de marketing, indexables y con contenido propio —
// nada de rutas de la app (requieren sesión) ni páginas transaccionales
// (login/signup/verificar-2fa) ni /analisis (contenido dinámico por dominio,
// ver robots.ts).
const ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/precios", changeFrequency: "weekly", priority: 0.9 },
  { path: "/como-funciona", changeFrequency: "monthly", priority: 0.8 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.7 },
  { path: "/casos-de-exito", changeFrequency: "monthly", priority: 0.6 },
  { path: "/growth-sprint", changeFrequency: "monthly", priority: 0.6 },
  { path: "/plan-autopilot", changeFrequency: "monthly", priority: 0.6 },
  { path: "/plan-agencia", changeFrequency: "monthly", priority: 0.6 },
  { path: "/plan-personalizado", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contacto", changeFrequency: "yearly", priority: 0.4 },
  { path: "/aviso-legal", changeFrequency: "yearly", priority: 0.1 },
  { path: "/privacidad", changeFrequency: "yearly", priority: 0.1 },
  { path: "/terminos", changeFrequency: "yearly", priority: 0.1 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.1 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
