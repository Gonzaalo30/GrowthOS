import { Suspense } from "react";
import { redirect } from "next/navigation";
import { QuickAuditResult } from "@/features/landing/QuickAuditResult";
import { AuditLoadingSteps } from "@/features/landing/AuditLoadingSteps";
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
      <Suspense fallback={<AuditLoadingSteps domain={domain} />}>
        <QuickAuditResult domain={domain} />
      </Suspense>
    </div>
  );
}
