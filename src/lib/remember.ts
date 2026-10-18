const REMEMBER_KEY = "chronosvictor.remember.v1";
const HOLD_KEY = "chronosvictor.hold-login";

export type RememberedLogin = {
  username: string;
  password: string;
};

export function readRemember(): RememberedLogin | null {
  try {
    const raw = localStorage.getItem(REMEMBER_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as Partial<RememberedLogin>;
    if (typeof record.username !== "string" || typeof record.password !== "string") return null;
    if (!record.username || !record.password) return null;
    return { username: record.username, password: record.password };
  } catch {
    return null;
  }
}

export function writeRemember(username: string, password: string) {
  const payload: RememberedLogin = { username, password };
  localStorage.setItem(REMEMBER_KEY, JSON.stringify(payload));
}

export function clearRemember() {
  localStorage.removeItem(REMEMBER_KEY);
}

export function syncRememberedPassword(username: string, password: string) {
  const saved = readRemember();
  if (!saved) return;
  if (saved.username.trim().toLocaleLowerCase() !== username.trim().toLocaleLowerCase()) return;
  writeRemember(saved.username, password);
}

export function holdLogin() {
  try {
    sessionStorage.setItem(HOLD_KEY, "1");
  } catch {
    return;
  }
}

export function releaseLogin() {
  try {
    sessionStorage.removeItem(HOLD_KEY);
  } catch {
    return;
  }
}

export function isLoginHeld() {
  try {
    return sessionStorage.getItem(HOLD_KEY) === "1";
  } catch {
    return false;
  }
}
