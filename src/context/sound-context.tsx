"use client";

import { getFranchise } from "@/lib/franchises";
import type { Franchise, Movie, Soundtrack } from "@/lib/types";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

const PREFS_KEY = "chronosvictor.audio.v1";

export type AudioTrack = {
  movieId: string;
  movieTitle: string;
  poster: string;
  soundtrack: Soundtrack;
};

type AudioSnapshot = {
  queue: AudioTrack[];
  index: number;
  playing: boolean;
  muted: boolean;
  volume: number;
  shuffle: boolean;
  franchiseSlug: string | null;
};

type YTPlayer = {
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo?: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  getPlayerState?: () => number;
  getIframe?: () => HTMLIFrameElement;
};

type YTStateEvent = { data: number };

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          host?: string;
          width?: string;
          height?: string;
          videoId?: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: YTStateEvent) => void;
            onError?: () => void;
          };
        },
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const serverSnapshot: AudioSnapshot = {
  queue: [],
  index: 0,
  playing: false,
  muted: false,
  volume: 80,
  shuffle: false,
  franchiseSlug: null,
};

let state: AudioSnapshot = serverSnapshot;
const listeners = new Set<() => void>();
let player: YTPlayer | null = null;
let playerFrame: HTMLIFrameElement | null = null;
let mounting = false;
let hushToken = 0;
let loadedId = "";
let loadToken = 0;
let activeToken = 0;
let loadedAt = 0;
let armed = false;
let errorStreak = 0;
let playAttempt = 0;
let prefsReady = false;

function emit() {
  for (const listener of listeners) listener();
}

function clamp(volume: number) {
  return Math.min(100, Math.max(0, Math.round(volume)));
}

function persist() {
  localStorage.setItem(PREFS_KEY, JSON.stringify({ muted: state.muted, volume: state.volume }));
}

function tracksFrom(franchise: Franchise): AudioTrack[] {
  return franchise.movies
    .filter((movie) => movie.soundtrack.youtubeId)
    .map((movie) => ({
      movieId: movie.id,
      movieTitle: movie.title,
      poster: movie.poster,
      soundtrack: movie.soundtrack,
    }));
}

function shuffleTracks(tracks: AudioTrack[], first?: AudioTrack) {
  const copy = [...tracks];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  if (!first) return copy;
  const found = copy.findIndex((track) => track.movieId === first.movieId);
  if (found > 0) {
    const [picked] = copy.splice(found, 1);
    copy.unshift(picked);
  }
  return copy;
}

function youtubeFrames() {
  return [...document.querySelectorAll("iframe")].filter((frame) => {
    const src = `${frame.getAttribute("src") || ""} ${frame.getAttribute("data-src") || ""}`;
    return src.includes("youtube") || src.includes("youtu.be");
  });
}

function commandFrames(func: string, args: unknown[] = []) {
  const payload = JSON.stringify({ event: "command", func, args });
  for (const frame of youtubeFrames()) {
    (frame as HTMLIFrameElement).contentWindow?.postMessage(payload, "*");
  }
}

function dropExtraPlayers() {
  if (!playerFrame) return;
  for (const frame of youtubeFrames()) {
    if (frame === playerFrame) continue;
    frame.remove();
  }
}

function silentNow() {
  return state.muted || state.volume === 0;
}

function hush() {
  player?.mute();
  player?.setVolume(0);
  player?.pauseVideo();
  commandFrames("mute");
  commandFrames("setVolume", [0]);
  commandFrames("pauseVideo");
}

function hushSoon() {
  const token = ++hushToken;
  const run = () => {
    if (token !== hushToken || !silentNow()) return;
    hush();
  };
  run();
  window.setTimeout(run, 250);
  window.setTimeout(run, 900);
}

function apply() {
  const track = state.queue[state.index];
  if (!player || !track) {
    if (!track) player?.pauseVideo();
    return;
  }
  dropExtraPlayers();
  const silent = silentNow();
  if (loadedId !== track.soundtrack.youtubeId) {
    loadedId = track.soundtrack.youtubeId;
    activeToken = ++loadToken;
    loadedAt = Date.now();
    armed = true;
    player.stopVideo?.();
    if (state.playing && !silent) player.loadVideoById(track.soundtrack.youtubeId);
    else player.cueVideoById(track.soundtrack.youtubeId);
  } else if (state.playing && !silent) {
    player.playVideo();
  } else {
    player.pauseVideo();
  }
  if (silent) {
    hushSoon();
    return;
  }
  hushToken += 1;
  player.unMute();
  player.setVolume(state.volume);
  commandFrames("unMute");
  commandFrames("setVolume", [state.volume]);
  if (!state.playing) return;
  const attempt = ++playAttempt;
  window.setTimeout(() => {
    if (attempt !== playAttempt || !state.playing) return;
    const code = player?.getPlayerState?.();
    if (code === 1 || code === 3) return;
    state = { ...state, playing: false };
    emit();
  }, 1400);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useAudio() {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}

export function currentTrack(snapshot: AudioSnapshot) {
  return snapshot.queue[snapshot.index] ?? null;
}

export function hydrateAudioPrefs() {
  if (prefsReady || typeof window === "undefined") return;
  prefsReady = true;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { muted?: boolean; volume?: number };
    const muted = Boolean(parsed.muted);
    const volume = typeof parsed.volume === "number" ? clamp(parsed.volume) : state.volume;
    if (muted === state.muted && volume === state.volume) return;
    state = { ...state, muted, volume };
    emit();
    apply();
  } catch {
    // Preferências antigas ou inválidas ficam no volume padrão.
  }
}

