"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { normalizeDomain } from "@/lib/utils";

// Entrada escalonada al cargar (no al hacer scroll, ya está por encima del
// pliegue): el contenedor retrasa un poco a cada hijo directo.
const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

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
    <motion.section
      variants={container}
      initial="hidden"
      animate="visible"
      className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:py-24"
    >
      <motion.span
        variants={item}
        className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600"
      >
        Análisis gratuito en segundos
      </motion.span>
      <motion.h1
        variants={item}
        className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
      >
        Descubre cuántas oportunidades está perdiendo tu negocio online
      </motion.h1>
      <motion.p variants={item} className="mt-5 max-w-2xl text-lg text-zinc-600 sm:text-xl">
        GrowthOS convierte cada oportunidad de mejora de tu web en una acción concreta que completas en
        minutos — o que dejas en manos de nuestro equipo.
      </motion.p>

      <motion.div variants={item} className="mt-10 flex w-full max-w-md flex-col items-center gap-3">
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
          {TRUST_ITEMS.map((trustItem) => (
            <span key={trustItem.label} className="inline-flex items-center gap-1.5">
              {trustItem.icon}
              {trustItem.label}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}
