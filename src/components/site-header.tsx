"use client";

import { SoundToggle } from "@/components/sound-toggle";
import { catalogProgress } from "@/lib/progress";
import { franchises } from "@/lib/franchises";
import { useWatched } from "@/context/watched-context";
import { Clapperboard, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Franquias" },
  { href: "/conquistas", label: "Conquistas" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { watched, ready, user, logout } = useWatched();
  const catalog = catalogProgress(franchises, watched);

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
              <span className="text-foreground">{catalog.done}</span> de {catalog.total} filmes
            </p>
          ) : null}
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
          <SoundToggle />
          {user ? (
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/10 px-2.5 text-sm text-muted transition hover:text-white sm:px-3"
            >
              <span className="hidden max-w-24 truncate text-foreground sm:inline">{user}</span>
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              <span className="sr-only">Sair</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
