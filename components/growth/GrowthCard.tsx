import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GrowthCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Borde con degradado sutil de marca, para las tarjetas principales de cada página. */
  glow?: boolean;
  /** Se levanta y resalta el borde al pasar el ratón — para tarjetas de páginas de marketing. */
  interactive?: boolean;
}

export function GrowthCard({ className, glow, interactive, ...props }: GrowthCardProps) {
  const card = (
    <div
      className={cn(
        "rounded-2xl bg-surface p-5 shadow-sm",
        glow ? "border border-transparent" : "border border-border",
        interactive &&
          "transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-md",
        className,
      )}
      {...props}
    />
  );

  if (!glow) return card;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-300 via-brand-100 to-transparent p-px">
      {card}
    </div>
  );
}
