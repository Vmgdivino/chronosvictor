"use client";

import { SoundToggle } from "@/components/sound-toggle";
import { useWatched } from "@/context/watched-context";
import { Clapperboard } from "lucide-react";
import { useState, type FormEvent } from "react";

export function AuthScreen() {
  const { login, register } = useWatched();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const action = mode === "login" ? login : register;
    const result = await action(username, password);
    setPending(false);
    if (!result.ok) setError(result.message);
  }

  return (
    <div className="relative z-10 flex min-h-full flex-1 items-center justify-center px-4 py-16">
      <div className="absolute right-3 top-3 sm:right-6 sm:top-6">
        <SoundToggle />
      </div>
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
        <h1 className="mt-2 font-display text-4xl leading-none">Sua sessão tem nome.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Entre para guardar a cronologia. Quando as luzes se acenderem de novo, a maratona continua no mesmo frame.
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`rounded-full px-3 py-2 ${mode === "login" ? "bg-white text-black" : "text-muted"}`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`rounded-full px-3 py-2 ${mode === "register" ? "bg-white text-black" : "text-muted"}`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-muted">Nome</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-gold/40 placeholder:text-white/30 focus:ring-2"
              placeholder="Como quer ser chamado"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-gold/40 placeholder:text-white/30 focus:ring-2"
              placeholder="Mínimo de 4 caracteres"
            />
          </label>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-gold px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#f2d48a] disabled:opacity-60"
          >
            {pending ? "Abrindo a sala..." : mode === "login" ? "Entrar na sessão" : "Criar minha sessão"}
          </button>
        </form>
      </div>
    </div>
  );
}
