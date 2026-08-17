import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-zinc-400 outline-none transition-shadow focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
