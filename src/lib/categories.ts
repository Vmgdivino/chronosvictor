import { franchises } from "@/lib/franchises";
import type { Franchise } from "@/lib/types";

export const categories = [
  { id: "todas", label: "Todas" },
  { id: "herois", label: "Heróis" },
  { id: "acao", label: "Ação" },
  { id: "fantasia", label: "Fantasia" },
  { id: "ficcao", label: "Ficção" },
  { id: "aventura", label: "Aventura" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

export const categoryBySlug: Record<string, Exclude<CategoryId, "todas">> = {
  marvel: "herois",
  dceu: "herois",
  "batman-nolan": "herois",
  velozes: "acao",
  "missao-impossivel": "acao",
  "john-wick": "acao",
  "007-craig": "acao",
  "mad-max": "acao",
  "harry-potter": "fantasia",
  "terra-media": "fantasia",
  piratas: "fantasia",
  "star-wars": "ficcao",
  jurassic: "ficcao",
  matrix: "ficcao",
  "planeta-dos-macacos": "ficcao",
  duna: "ficcao",
  avatar: "ficcao",
  alien: "ficcao",
  monsterverse: "ficcao",
  "indiana-jones": "aventura",
  "jogos-vorazes": "aventura",
};

export function franchisesIn(category: CategoryId): Franchise[] {
  if (category === "todas") return franchises;
  return franchises.filter((franchise) => categoryBySlug[franchise.slug] === category);
}
