import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GrowthCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Borde con degradado sutil de marca, para las tarjetas principales de cada página. */
  glow?: boolean;
}

export function GrowthCard({ className, glow, ...props }: GrowthCardProps) {
  const card = (
    <div
      className={cn(
        "rounded-2xl bg-surface p-5 shadow-sm",
        glow ? "border border-transparent" : "border border-border",
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
