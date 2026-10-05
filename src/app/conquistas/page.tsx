import { AchievementsView } from "@/components/achievements-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conquistas",
  description: "Acompanhe os níveis Sênior e Profissional das suas cronologias.",
};

export default function AchievementsPage() {
  return <AchievementsView />;
}
