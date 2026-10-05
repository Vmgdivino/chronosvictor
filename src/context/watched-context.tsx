"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "chronosvictor.watched.v1";
const CHANGE_EVENT = "chronosvictor-watched";
const EMPTY = "[]";

type WatchedContextValue = {
  ready: boolean;
  watched: Set<string>;
  isWatched: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
};

const WatchedContext = createContext<WatchedContextValue | null>(null);

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

function readRaw() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

function parseIds(raw: string) {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

function getServerSnapshot() {
  return EMPTY;
}

function writeIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function WatchedProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readRaw, getServerSnapshot);
  const ids = useMemo(() => parseIds(raw), [raw]);
  const watched = useMemo(() => new Set(ids), [ids]);

  const toggle = useCallback((id: string) => {
    const current = parseIds(readRaw());
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    writeIds(next);
  }, []);

  const clear = useCallback(() => {
    writeIds([]);
  }, []);

  const value = useMemo<WatchedContextValue>(
    () => ({
      ready: true,
      watched,
      isWatched: (id: string) => watched.has(id),
      toggle,
      clear,
    }),
    [watched, toggle, clear],
  );

  return <WatchedContext.Provider value={value}>{children}</WatchedContext.Provider>;
}

export function useWatched() {
  const context = useContext(WatchedContext);
  if (!context) {
    throw new Error("useWatched precisa estar dentro de WatchedProvider.");
  }
  return context;
}
