const REMEMBER_KEY = "chronosvictor.remember.v1";

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
