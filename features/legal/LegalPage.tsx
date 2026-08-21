import { LEGAL_LAST_UPDATED } from "@/lib/legalInfo";
import type { ReactNode } from "react";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-zinc-500">Última actualización: {LEGAL_LAST_UPDATED}</p>
      </div>
      <div className="flex flex-col gap-6 text-sm leading-relaxed text-zinc-700">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-semibold text-foreground">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
