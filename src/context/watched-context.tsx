"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "chronosvictor.accounts.v1";
const CHANGE_EVENT = "chronosvictor-accounts";
const SERVER_SNAPSHOT = JSON.stringify({ booted: false, session: null, watched: [] as string[] });

type UserRecord = {
  name: string;
  salt: string;
  hash: string;
  watched: string[];
};

type AccountStore = {
  session: string | null;
  users: Record<string, UserRecord>;
};

type AuthResult = { ok: true } | { ok: false; message: string };

type WatchedContextValue = {
  ready: boolean;
  user: string | null;
  watched: Set<string>;
  isWatched: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
  login: (username: string, password: string) => Promise<AuthResult>;
  register: (username: string, password: string) => Promise<AuthResult>;
  logout: () => void;
};

const WatchedContext = createContext<WatchedContextValue | null>(null);

function emptyStore(): AccountStore {
  return { session: null, users: {} };
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

function readStore(): AccountStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyStore();
    const record = parsed as Partial<AccountStore>;
    const users = record.users && typeof record.users === "object" ? record.users : {};
    const session = typeof record.session === "string" ? record.session : null;
    return { session, users: users as Record<string, UserRecord> };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: AccountStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function snapshotOf(store: AccountStore) {
  const watched = store.session ? (store.users[store.session]?.watched ?? []) : [];
  return JSON.stringify({ booted: true, session: store.session, watched });
}

function getClientSnapshot() {
  return snapshotOf(readStore());
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function accountKey(value: string) {
  return normalizeName(value).toLocaleLowerCase();
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(digest));
}

function createSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

function validate(username: string, password: string): AuthResult | null {
  if (accountKey(username).length < 3) {
    return { ok: false, message: "Use um nome com pelo menos 3 letras." };
  }
  if (password.length < 4) {
    return { ok: false, message: "A senha precisa de pelo menos 4 caracteres." };
  }
  return null;
}

export function WatchedProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const snapshot = useMemo(() => {
    const parsed = JSON.parse(raw) as { booted: boolean; session: string | null; watched: string[] };
    return {
      booted: parsed.booted,
      session: parsed.session,
      watched: new Set(parsed.watched.filter((id) => typeof id === "string")),
    };
  }, [raw]);

  const login = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    const invalid = validate(username, password);
    if (invalid) return invalid;
    const key = accountKey(username);
    const store = readStore();
    const user = store.users[key];
    if (!user) return { ok: false, message: "Não há sessão com esse nome. Crie uma conta." };
    const hash = await hashPassword(password, user.salt);
    if (hash !== user.hash) return { ok: false, message: "Nome ou senha não conferem." };
    store.session = key;
    writeStore(store);
    return { ok: true };
  }, []);

  const register = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    const invalid = validate(username, password);
    if (invalid) return invalid;
    const key = accountKey(username);
    const store = readStore();
    if (store.users[key]) return { ok: false, message: "Esse nome já tem uma sessão. Entre com a senha." };
    const salt = createSalt();
    const hash = await hashPassword(password, salt);
    store.users[key] = {
      name: normalizeName(username),
      salt,
      hash,
      watched: [],
    };
    store.session = key;
    writeStore(store);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    const store = readStore();
    store.session = null;
    writeStore(store);
  }, []);

  const toggle = useCallback((id: string) => {
    const store = readStore();
    if (!store.session) return;
    const user = store.users[store.session];
    if (!user) return;
    user.watched = user.watched.includes(id)
      ? user.watched.filter((item) => item !== id)
      : [...user.watched, id];
    writeStore(store);
  }, []);

  const clear = useCallback(() => {
    const store = readStore();
    if (!store.session) return;
    const user = store.users[store.session];
    if (!user) return;
    user.watched = [];
    writeStore(store);
  }, []);

  const value = useMemo<WatchedContextValue>(() => {
    const store = typeof window === "undefined" ? emptyStore() : readStore();
    const displayName = snapshot.session ? store.users[snapshot.session]?.name ?? snapshot.session : null;
    return {
      ready: snapshot.booted,
      user: displayName,
      watched: snapshot.watched,
      isWatched: (id: string) => snapshot.watched.has(id),
      toggle,
      clear,
      login,
      register,
      logout,
    };
  }, [snapshot, toggle, clear, login, register, logout]);

  return <WatchedContext.Provider value={value}>{children}</WatchedContext.Provider>;
}

export function useWatched() {
  const context = useContext(WatchedContext);
  if (!context) {
    throw new Error("useWatched precisa estar dentro de WatchedProvider.");
  }
  return context;
}
