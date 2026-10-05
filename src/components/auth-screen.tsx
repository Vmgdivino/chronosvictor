"use client";

import { useWatched } from "@/context/watched-context";
import { clearRemember, readRemember, syncRememberedPassword, writeRemember, type RememberedLogin } from "@/lib/remember";
import { Clapperboard } from "lucide-react";
import { useMemo, useState, useSyncExternalStore, type FormEvent } from "react";

type Mode = "login" | "register" | "password";

type Draft = {
  username: string;
  password: string;
  remember: boolean;
};

function subscribeRemember() {
  return () => undefined;
}

function readRememberSnapshot() {
  return JSON.stringify(readRemember());
}

export function AuthScreen() {
  const { login, register, changePassword } = useWatched();
  const rememberedRaw = useSyncExternalStore(subscribeRemember, readRememberSnapshot, () => "null");
  const remembered = useMemo(() => JSON.parse(rememberedRaw) as RememberedLogin | null, [rememberedRaw]);
  const [mode, setMode] = useState<Mode>("login");
  const [draft, setDraft] = useState<Draft | null>(null);
  const username = draft?.username ?? remembered?.username ?? "";
  const password = draft?.password ?? remembered?.password ?? "";
  const remember = draft?.remember ?? Boolean(remembered);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  function edit(partial: Partial<Draft>) {
    setDraft({ username, password, remember, ...partial });
  }

  function selectMode(next: Mode) {
    setMode(next);
    setError("");
    setNotice("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    if (mode === "password") {
      const result = await changePassword(username, password);
      setPending(false);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      syncRememberedPassword(username, password);
      setNotice("A nova senha ficou guardada nesta conta.");
      edit({ password: "" });
      return;
    }
    const action = mode === "login" ? login : register;
    const result = await action(username, password);
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    if (remember) writeRemember(username, password);
    else clearRemember();
  }

  const submitLabel =
    mode === "login" ? "Entrar na sessão" : mode === "register" ? "Criar minha sessão" : "Guardar nova senha";

  return (
    <div className="relative z-10 flex min-h-full flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-black/45 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
            <Clapperboard className="h-4 w-4" aria-hidden />
          </span>
          <span className="font-display text-lg tracking-tight">
            Chronos<span className="text-gold">Victor</span>
          </span>
        </div>
        <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-gold">Bilheteria</p>
        <h1 className="mt-2 font-display text-4xl leading-none sm:text-5xl">Sua sessão tem nome.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Entre para guardar a cronologia. Quando as luzes se acenderem de novo, a maratona continua no mesmo frame.
        </p>

        <div className="mt-6 grid grid-cols-3 rounded-full border border-white/10 bg-white/5 p-1 text-xs sm:text-sm">
          {(
            [
              ["login", "Entrar"],
              ["register", "Criar conta"],
              ["password", "Nova senha"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => selectMode(id)}
              className={`min-h-11 rounded-full px-2 py-2 ${mode === id ? "bg-white text-black" : "text-muted"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-muted">Nome</span>
            <input
              value={username}
              onChange={(event) => edit({ username: event.target.value })}
              autoComplete="username"
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-gold/40 placeholder:text-white/30 focus:ring-2"
              placeholder="Como quer ser chamado"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">{mode === "password" ? "Nova senha" : "Senha"}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => edit({ password: event.target.value })}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-gold/40 placeholder:text-white/30 focus:ring-2"
              placeholder="Mínimo de 4 caracteres"
            />
          </label>
          {mode !== "password" ? (
            <label className="flex min-h-11 items-center gap-3 text-sm text-white/80">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => edit({ remember: event.target.checked })}
                className="h-4 w-4 accent-[#e7c36a]"
              />
              Guardar login e senha neste navegador
            </label>
          ) : (
            <p className="text-sm text-muted">Escreva o nome da conta e a senha nova. A maratona continua no mesmo lugar.</p>
          )}
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {notice ? <p className="text-sm text-emerald-300">{notice}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 w-full rounded-full bg-gold px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#f2d48a] disabled:opacity-60"
          >
            {pending ? "Abrindo a sala..." : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
