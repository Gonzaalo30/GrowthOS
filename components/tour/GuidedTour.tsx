"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export interface TourStep {
  /** `id` del elemento del DOM a señalar. */
  targetId: string;
  title: string;
  description: string;
  /** Por dónde sale la tarjeta respecto al elemento señalado. "auto" decide según el espacio disponible. */
  placement?: "top" | "bottom" | "auto";
}

const SPOTLIGHT_PADDING = 8;
const CARD_WIDTH = 300;
const CARD_GAP = 14;
// Estimación fija para poder acotar la tarjeta dentro de la pantalla antes
// de haberla pintado (su alto real varía según el texto de cada paso).
const CARD_HEIGHT_ESTIMATE = 180;

/**
 * Guía paso a paso real (no un vídeo ni una imagen estática): señala de
 * verdad el elemento correspondiente de la página con un recorte tipo
 * "foco" (técnica de box-shadow gigante, sin SVG ni clip-path) y explica qué
 * es. Se recuerda con localStorage — solo se ve una vez por navegador, y
 * "Saltar" la cierra para siempre igual que terminarla.
 */
export function GuidedTour({ steps, storageKey }: { steps: TourStep[]; storageKey: string }) {
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey)) setStepIndex(0);
    } catch {
      // localStorage bloqueado (navegación privada, etc.): sin guía, no rompe la página
    }
  }, [storageKey]);

  useEffect(() => {
    if (stepIndex === null) return;
    const step = steps[stepIndex];
    const el = document.getElementById(step.targetId);
    if (!el) {
      finish();
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const update = () => setRect(el.getBoundingClientRect());
    // Pequeño margen para dejar que termine el scroll suave antes de medir.
    const timeout = setTimeout(update, 300);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe re-medir al cambiar de paso
  }, [stepIndex]);

  function finish() {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      // si no se puede guardar, la guía simplemente podría reaparecer en la próxima visita
    }
    setStepIndex(null);
    setRect(null);
  }

  function next() {
    if (stepIndex === null) return;
    if (stepIndex + 1 >= steps.length) finish();
    else setStepIndex(stepIndex + 1);
  }

  function prev() {
    if (stepIndex !== null && stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  if (stepIndex === null || !rect) return null;
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const spotlightRect = {
    top: rect.top - SPOTLIGHT_PADDING,
    left: rect.left - SPOTLIGHT_PADDING,
    width: rect.width + SPOTLIGHT_PADDING * 2,
    height: rect.height + SPOTLIGHT_PADDING * 2,
  };

  // Se usa la parte VISIBLE del objetivo (recortada al viewport), no su rect
  // completo — un objetivo más alto que la pantalla (una lista larga) tendría
  // `top` negativo o `bottom` mucho mayor que la ventana, y posicionar la
  // tarjeta con eso la mandaría fuera de la pantalla.
  const visibleTop = Math.max(rect.top, 0);
  const visibleBottom = Math.min(rect.bottom, window.innerHeight);
  const spaceBelow = window.innerHeight - visibleBottom;
  const spaceAbove = visibleTop;
  const placeBottom =
    step.placement === "bottom" || (step.placement !== "top" && spaceBelow >= spaceAbove);

  const rawCardTop = placeBottom ? visibleBottom + CARD_GAP : visibleTop - CARD_GAP - CARD_HEIGHT_ESTIMATE;
  const cardTop = Math.min(Math.max(rawCardTop, 16), window.innerHeight - CARD_HEIGHT_ESTIMATE - 16);
  const cardLeft = Math.min(
    Math.max(rect.left, 16),
    window.innerWidth - CARD_WIDTH - 16,
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70]">
        <motion.div
          className="fixed rounded-xl border-2 border-brand-400"
          initial={false}
          animate={spotlightRect}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ boxShadow: "0 0 0 9999px rgba(15, 15, 15, 0.65)" }}
        />

        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: placeBottom ? -8 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed rounded-2xl border border-border bg-white p-4 shadow-xl"
          style={{ width: CARD_WIDTH, left: cardLeft, top: cardTop }}
        >
          <p className="text-xs font-medium text-brand-600">
            Paso {stepIndex + 1} de {steps.length}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-foreground">{step.title}</h3>
          <p className="mt-1.5 text-sm text-zinc-600">{step.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={finish}
              className="text-xs text-zinc-500 outline-none hover:text-foreground focus-visible:underline"
            >
              Saltar guía
            </button>
            <div className="flex items-center gap-2">
              {stepIndex > 0 && (
                <Button type="button" variant="ghost" onClick={prev} className="px-3 py-1.5 text-xs">
                  Atrás
                </Button>
              )}
              <Button type="button" onClick={next} className="px-3 py-1.5 text-xs">
                {isLast ? "Entendido" : "Siguiente"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
