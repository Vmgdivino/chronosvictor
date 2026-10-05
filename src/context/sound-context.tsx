"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

const STORAGE_KEY = "chronosvictor.muted.v1";
const CHANGE_EVENT = "chronosvictor-sound";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

function readMuted() {
  return localStorage.getItem(STORAGE_KEY) === "1";
}

function getServerSnapshot() {
  return false;
}

const SoundContext = createContext<{ muted: boolean; toggle: () => void } | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const muted = useSyncExternalStore(subscribe, readMuted, getServerSnapshot);
  const toggle = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, readMuted() ? "0" : "1");
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);
  const value = useMemo(() => ({ muted, toggle }), [muted, toggle]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error("useSound precisa estar dentro de SoundProvider.");
  return context;
}
