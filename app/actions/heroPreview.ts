"use server";

import { runQuickAudit, growthPotentialLabel } from "@/lib/quickAudit";
import { normalizeDomain } from "@/lib/utils";

export interface HeroPreview {
  domain: string;
  score: number;
  potential: string;
  failedCount: number;
  totalCount: number;
  unreachable: boolean;
}

export async function getHeroPreviewAction(rawDomain: string): Promise<HeroPreview | null> {
  const domain = normalizeDomain(rawDomain);
  if (!domain || !domain.includes(".") || domain.length < 4) return null;

  const result = await runQuickAudit(domain);

  if (result.unreachable) {
    return { domain, score: 0, potential: "", failedCount: 0, totalCount: 0, unreachable: true };
  }

  return {
    domain,
    score: result.score,
    potential: growthPotentialLabel(result.score),
    failedCount: result.checks.filter((c) => !c.passed).length,
    totalCount: result.checks.length,
    unreachable: false,
  };
}
