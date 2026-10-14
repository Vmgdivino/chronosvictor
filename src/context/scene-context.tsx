"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { SceneMotion } from "@/lib/scene";

export type ScenePreview = {
  image: string;
  accent: string;
  motion: SceneMotion;
};

export type CastFocus = {
  slug: string;
  movieId: string;
  movieTitle: string;
  franchiseName: string;
};

type SceneContextValue = {
  preview: ScenePreview | null;
  setPreview: (preview: ScenePreview | null) => void;
  cast: CastFocus | null;
  setCast: (cast: CastFocus | null) => void;
};

const SceneContext = createContext<SceneContextValue | null>(null);

export function SceneProvider({ children }: { children: ReactNode }) {
  const [preview, setPreview] = useState<ScenePreview | null>(null);
  const [cast, setCast] = useState<CastFocus | null>(null);
  const value = useMemo(() => ({ preview, setPreview, cast, setCast }), [preview, cast]);
  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
}

export function useScene() {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error("useScene precisa estar dentro de SceneProvider.");
  }
  return context;
}
