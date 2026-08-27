import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
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
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
