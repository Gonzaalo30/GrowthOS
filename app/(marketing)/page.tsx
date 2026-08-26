import { Hero } from "@/features/landing/Hero";
import { GamificationShowcase } from "@/features/landing/GamificationShowcase";
import { GrowthSprintTeaser } from "@/features/landing/GrowthSprintTeaser";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Hero />
      <GamificationShowcase />
      <GrowthSprintTeaser />
    </div>
  );
}
