"use client";

import { useScene } from "@/context/scene-context";
import { useWatched } from "@/context/watched-context";
import { figureFor, figures, type Figure } from "@/lib/cast";
import { useEffect, useRef, useState } from "react";

const VIEWER_SCRIPT = "/vendor/model-viewer.min.js";
const WELCOME_KEY = "chronosvictor.cast.greeting";
const PLACE_KEY = "chronosvictor.cast.place";
const EAR_KEY = "chronosvictor.cast.ear";
const EAR_SCRIPT = "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

type LiveViewer = HTMLElement & {
  availableAnimations?: string[];
  animationName?: string;
};

type Turn = {
  role: "user" | "assistant";
  content: string;
};

type SpeechListener = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

const importModule = new Function("url", "return import(url)") as (url: string) => Promise<unknown>;

let viewerReady: Promise<void> | null = null;
let keepAlive = 0;

function ensureViewer() {
  if (customElements.get("model-viewer")) return Promise.resolve();
  if (!viewerReady) {
    viewerReady = importModule(VIEWER_SCRIPT)
      .then(() => {
        if (!customElements.get("model-viewer")) throw new Error("script");
      })
      .catch((error: unknown) => {
        viewerReady = null;
        throw error;
      });
  }
  return viewerReady;
}

function motionWords(mode: "run" | "walk" | "idle") {
  if (mode === "walk") return ["walk", "idle", "run"];
  if (mode === "idle") return ["idle"];
  return ["run", "walk", "idle"];
}

function clipNamed(names: string[], words: string[]) {
  for (const word of words) {
    const hit = names.find((name) => {
      const tail = (name.toLowerCase().split("|").pop() ?? "").replace(/[^a-z_]/g, "");
      if (word === "idle" && (tail.includes("gun") || tail.includes("shoot") || tail.includes("death"))) return false;
      if (word === "run" && tail.includes("jump")) return false;
      return tail === word || tail.endsWith(`_${word}`) || tail.startsWith(`${word}_`) || tail.includes(word);
    });
    if (hit) return hit;
  }
  return undefined;
}

type Place = { x: number; y: number };

function readPlace(): Place | null {
  try {
    const raw = localStorage.getItem(PLACE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Place>;
    if (typeof parsed.x === "number" && typeof parsed.y === "number") return { x: parsed.x, y: parsed.y };
  } catch {
    /* sessão privada */
  }
  return null;
}

function clampPlace(x: number, y: number, width: number, height: number): Place {
  const margin = 8;
  const maxX = Math.max(margin, window.innerWidth - width - margin);
  const maxY = Math.max(margin, window.innerHeight - height - margin);
  return {
    x: Math.min(maxX, Math.max(margin, x)),
    y: Math.min(maxY, Math.max(margin, y)),
  };
}

function greeting(name: string) {
  const hour = new Date().getHours();
  const hello = hour >= 5 && hour < 12 ? "Bom dia" : hour >= 12 && hour < 19 ? "Boa tarde" : "Boa noite";
  return `${hello}, ${name}.`;
}

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  const score = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();
    let value = 0;
    if (lang.startsWith("pt-pt")) value += 8;
    else if (lang.startsWith("pt")) value += 4;
    if (name.includes("natural") || name.includes("neural") || name.includes("online")) value += 10;
    if (name.includes("duarte") || name.includes("daniel") || name.includes("antonio")) value += 4;
    if (name.includes("google")) value += 2;
    return value;
  };
  return [...voices].sort((a, b) => score(b) - score(a))[0];
}

function whenVoices() {
  if (window.speechSynthesis.getVoices().length) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const done = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", done);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", done);
    window.speechSynthesis.getVoices();
    window.setTimeout(resolve, 700);
  });
}

let voiceStop = 0;
let speaker: HTMLAudioElement | null = null;

function haltVoice() {
  voiceStop += 1;
  window.clearInterval(keepAlive);
  window.speechSynthesis?.cancel();
  speaker?.pause();
}

