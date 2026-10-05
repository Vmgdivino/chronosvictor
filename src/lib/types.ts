export type Soundtrack = {
  title: string;
  artist: string;
  youtubeId: string;
};

export type MediaKind = "movie" | "series";

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
  kind: MediaKind;
  episodes?: number;
  soundtrack: Soundtrack;
};

export type MovieSource = Omit<Movie, "soundtrack" | "kind" | "episodes"> & {
  kind?: MediaKind;
  episodes?: number;
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

export type FranchiseSource = Omit<Franchise, "movies"> & {
  movies: MovieSource[];
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
