"use client";

import { useSound } from "@/context/sound-context";
import { getScoreEngine } from "@/lib/score-engine";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ScoreBed() {
  const pathname = usePathname();
  const { muted } = useSound();
  const match = pathname.match(/^\/franquia\/([^/]+)/);
  const slug = match ? decodeURIComponent(match[1]) : null;

  useEffect(() => {
    const engine = getScoreEngine();
    engine.setSlug(slug);
    engine.setMuted(muted);
    const unlock = () => {
      void engine.unlock();
    };
    window.addEventListener("pointerdown", unlock);
    void engine.unlock();
    return () => window.removeEventListener("pointerdown", unlock);
  }, [slug, muted]);

  return <span className="sr-only" data-score={slug ?? "home"} data-muted={muted ? "1" : "0"} />;
}