function primeAudio() {
  if (!speaker) speaker = new Audio();
  speaker.muted = false;
  speaker.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
  void speaker.play().catch(() => undefined);
  window.speechSynthesis?.resume();
}

function playClip(url: string, token: number) {
  return new Promise<void>((resolve, reject) => {
    if (token !== voiceStop) {
      resolve();
      return;
    }
    const audio = speaker ?? new Audio();
    speaker = audio;
    let settled = false;
    const finish = (failed: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (failed && token === voiceStop) reject(new Error("audio"));
      else resolve();
    };
    const timer = window.setTimeout(() => finish(!audio.ended), 20000);
    audio.onended = () => finish(false);
    audio.onerror = () => finish(true);
    audio.src = url;
    void audio.play().catch(() => finish(true));
  });
}

function playLocal(text: string, token: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => {
      if (token !== voiceStop) {
        resolve();
        return;
      }
      const voice = pickVoice();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = voice?.lang || "pt-PT";
      if (voice) utter.voice = voice;
      utter.rate = 0.9;
      utter.pitch = 0.86;
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utter);
      window.setTimeout(() => resolve(), 12000);
    }, 80);
  });
}

function speak(text: string, onend?: () => void) {
  haltVoice();
  const token = voiceStop;
  const parts = text.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean);
  const lines = parts.length ? parts : [text];
  void (async () => {
    try {
      let neural = true;
      for (const line of lines) {
        if (token !== voiceStop) return;
        let heard = false;
        if (neural) {
          try {
            const response = await fetch(`/api/voz?q=${encodeURIComponent(line)}`, { signal: AbortSignal.timeout(12000) });
            if (response.ok) {
              const clip = URL.createObjectURL(await response.blob());
              try {
                await playClip(clip, token);
                heard = true;
              } finally {
                URL.revokeObjectURL(clip);
              }
            } else neural = false;
          } catch {
            neural = false;
          }
        }
        if (!heard && token === voiceStop) await playLocal(line, token);
      }
    } finally {
      if (token === voiceStop) onend?.();
    }
  })();
}

function MoveIcon({ mode }: { mode: "run" | "walk" | "idle" }) {
  if (mode === "idle") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="5.5" r="1.7" />
        <path d="M12 8.2v6.2M9.2 20.2 12 15.2l2.8 5M8.2 12.2h7.6" />
      </svg>
    );
  }
  if (mode === "walk") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="13" cy="5.2" r="1.7" />
        <path d="M12.2 8.2 10.4 13.2 13.2 15.4 11.2 20.2M10.4 13.2 14.6 14.8 16.8 19.6M12.2 9.4 8.4 11.2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="14.2" cy="5.2" r="1.7" />
      <path d="M13.2 8.2 9.6 12.4 12.4 14.8 9.2 19.8M9.6 12.4 15.2 13.6 18.2 18.4M13.2 9.2 8.2 8.4M4.2 7.2h2.4M4.2 10.2h3" />
    </svg>
  );
}

function usableSpeech(text: string) {
  const said = text.replace(/\s+/g, " ").trim();
  if (said.length < 2) return "";
  if (/amara\.org|legendas pela|inscreva-se|thanks for watching|thank you for watching|subt[ií]tulos|www\./i.test(said)) {
    return "";
  }
  return said;
}

function downsample(chunks: Float32Array[], fromRate: number) {
  const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
  if (!length) return new Float32Array();
  const merged = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  if (fromRate === 16000) return merged;
  const ratio = fromRate / 16000;
  const out = new Float32Array(Math.max(1, Math.floor(merged.length / ratio)));
  for (let index = 0; index < out.length; index += 1) {
    const pos = index * ratio;
    const left = Math.floor(pos);
    const frac = pos - left;
    const a = merged[left] ?? 0;
    const b = merged[Math.min(left + 1, merged.length - 1)] ?? a;
    out[index] = a + (b - a) * frac;
  }
  return out;
}

type EarModel = (audio: Float32Array) => Promise<string>;

let earModel: Promise<EarModel> | null = null;