export function cueFranchise(franchise: Franchise) {
  if (state.franchiseSlug === franchise.slug && state.queue.length > 0) return;
  const tracks = tracksFrom(franchise);
  if (!tracks.length) return;
  const queue = state.shuffle ? shuffleTracks(tracks) : tracks;
  state = {
    ...state,
    queue,
    index: 0,
    franchiseSlug: franchise.slug,
    playing: !state.muted,
  };
  emit();
  apply();
}

export function playMovie(movie: Movie, franchise: Franchise) {
  const tracks = tracksFrom(franchise);
  const selected = tracks.find((track) => track.movieId === movie.id) ?? tracks[0];
  if (!selected) return;
  const queue = state.shuffle ? shuffleTracks(tracks, selected) : tracks;
  const index = state.shuffle ? 0 : Math.max(0, queue.findIndex((track) => track.movieId === selected.movieId));
  state = {
    ...state,
    queue,
    index,
    franchiseSlug: franchise.slug,
    playing: true,
  };
  emit();
  apply();
}

export function togglePlay() {
  if (!state.queue.length) return;
  state = { ...state, playing: !state.playing };
  emit();
  apply();
}

export function toggleMute() {
  const muted = !state.muted;
  state = { ...state, muted, volume: muted ? state.volume : state.volume || 80 };
  persist();
  emit();
  apply();
}

export function setVolume(volume: number) {
  const next = clamp(volume);
  state = { ...state, volume: next, muted: next === 0 };
  persist();
  emit();
  apply();
}

export function nudgeVolume(delta: number) {
  const base = state.muted ? 0 : state.volume;
  const next = clamp(base + delta);
  state = { ...state, volume: next > 0 ? next : state.volume || 10, muted: next === 0 };
  persist();
  emit();
  apply();
}

export function toggleShuffle() {
  const shuffle = !state.shuffle;
  if (!state.franchiseSlug) {
    state = { ...state, shuffle };
    emit();
    return;
  }
  const franchise = getFranchise(state.franchiseSlug);
  const tracks = franchise ? tracksFrom(franchise) : state.queue;
  if (!tracks.length) {
    state = { ...state, shuffle };
    emit();
    return;
  }
  if (shuffle) {
    state = { ...state, shuffle, queue: shuffleTracks(tracks), index: 0, playing: !state.muted };
  } else {
    const currentId = state.queue[state.index]?.movieId;
    const index = Math.max(0, tracks.findIndex((track) => track.movieId === currentId));
    state = { ...state, shuffle, queue: tracks, index };
  }
  emit();
  apply();
}

function advance(manual: boolean) {
  if (!state.queue.length) return;
  const atEnd = state.index >= state.queue.length - 1;
  if (!manual && !state.shuffle) {
    state = { ...state, playing: false };
    emit();
    apply();
    return;
  }
  if (atEnd && state.shuffle) {
    const lastId = state.queue[state.index]?.movieId;
    let queue = shuffleTracks(state.queue);
    if (queue[0]?.movieId === lastId && queue.length > 1) {
      const [first] = queue.splice(0, 1);
      queue = [...queue, first];
    }
    state = { ...state, queue, index: 0, playing: true };
  } else {
    state = { ...state, index: atEnd ? 0 : state.index + 1, playing: true };
  }
  emit();
  apply();
}

export function playNext() {
  advance(true);
}

export function bindPlayer(instance: YTPlayer) {
  player = instance;
  apply();
}

export function handlePlayerState(code: number) {
  if (code === 1) {
    errorStreak = 0;
    if (silentNow()) hushSoon();
  }
  if (code !== 0 || !armed) return;
  if (Date.now() - loadedAt < 1500) return;
  if (activeToken !== loadToken) return;
  activeToken = -1;
  advance(false);
}

export function handlePlayerError() {
  if (!armed) return;
  errorStreak += 1;
  if (errorStreak > 4) {
    state = { ...state, playing: false };
    emit();
    apply();
    return;
  }
  advance(true);
}

let apiPromise: Promise<void> | null = null;

function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

function mountPlayer() {
  if (player || mounting || typeof window === "undefined" || !window.YT?.Player) return;
  mounting = true;
  for (const frame of youtubeFrames()) frame.remove();
  for (const host of document.querySelectorAll("#chronosvictor-yt")) host.remove();
  const host = document.createElement("div");
  host.id = "chronosvictor-yt";
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    "position:fixed;left:0;bottom:0;width:200px;height:113px;overflow:hidden;opacity:0;pointer-events:none;z-index:0";
  document.body.appendChild(host);
  new window.YT.Player(host, {
    host: "https://www.youtube-nocookie.com",
    width: "200",
    height: "113",
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      origin: window.location.origin,
      playsinline: 1,
      rel: 0,
    },
    events: {
      onReady: (event) => {
        mounting = false;
        playerFrame = event.target.getIframe?.() ?? youtubeFrames().at(-1) ?? null;
        playerFrame?.setAttribute("data-chronosvictor", "player");
        bindPlayer(event.target);
      },
      onStateChange: (event) => handlePlayerState(event.data),
      onError: () => handlePlayerError(),
    },
  });
}

export function AudioHost() {
  const pathname = usePathname();
  const slug = pathname.startsWith("/franquia/") ? decodeURIComponent(pathname.split("/")[2] ?? "") : "";

  useEffect(() => {
    hydrateAudioPrefs();
  }, []);

  useEffect(() => {
    if (!slug) return;
    const franchise = getFranchise(slug);
    if (franchise) cueFranchise(franchise);
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then(() => {
      if (!cancelled) mountPlayer();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
