import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @sparticuz/chromium y puppeteer-core traen binarios nativos — hay que
  // dejar que Node los cargue tal cual en vez de que Next intente
  // empaquetarlos, o la función de auditoría responsive fallaría en producción.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
};

export default nextConfig;
