import type { Metadata } from "next";

export const SITE_NAME = "GrowthOS";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://growth-os-smoky-eta.vercel.app";

/**
 * Metadata por página: título corto (el layout raíz añade " | GrowthOS" vía
 * `title.template`), descripción única, canonical, y Open Graph/Twitter
 * completos — hace falta repetirlos aquí porque Next.js NO combina el objeto
 * `openGraph` de una página con el del layout: si una página define el suyo,
 * sustituye al del padre entero (siteName, imagen, locale incluidos), no lo
 * completa. Ver `app/layout.tsx` para el porqué de esta decisión.
 */
export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "es_ES",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
