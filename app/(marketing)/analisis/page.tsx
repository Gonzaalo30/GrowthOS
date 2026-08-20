import { Suspense } from "react";
import { redirect } from "next/navigation";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { QuickAuditResult } from "@/features/landing/QuickAuditResult";
import { normalizeDomain } from "@/lib/utils";

export default async function AnalisisPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>;
}) {
  const { domain: rawDomain } = await searchParams;
  const domain = rawDomain ? normalizeDomain(rawDomain) : "";

  if (!domain) redirect("/");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <Suspense
        fallback={
          <GrowthCard className="mx-auto max-w-lg text-center">
            <p className="text-sm text-zinc-600">Analizando {domain}…</p>
          </GrowthCard>
        }
      >
        <QuickAuditResult domain={domain} />
      </Suspense>
    </div>
  );
}
