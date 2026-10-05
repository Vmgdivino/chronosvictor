import { RankingView } from "@/components/ranking-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ranking",
  description: "Pódio das contas desta sala, por cronologias completas e títulos assistidos.",
};

export default function RankingPage() {
  return <RankingView />;
}
