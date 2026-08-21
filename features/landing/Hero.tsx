"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { normalizeDomain } from "@/lib/utils";

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

      <form
        onSubmit={handleSubmit}
        className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row"
      >
        <Input
          type="text"
          required
          placeholder="tuclinica.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" className="whitespace-nowrap">
          Analizar gratis
        </Button>
      </form>

      <p className="mt-4 text-xs text-zinc-500">Sin tarjeta · Menos de 30 segundos · Informe inmediato</p>
    </section>
  );
}
