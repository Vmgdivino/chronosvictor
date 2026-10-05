export type Movie = {
  id: string;
  title: string;
  year: number;
  runtime: number;
  synopsis: string;
  poster: string;
  setting: string;
  chapter: string;
  tags: string[];
  note?: string;
};

export type Franchise = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  accent: string;
  glow: string;
  backdrop: string;
  orderNote: string;
  movies: Movie[];
};

export type WatchFilter = "all" | "watching" | "watched" | "pending";

export type AchievementTier = "senior" | "professional";

export type Achievement = {
  id: string;
  tier: AchievementTier;
  title: string;
  description: string;
  current: number;
  target: number;
  unlocked: boolean;
};
