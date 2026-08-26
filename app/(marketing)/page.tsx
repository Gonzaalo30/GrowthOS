import { Hero } from "@/features/landing/Hero";
import { GamificationShowcase } from "@/features/landing/GamificationShowcase";
import { GamificationShowcaseBusiness } from "@/features/landing/GamificationShowcaseBusiness";
import { GrowthSprintTeaser } from "@/features/landing/GrowthSprintTeaser";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ variante?: string }>;
}) {
  const { variante } = await searchParams;

  return (
    <div className="flex flex-1 flex-col">
      <Hero />
      {/* Dos tonos para la sección de gamificación, para comparar visualmente
          antes de decidir cuál se queda: ?variante=negocio lidera con
          resultados de negocio; sin el parámetro, lidera con nivel/XP/racha. */}
      {variante === "negocio" ? <GamificationShowcaseBusiness /> : <GamificationShowcase />}
      <GrowthSprintTeaser />
    </div>
  );
}
