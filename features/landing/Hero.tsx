"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { normalizeDomain } from "@/lib/utils";
import { getHeroPreviewAction, type HeroPreview } from "@/app/actions/heroPreview";

const DEBOUNCE_MS = 900;

const TRUST_ITEMS = [
  {
    label: "30 segundos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    label: "Sin tarjeta",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
        <path strokeLinecap="round" d="M2.5 9.5h19M17 21.5l4-4m0 4l-4-4" />
      </svg>
    ),
  },
  {
    label: "Sin conocimientos técnicos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l-6-6 6-6M15 6l6 6-6 6" />
      </svg>
    ),
  },
];

export function Hero() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [preview, setPreview] = useState<HeroPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const clean = normalizeDomain(domain);
    if (!clean || !clean.includes(".") || clean.length < 4) {
      setPreview(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const currentRequestId = ++requestIdRef.current;

    const timer = setTimeout(async () => {
      const result = await getHeroPreviewAction(clean);
      if (requestIdRef.current !== currentRequestId) return;
      setPreview(result);
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [domain]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = normalizeDomain(domain);
    if (!clean) return;
    router.push(`/analisis?domain=${encodeURIComponent(clean)}`);
  }

  const showPreviewPanel = domain.trim().length > 0;

  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">
        Análisis gratuito en segundos
      </span>
      <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Descubre cuántas oportunidades está perdiendo tu negocio online
      </h1>
      <p className="mt-4 max-w-xl text-lg text-zinc-600">
        Sin tecnicismos. Te decimos exactamente qué hacer hoy para conseguir más clientes.
      </p>

      <div className="mt-10 flex w-full max-w-3xl flex-col items-center gap-4 md:flex-row md:items-start md:justify-center">
        <div className="flex w-full max-w-md flex-col gap-3">
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
            <Input
              type="text"
              required
              placeholder="tuclinica.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="whitespace-nowrap">
              Ver mi Growth Score
            </Button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 sm:justify-start">
            {TRUST_ITEMS.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1.5">
                {item.icon}
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full max-w-xs md:w-72">
          <AnimatePresence>
            {showPreviewPanel && (
              <motion.div
                key="panel"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-border bg-surface p-4 text-left shadow-sm"
              >
                {loading || !preview ? (
                  <div className="flex flex-col gap-2 animate-pulse">
                    <div className="h-3 w-24 rounded bg-surface-muted" />
                    <div className="h-7 w-16 rounded bg-surface-muted" />
                    <div className="h-3 w-full rounded bg-surface-muted" />
                    <div className="h-3 w-3/4 rounded bg-surface-muted" />
                  </div>
                ) : preview.unreachable ? (
                  <p className="text-xs text-zinc-500">
                    No hemos podido analizar {preview.domain} todavía, pero puedes verlo igualmente.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-zinc-500">Growth Score</span>
                    <span className="text-2xl font-semibold tracking-tight text-foreground">
                      {preview.score}
                      <span className="text-sm font-normal text-zinc-500">/100</span>
                    </span>
                    {preview.failedCount > 0 && (
                      <p className="text-xs text-amber-700">
                        ⚠️ {preview.failedCount} {preview.failedCount === 1 ? "acción" : "acciones"} para
                        hoy
                      </p>
                    )}
                    <p className="text-xs font-medium text-brand-600">
                      + {preview.potential} potencial de mejora
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
