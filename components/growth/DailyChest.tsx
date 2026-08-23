"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { openDailyChestAction, type OpenChestResult } from "@/app/actions/chest";
import { getTemplateById } from "@/lib/copyTemplates";

export interface TodayChestInfo {
  rewardType: "xp" | "bonus_mission" | "template";
  xpAwarded: number | null;
  templateId: string | null;
}

export function DailyChest({ todayChest }: { todayChest: TodayChestInfo | null }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<OpenChestResult | null>(null);
  const [copied, setCopied] = useState(false);

  const rewardType = result?.rewardType ?? todayChest?.rewardType;
  const xpAwarded = result?.xpAwarded ?? todayChest?.xpAwarded ?? null;
  const templateId = result?.templateId ?? todayChest?.templateId ?? null;
  const template = templateId ? getTemplateById(templateId) : undefined;
  const opened = Boolean(todayChest) || result !== null;

  function handleOpen() {
    startTransition(async () => {
      const res = await openDailyChestAction();
      setResult(res);
    });
  }

  function handleCopy() {
    if (!template) return;
    navigator.clipboard.writeText(`${template.subject}\n\n${template.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <GrowthCard className="flex flex-col items-center gap-3 text-center">
      <motion.div
        key="chest"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex w-full flex-col items-center gap-2"
      >
        {!opened ? (
          <>
            <span className="text-4xl">🎁</span>
            <p className="text-sm text-zinc-600">Tienes un cofre diario esperando.</p>
            <Button onClick={handleOpen} disabled={isPending}>
              {isPending ? "Abriendo…" : "Abrir cofre"}
            </Button>
          </>
        ) : (
          <>
            <span className="text-3xl">
              {rewardType === "bonus_mission" ? "🎯" : rewardType === "template" ? "📝" : "✨"}
            </span>
            {rewardType === "xp" && <p className="text-sm font-medium text-foreground">+{xpAwarded} XP de regalo</p>}
            {rewardType === "bonus_mission" && (
              <p className="text-sm font-medium text-foreground">
                Nuevo Quick Win{result?.missionTitle ? `: ${result.missionTitle}` : " desbloqueado"}
              </p>
            )}
            {rewardType === "template" && template && (
              <div className="w-full text-left">
                <p className="text-sm font-medium text-foreground">Plantilla desbloqueada: {template.situation}</p>
                <div className="mt-2 rounded-xl bg-surface-muted p-3">
                  <p className="text-xs font-semibold text-zinc-500">Asunto</p>
                  <p className="text-sm text-foreground">{template.subject}</p>
                  <p className="mt-2 text-xs font-semibold text-zinc-500">Mensaje</p>
                  <p className="whitespace-pre-line text-sm text-zinc-600">{template.body}</p>
                </div>
                <Button variant="secondary" onClick={handleCopy} className="mt-2 w-full">
                  {copied ? "Copiado" : "Copiar plantilla"}
                </Button>
              </div>
            )}
            {!rewardType && <p className="text-sm text-zinc-500">Ya has abierto tu cofre de hoy. Vuelve mañana.</p>}
            <p className="text-xs text-zinc-500">Vuelve mañana a por otro</p>
          </>
        )}
      </motion.div>
    </GrowthCard>
  );
}
