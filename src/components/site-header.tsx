"use client";

import { catalogProgress } from "@/lib/progress";
import { franchises } from "@/lib/franchises";
import { useWatched } from "@/context/watched-context";
import { syncRememberedPassword } from "@/lib/remember";
import { VolumeControl } from "@/components/volume-control";
import { Clapperboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";

const links = [
  { href: "/", label: "Franquias" },
  { href: "/conquistas", label: "Conquistas" },
  { href: "/ranking", label: "Ranking" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { watched, ready, user, logout, changePassword } = useWatched();
  const catalog = catalogProgress(franchises, watched);
  const [menu, setMenu] = useState(false);
  const [nextPassword, setNextPassword] = useState("");
  const [accountName, setAccountName] = useState(user ?? "");
  const [accountError, setAccountError] = useState("");
  const [accountNotice, setAccountNotice] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08090d]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
            <Clapperboard className="h-4 w-4" aria-hidden />
          </span>
          <span className="truncate font-display text-base leading-none tracking-tight sm:text-lg">
            <span className="hidden min-[420px]:inline">Chronos</span>
            <span className="text-gold">Victor</span>
          </span>
        </Link>

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
          {ready ? (
            <p className="hidden text-xs text-muted lg:block">
              <span className="text-foreground">{catalog.done}</span> de {catalog.total} títulos
            </p>
          ) : null}
          <VolumeControl />
          <nav className="flex h-11 shrink-0 items-center rounded-full border border-white/10 bg-white/5 p-1 text-xs sm:text-sm">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-2.5 py-2 transition sm:px-3 ${
                    active ? "bg-white text-black" : "text-muted hover:text-foreground"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          {user ? (
            <div className="relative">
              <button
                type="button"
                aria-expanded={menu}
                aria-haspopup="dialog"
                onClick={() => {
                  setMenu((open) => !open);
                  setAccountName(user);
                  setAccountError("");
                  setAccountNotice("");
                }}
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/10 px-2.5 text-sm text-muted transition hover:text-white sm:px-3"
              >
                <span className="hidden max-w-24 truncate text-foreground sm:inline">{user}</span>
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only">Conta</span>
              </button>
              {menu ? (
                <div className="absolute right-0 top-12 z-50 w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl border border-white/10 bg-[#0c0e14]/95 p-4 shadow-2xl backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.18em] text-gold">Nova senha</p>
                  <form
                    className="mt-3 space-y-3"
                    onSubmit={async (event: FormEvent) => {
                      event.preventDefault();
                      setSaving(true);
                      setAccountError("");
                      setAccountNotice("");
                      const result = await changePassword(accountName, nextPassword);
                      setSaving(false);
                      if (!result.ok) {
                        setAccountError(result.message);
                        return;
                      }
                      syncRememberedPassword(accountName, nextPassword);
                      setNextPassword("");
                      setAccountNotice("Senha atualizada.");
                    }}
                  >
                    <input
                      value={accountName}
                      onChange={(event) => setAccountName(event.target.value)}
                      autoComplete="username"
                      aria-label="Nome da conta"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none ring-gold/40 focus:ring-2"
                    />
                    <input
                      type="password"
                      value={nextPassword}
                      onChange={(event) => setNextPassword(event.target.value)}
                      autoComplete="new-password"
                      aria-label="Nova senha"
                      placeholder="Nova senha"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none ring-gold/40 placeholder:text-white/30 focus:ring-2"
                    />
                    {accountError ? <p className="text-xs text-rose-300">{accountError}</p> : null}
                    {accountNotice ? <p className="text-xs text-emerald-300">{accountNotice}</p> : null}
                    <button
                      type="submit"
                      disabled={saving}
                      className="min-h-11 w-full rounded-full bg-gold px-3 py-2 text-sm font-semibold text-black disabled:opacity-60"
                    >
                      {saving ? "A guardar..." : "Guardar nova senha"}
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={logout}
                    className="mt-3 min-h-11 w-full rounded-full border border-white/10 px-3 py-2 text-sm text-white/80"
                  >
                    Sair
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
