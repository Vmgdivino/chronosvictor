"use client";

import { useWatched } from "@/context/watched-context";
import {
  clearRemember,
  isLoginHeld,
  readRemember,
  releaseLogin,
  syncRememberedPassword,
  writeRemember,
  type RememberedLogin,
} from "@/lib/remember";
import { Clapperboard } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore, type FormEvent } from "react";

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

function sameName(a: string, b: string) {
  return a.trim().replace(/\s+/g, " ").toLocaleLowerCase() === b.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function AuthScreen() {
  const { login, register, changePassword, knownAccounts } = useWatched();
  const rememberedRaw = useSyncExternalStore(subscribeRemember, readRememberSnapshot, () => "null");
  const remembered = useMemo(() => JSON.parse(rememberedRaw) as RememberedLogin | null, [rememberedRaw]);
  const [mode, setMode] = useState<Mode>("login");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [phase, setPhase] = useState<"check" | "form">(() => (readRemember() && !isLoginHeld() ? "check" : "form"));
  const username = draft?.username ?? remembered?.username ?? "";
  const password = draft?.password ?? remembered?.password ?? "";
  const remember = draft?.remember ?? true;
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const recognized = knownAccounts.find((account) => sameName(account.name, username));

  useEffect(() => {
    if (phase !== "check") return;
    const saved = readRemember();
    if (!saved || isLoginHeld()) {
      setPhase("form");
      return;
    }
    let cancel = false;
    void login(saved.username, saved.password).then((result) => {
      if (cancel) return;
      if (!result.ok) {
        if (result.message) {
          setError("A conta está guardada, mas a senha não entrou. Pode ver a senha e tentar de novo.");
        }
        setPhase("form");
      }
    });
    return () => {
      cancel = true;
    };
  }, [phase, login]);

  function edit(partial: Partial<Draft>) {
    setDraft({ username, password, remember, ...partial });
  }

  function selectMode(next: Mode) {
    setMode(next);
    setError("");
    setNotice("");
  }

  function useKnown(name: string, savedPassword: string) {
    setMode("login");
    setError("");
    setNotice("Conta reconhecida. Entre para continuar — não precisa criar outra.");
    setShowPassword(false);
    edit({ username: name, password: savedPassword });
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
      setShowPassword(false);
      return;
    }
    releaseLogin();
    const action = mode === "login" ? login : register;
    const result = await action(username, password);
    setPending(false);
    if (!result.ok) {
      const known = knownAccounts.find((account) => sameName(account.name, username));
      if (mode === "register" && known) {
        setMode("login");
        edit({ username: known.name, password: known.password });
        setNotice("Esta conta já existe. Entre com ela — não precisa criar outra.");
        return;
      }
      setError(result.message);
      return;
    }
    if (mode === "login") {
      if (remember) writeRemember(username, password);
      else clearRemember();
    }
  }

  const submitLabel =
    mode === "login" ? "Entrar na sessão" : mode === "register" ? "Criar minha sessão" : "Guardar nova senha";
  const savedName = remembered?.username;

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
        {phase === "check" ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            A abrir a sessão{savedName ? ` de ${savedName}` : ""}. A conta já está neste aparelho.
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {remembered || knownAccounts.length
                ? "A sua conta já está guardada neste aparelho. Entre para continuar a maratona — não precisa criar outra."
                : "Entre para guardar a cronologia. Quando as luzes se acenderem de novo, a maratona continua no mesmo frame."}
            </p>

            {knownAccounts.length ? (
              <div className="mt-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Contas neste aparelho</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {knownAccounts.map((account) => (
                    <button
                      key={account.name}
                      type="button"
                      onClick={() => useKnown(account.name, account.password)}
                      className={`min-h-11 rounded-full border px-4 py-2 text-sm ${
                        recognized && sameName(recognized.name, account.name)
                          ? "border-gold bg-gold/15 text-gold"
                          : "border-white/10 text-white/80"
                      }`}
                    >
                      {account.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

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
                <span className="relative mt-1 block">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => edit({ password: event.target.value })}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-28 outline-none ring-gold/40 placeholder:text-white/30 focus:ring-2"
                    placeholder="Mínimo de 4 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gold"
                  >
                    {showPassword ? "Ocultar" : "Ver senha"}
                  </button>
                </span>
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
          </>
        )}
      </div>
    </div>
  );
}
