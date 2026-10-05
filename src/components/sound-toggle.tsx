"use client";

import { useSound } from "@/context/sound-context";
import { getScoreEngine } from "@/lib/score-engine";
import { Volume2, VolumeX } from "lucide-react";

export function SoundToggle() {
  const { muted, toggle } = useSound();
  return (
    <button
      type="button"
      onClick={() => {
        const nextMuted = !muted;
        toggle();
        const engine = getScoreEngine();
        engine.setMuted(nextMuted);
        if (!nextMuted) void engine.unlock();
      }}
      aria-pressed={!muted}
      aria-label={muted ? "Ligar som" : "Silenciar"}
      title={muted ? "Ligar som" : "Silenciar"}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:text-white"
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-gold" />}
    </button>
  );
}
