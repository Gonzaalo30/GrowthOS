"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { normalizeDomain } from "@/lib/utils";

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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = normalizeDomain(domain);
    if (!clean) return;
    router.push(`/analisis?domain=${encodeURIComponent(clean)}`);
  }

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

      <div className="mt-10 flex w-full max-w-md flex-col items-center gap-3">
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

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-zinc-500">
          {TRUST_ITEMS.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5">
              {item.icon}
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
