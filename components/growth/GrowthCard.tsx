import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function GrowthCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