function portugueseEar() {
  if (!earModel) {
    earModel = importModule(EAR_SCRIPT)
      .then(async (mod) => {
        const loaded = mod as {
          pipeline: (
            task: string,
            model: string,
          ) => Promise<(audio: Float32Array, options: { language: string; task: string }) => Promise<{ text?: string }>>;
          env: { allowLocalModels: boolean; useBrowserCache: boolean };
        };
        loaded.env.allowLocalModels = false;
        loaded.env.useBrowserCache = true;
        const run = await loaded.pipeline("automatic-speech-recognition", "Xenova/whisper-tiny");
        return async (audio: Float32Array) => {
          const result = await run(audio, { language: "portuguese", task: "transcribe" });
          return result.text ?? "";
        };
      })
      .catch((error: unknown) => {
        earModel = null;
        throw error;
      });
  }
  return earModel;
}

function recognition() {
  const host = window as Window & {
    SpeechRecognition?: new () => SpeechListener;
    webkitSpeechRecognition?: new () => SpeechListener;
  };
  const Ctor = host.SpeechRecognition ?? host.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function CharacterStage() {
  const { cast } = useScene();
  const { user } = useWatched();
  const stageRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ dx: number; dy: number; handle: HTMLElement } | null>(null);
  const viewerRef = useRef<LiveViewer | null>(null);
  const hearRef = useRef<SpeechListener | null>(null);
  const turnsRef = useRef<Turn[]>([]);
  const busyRef = useRef(false);
  const mutedRef = useRef(false);
  const micOnRef = useRef(false);
  const pauseHearRef = useRef(false);
  const askRef = useRef<(text: string) => void>(() => undefined);
  const motionRef = useRef<"run" | "walk" | "idle">("run");
  const greetRef = useRef(false);
  const draftRef = useRef("");
  const quietTimer = useRef(0);
  const hearToken = useRef(0);
  const lastSaid = useRef("");
  const localOn = useRef(false);
  const earAudioRef = useRef<AudioContext | null>(null);
  const localStopRef = useRef<(() => void) | null>(null);
  const earStarting = useRef(false);
  const switchLocalRef = useRef<() => void>(() => undefined);
  const [failed, setFailed] = useState("");
  const [muted, setMuted] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [hearing, setHearing] = useState(false);
  const [motion, setMotion] = useState<"run" | "walk" | "idle">("run");
  const [place, setPlace] = useState<Place | null>(null);
  const [dragging, setDragging] = useState(false);
  const figure: Figure = cast ? figureFor(cast.slug, cast.movieId) : figures.adventurer;

  useEffect(() => {
    const stage = stageRef.current;
    const saved = readPlace();
    if (!stage || !saved) return;
    const rect = stage.getBoundingClientRect();
    setPlace(clampPlace(saved.x, saved.y, rect.width, rect.height));
  }, []);

  useEffect(() => {
    const fit = () => {
      const stage = stageRef.current;
      if (!stage) return;
      setPlace((current) => {
        if (!current) return current;
        const rect = stage.getBoundingClientRect();
        const next = clampPlace(current.x, current.y, rect.width, rect.height);
        if (next.x === current.x && next.y === current.y) return current;
        try {
          localStorage.setItem(PLACE_KEY, JSON.stringify(next));
        } catch {
          /* sessão privada */
        }
        return next;
      });
    };
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    setFailed("");
    ensureViewer()
      .then(() => {
        if (disposed || !hostRef.current) return;
        const viewer = document.createElement("model-viewer") as LiveViewer;
        viewer.setAttribute("src", figure.src);
        viewer.setAttribute("alt", figure.label);
        viewer.setAttribute("autoplay", "");
        viewer.setAttribute("shadow-intensity", "0.8");
        viewer.setAttribute("interaction-prompt", "none");
        viewer.style.display = "block";
        viewer.style.width = "100%";
        viewer.style.height = "100%";
        viewer.style.background = "transparent";
        viewer.addEventListener("load", () => {
          const names = viewer.availableAnimations ?? [];
          const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          const clip = clipNamed(names, greetRef.current ? ["wave"] : calm ? ["idle"] : motionWords(motionRef.current));
          if (clip) viewer.animationName = clip;
        });
        viewer.addEventListener("error", () => {
          if (!disposed) setFailed("modelo");
        });
        viewerRef.current = viewer;
        hostRef.current.replaceChildren(viewer);
      })
      .catch(() => {
        if (!disposed) setFailed("script");
      });
    return () => {
      disposed = true;
      viewerRef.current = null;
      host.replaceChildren();
    };
  }, [figure.src, figure.label]);

  useEffect(() => {
    return () => {
      micOnRef.current = false;
      localStopRef.current?.();
      hearRef.current?.stop();
      haltVoice();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    if (sessionStorage.getItem(WELCOME_KEY) === user) return;
    let cancelled = false;
    void whenVoices().then(() => {
      if (cancelled || mutedRef.current) return;
      sessionStorage.setItem(WELCOME_KEY, user);
      greetRef.current = true;
      gesture(["wave"]);
      speak(greeting(user), () => {
        greetRef.current = false;
        gesture(motionWords(motionRef.current));
      });
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  function gesture(words: string[]) {
    const viewer = viewerRef.current;
    const names = viewer?.availableAnimations ?? [];
    const clip = clipNamed(names, words);
    if (viewer && clip) viewer.animationName = clip;
  }

  function stopHearing() {
    pauseHearRef.current = true;
    setHearing(false);
    try {
      hearRef.current?.stop();
    } catch {
      /* já estava parado */
    }
  }

  function ensureListener() {
    if (hearRef.current) return hearRef.current;
    const listener = recognition();
    if (!listener) return null;
    listener.lang = "pt-PT";
    listener.interimResults = true;
    listener.continuous = true;
    listener.onspeechstart = () => {
      if (micOnRef.current) setHearing(true);
    };
    listener.onspeechend = () => setHearing(false);
    const commitDraft = (text: string) => {
      const said = text.trim();
      window.clearTimeout(quietTimer.current);
      draftRef.current = "";
      setHearing(false);
      if (said.length < 2 || !micOnRef.current || pauseHearRef.current) return;
      if (said === lastSaid.current) return;
      lastSaid.current = said;
      window.setTimeout(() => {
        if (lastSaid.current === said) lastSaid.current = "";
      }, 2500);
      void askRef.current(said);
    };
    listener.onresult = (event) => {
      if (!micOnRef.current || pauseHearRef.current) return;
      let finalText = "";
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const piece = event.results[index][0].transcript.trim();
        if (!piece) continue;
        if (event.results[index].isFinal) finalText = `${finalText} ${piece}`.trim();
        else interim = `${interim} ${piece}`.trim();
      }
      if (finalText) {
        commitDraft(finalText);
        return;
      }
      if (!interim) return;
      draftRef.current = interim;
      setHearing(true);
      window.clearTimeout(quietTimer.current);
      quietTimer.current = window.setTimeout(() => commitDraft(draftRef.current), 800);
    };
    listener.onerror = (event) => {
      const code = event.error ?? "";
      if (code === "network" || code === "service-not-allowed") {
        switchLocalRef.current();
        return;
      }
      if (code === "not-allowed" || code === "audio-capture") {
        micOnRef.current = false;
        setMicReady(false);
        setHearing(false);
        return;
      }
      if (code === "language-not-supported" && listener.lang !== "pt-BR") {
        listener.lang = "pt-BR";
      }
    };
    listener.onend = () => {
      setHearing(false);
      const pending = draftRef.current.trim();
      if (pending) commitDraft(pending);
      const token = hearToken.current;
      window.setTimeout(() => {
        if (token !== hearToken.current || !micOnRef.current || pauseHearRef.current || localOn.current) return;
        try {
          listener.start();
        } catch {
          /* a sessão anterior ainda está a fechar */
        }
      }, 400);
    };
    hearRef.current = listener;
    return listener;
  }

  function beginListen() {
    const listener = ensureListener();
    if (!listener) return false;
    try {
      listener.start();
      return true;
    } catch {
      return micOnRef.current;
    }
  }

  function resumeHearing() {
    window.setTimeout(() => {
      if (!micOnRef.current) return;
      pauseHearRef.current = false;
      if (localOn.current) return;
      beginListen();
    }, localOn.current ? 700 : 350);
  }

  async function transcribeClip(audio: Float32Array) {
    try {
      const ear = await portugueseEar();
      const said = usableSpeech(await ear(audio));
      if (said && micOnRef.current) void askRef.current(said);
    } catch {
      /* o modelo local falhou; o próximo trecho tenta outra vez */
    }
  }

  async function startLocalEar() {
    if (localStopRef.current || earStarting.current) return;
    earStarting.current = true;
    localOn.current = true;
    try {
      sessionStorage.removeItem(EAR_KEY);
    } catch {
      /* sessão privada */
    }
    void portugueseEar().catch(() => undefined);
    const openMic = () =>
      navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      });
    let stream: MediaStream;
    try {
      stream = await openMic();
    } catch {
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      if (!micOnRef.current) {
        earStarting.current = false;
        localOn.current = false;
        return;
      }
      try {
        stream = await openMic();
      } catch {
        earStarting.current = false;
        localOn.current = false;
        micOnRef.current = false;
        setMicReady(false);
        setHearing(false);
        return;
      }
    }
    if (!micOnRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      earStarting.current = false;
      localOn.current = false;
      return;
    }
    const audio = new AudioContext();
    earAudioRef.current = audio;
    await audio.resume();
    const source = audio.createMediaStreamSource(stream);
    const processor = audio.createScriptProcessor(4096, 1, 1);
    const sink = audio.createGain();
    sink.gain.value = 0;
    source.connect(processor);
    processor.connect(sink);
    sink.connect(audio.destination);
    let chunks: Float32Array[] = [];
    let voiced = false;
    let silence = 0;
    let voicedFor = 0;
    const flush = () => {
      const taken = chunks;
      chunks = [];
      voiced = false;
      silence = 0;
      voicedFor = 0;
      setHearing(false);
      const clip = downsample(taken, audio.sampleRate);
      if (clip.length < 6400) return;
      void transcribeClip(clip);
    };
    processor.onaudioprocess = (event) => {
      if (!micOnRef.current) return;
      if (pauseHearRef.current) {
        chunks = [];
        voiced = false;
        silence = 0;
        voicedFor = 0;
        return;
      }
      const data = event.inputBuffer.getChannelData(0);
      let sum = 0;
      for (let index = 0; index < data.length; index += 1) sum += data[index] * data[index];
      const rms = Math.sqrt(sum / data.length);
      const step = data.length / audio.sampleRate;
      if (rms > 0.01) {
        voiced = true;
        silence = 0;
        voicedFor += step;
        chunks.push(new Float32Array(data));
        setHearing(true);
        if (voicedFor > 12) flush();
        return;
      }
      if (!voiced) return;
      silence += step;
      chunks.push(new Float32Array(data));
      if (silence > 0.75) flush();
    };
    localStopRef.current = () => {
      processor.onaudioprocess = null;
      processor.disconnect();
      source.disconnect();
      stream.getTracks().forEach((track) => track.stop());
      void audio.close();
      localStopRef.current = null;
      localOn.current = false;
      earAudioRef.current = null;
    };
    earStarting.current = false;
  }

  function switchToLocal() {
    if (localOn.current || !micOnRef.current) return;
    hearToken.current += 1;
    try {
      hearRef.current?.stop();
    } catch {
      /* já estava parado */
    }
    void startLocalEar();
  }

  function ask() {
    return;
  }

  askRef.current = ask;
  switchLocalRef.current = switchToLocal;

  function toggleMic() {
    if (micOnRef.current) {
      if (earAudioRef.current?.state === "suspended") {
        primeAudio();
        void earAudioRef.current.resume();
        return;
      }
      hearToken.current += 1;
      micOnRef.current = false;
      pauseHearRef.current = false;
      draftRef.current = "";
      window.clearTimeout(quietTimer.current);
      localStopRef.current?.();
      setMicReady(false);
      setHearing(false);
      try {
        hearRef.current?.stop();
      } catch {
        /* já estava parado */
      }
      return;
    }
    haltVoice();
    primeAudio();
    try {
      sessionStorage.removeItem(EAR_KEY);
    } catch {
      /* sessão privada */
    }
    hearToken.current += 1;
    micOnRef.current = true;
    pauseHearRef.current = false;
    if (!recognition()) {
      setMicReady(true);
      void startLocalEar();
      return;
    }
    const started = beginListen();
    if (started) {
      setMicReady(true);
      return;
    }
    const askDevice = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);
    if (!askDevice) {
      micOnRef.current = false;
      setMicReady(false);
      return;
    }
    void askDevice({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
        if (!micOnRef.current) return;
        pauseHearRef.current = false;
        if (beginListen()) setMicReady(true);
        else {
          micOnRef.current = false;
          setMicReady(false);
        }
      })
      .catch(() => {
        micOnRef.current = false;
        setMicReady(false);
      });
  }

  function escolher(mode: "run" | "walk" | "idle") {
    motionRef.current = mode;
    setMotion(mode);
    gesture(motionWords(mode));
  }

  function onDragStart(event: React.PointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button")) return;
    const handle = (event.target as HTMLElement).closest(".cast-drag, .cast-note");
    const stage = stageRef.current;
    if (!handle || !stage) return;
    const rect = stage.getBoundingClientRect();
    dragRef.current = {
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
      handle: handle as HTMLElement,
    };
    setDragging(true);
    (handle as HTMLElement).setPointerCapture(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  }

  function onDragMove(event: React.PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    const stage = stageRef.current;
    if (!drag || !stage) return;
    const rect = stage.getBoundingClientRect();
    setPlace(clampPlace(event.clientX - drag.dx, event.clientY - drag.dy, rect.width, rect.height));
  }

  function onDragEnd(event: React.PointerEvent<HTMLElement>) {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    setPlace((current) => {
      if (current) {
        try {
          localStorage.setItem(PLACE_KEY, JSON.stringify(current));
        } catch {
          /* sessão privada */
        }
      }
      return current;
    });
    const handle = (event.target as HTMLElement).closest(".cast-drag, .cast-note") as HTMLElement | null;
    if (handle?.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  }

  function toggleMute() {
    setMuted((current) => {
      const next = !current;
      mutedRef.current = next;
      if (next) haltVoice();
      return next;
    });
  }

  return (
    <aside
      ref={stageRef}
      className={dragging ? "cast-stage is-dragging" : "cast-stage"}
      style={place ? { left: place.x, top: place.y, bottom: "auto" } : undefined}
      aria-label="Figura que conversa contigo. Arrasta para mudar de lugar."
      onPointerDownCapture={onDragStart}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
      onPointerCancel={onDragEnd}
    >
      {failed ? (
        <p className="cast-note">A figura não carregou.</p>
      ) : (
        <div className="cast-figure">
          <div ref={hostRef} className="cast-host" />
          <div className="cast-drag" role="button" aria-label="Arrastar personagem" />
        </div>
      )}
      <div className="cast-tools">
        <button
          type="button"
          className="cast-mute"
          aria-pressed={muted}
          aria-label={muted ? "Ativar voz do personagem" : "Mutar personagem"}
          onClick={toggleMute}
        >
          {muted ? "🔇" : "🔈"}
        </button>
        <div className="cast-moves" role="group" aria-label="Movimento do personagem">
          {(
            [
              ["run", "Correr"],
              ["walk", "Andar"],
              ["idle", "Parado"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              className={motion === mode ? "cast-move is-on" : "cast-move"}
              aria-pressed={motion === mode}
              aria-label={label}
              title={label}
              onClick={() => escolher(mode)}
            >
              <MoveIcon mode={mode} />
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
