import { franchises } from "@/lib/franchises";
import { catalogProgress, franchiseProgress } from "@/lib/progress";

type RankAccount = {
  name: string;
  watched: string[];
};

export type RankedUser = {
  name: string;
  place: number;
  done: number;
  total: number;
  percent: number;
  points: number;
  completed: { slug: string; name: string; accent: string }[];
};

export function buildRanking(accounts: RankAccount[]): RankedUser[] {
  return accounts
    .map((account) => {
      const watched = new Set(account.watched);
      const catalog = catalogProgress(franchises, watched);
      const completed = franchises
        .filter((franchise) => franchiseProgress(franchise, watched).percent === 100)
        .map((franchise) => ({ slug: franchise.slug, name: franchise.name, accent: franchise.accent }));
      return {
        name: account.name,
        done: catalog.done,
        total: catalog.total,
        percent: catalog.percent,
        points: completed.length * 1000 + catalog.done,
        completed,
        place: 0,
      };
    })
    .sort((a, b) => b.points - a.points || b.done - a.done || a.name.localeCompare(b.name, "pt"))
    .map((row, index) => ({ ...row, place: index + 1 }));
}
