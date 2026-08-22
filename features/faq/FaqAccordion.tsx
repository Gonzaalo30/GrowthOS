"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-medium text-foreground">{item.question}</span>
              <span className={cn("shrink-0 text-zinc-400 transition-transform", open && "rotate-45")}>
                +
              </span>
            </button>
            {open && <p className="px-5 pb-4 text-sm text-zinc-600">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
