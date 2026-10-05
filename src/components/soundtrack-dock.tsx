"use client";

import { Poster } from "@/components/poster";
import { currentTrack, nudgeVolume, playNext, setVolume, toggleMute, togglePlay, toggleShuffle, useAudio } from "@/context/sound-context";
import { Minus, Music2, Pause, Play, Plus, Shuffle, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import { useState } from "react";

export function SoundtrackDock() {
  const audio = useAudio();
  const track = currentTrack(audio);
  const [open, setOpen] = useState(false);
  const audible = Boolean(track && audio.playing && !audio.muted);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex w-[min(20rem,calc(100vw-2rem))] flex-col items-end gap-2">
      {open ? (
        <section className="w-full rounded-2xl border border-white/10 bg-[#0c0e14]/92 p-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start gap-3">
            {track ? (
              <Poster src={track.poster} alt="" className="h-14 w-10 shrink-0 rounded-md object-cover" />
            ) : (
              <span className="grid h-14 w-10 shrink-0 place-items-center rounded-md bg-white/5 text-white/50">
                <Music2 className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">{track?.soundtrack.title ?? "Trilha da sala"}</p>
              <p className="truncate text-xs text-white/55">{track ? track.soundtrack.artist : "Abra uma franquia"}</p>
              {track ? <p className="truncate text-[11px] text-gold/80">{track.movieTitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full text-white/50 hover:text-white"
              aria-label="Fechar trilha"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={togglePlay}
              disabled={!track}
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-black disabled:opacity-40"
              aria-label={audio.playing ? "Pausar" : "Tocar"}
            >
              {audio.playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
            </button>
            <button
              type="button"
              onClick={playNext}
              disabled={!track || audio.queue.length < 2}
              className="grid h-10 w-10 place-items-center rounded-full text-white/75 hover:text-white disabled:opacity-30"
              aria-label="Próxima música"
            >
              <SkipForward className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggleShuffle}
              disabled={!audio.franchiseSlug}
              aria-pressed={audio.shuffle}
              className={`inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-xs ${
                audio.shuffle ? "bg-gold/15 text-gold" : "text-white/70 hover:text-white"
              } disabled:opacity-30`}
            >
              <Shuffle className="h-3.5 w-3.5" />
              Rádio da franquia
            </button>
            <button
              type="button"
              onClick={() => nudgeVolume(-10)}
              className="grid h-11 w-10 place-items-center rounded-full text-white/80 hover:text-white"
              aria-label="Diminuir volume"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className={`grid h-11 w-11 place-items-center rounded-full ${audio.muted ? "bg-gold text-black" : "bg-white text-black"}`}
              aria-label={audio.muted ? "Ativar som" : "Silenciar"}
              aria-pressed={audio.muted}
            >
              {audio.muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => nudgeVolume(10)}
              className="grid h-11 w-10 place-items-center rounded-full text-white/80 hover:text-white"
              aria-label="Aumentar volume"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <label className="mt-2 flex items-center gap-2 text-[11px] text-white/45">
            Volume
            <input
              type="range"
              min={0}
              max={100}
              value={audio.muted ? 0 : audio.volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              aria-label="Volume"
              className="h-1 flex-1 accent-gold"
            />
          </label>
        </section>
      ) : null}

      {track && !open ? (
        <div className="flex h-11 max-w-full items-center gap-2 rounded-full border border-white/10 bg-[#0c0e14]/88 py-1 pl-1 pr-1.5 shadow-xl backdrop-blur-xl">
          <button type="button" onClick={() => setOpen(true)} className="flex min-w-0 items-center gap-2 text-left" aria-expanded={false} aria-label="Abrir trilha">
            <Poster src={track.poster} alt="" className="h-9 w-7 rounded-full object-cover" />
            <span className="min-w-0">
              <span className="block max-w-32 truncate text-xs text-white sm:max-w-40">{track.soundtrack.title}</span>
              <span className="block max-w-32 truncate text-[10px] text-white/50 sm:max-w-40">{track.soundtrack.artist}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={togglePlay}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-black"
            aria-label={audio.playing ? "Pausar" : "Tocar"}
          >
            {audio.playing ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${audio.muted ? "text-gold" : "text-white/80"}`}
            aria-label={audio.muted ? "Ativar som" : "Silenciar"}
            aria-pressed={audio.muted}
          >
            {audio.muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      ) : null}
      {!track && !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-label="Trilha sonora"
          className={`grid h-11 w-11 place-items-center rounded-full border bg-[#0c0e14]/88 text-white/75 shadow-xl backdrop-blur-xl ${
            audible ? "border-gold/50 text-gold" : "border-white/10"
          }`}
        >
          <Music2 className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
