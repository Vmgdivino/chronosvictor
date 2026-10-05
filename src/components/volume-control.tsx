"use client";

import { nudgeVolume, toggleMute, useAudio } from "@/context/sound-context";
import { Minus, Plus, Volume2, VolumeX } from "lucide-react";

export function VolumeControl() {
  const audio = useAudio();
  const silent = audio.muted || audio.volume === 0;

  return (
    <div className="flex h-11 shrink-0 items-center rounded-full border border-white/10 bg-white/5 p-0.5" aria-label="Volume da trilha">
      <button
        type="button"
        onClick={() => nudgeVolume(-10)}
        className="grid h-10 w-9 place-items-center rounded-full text-white/75 hover:text-white"
        aria-label="Diminuir volume"
      >
        <Minus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={toggleMute}
        aria-pressed={audio.muted}
        className={`grid h-10 w-10 place-items-center rounded-full ${silent ? "bg-gold text-black" : "text-white"}`}
        aria-label={audio.muted ? "Ativar som" : "Silenciar"}
      >
        {silent ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={() => nudgeVolume(10)}
        className="grid h-10 w-9 place-items-center rounded-full text-white/75 hover:text-white"
        aria-label="Aumentar volume"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
