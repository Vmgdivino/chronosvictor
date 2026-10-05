"use client";

import { catalogProgress } from "@/lib/progress";
import { franchises } from "@/lib/franchises";
import { useWatched } from "@/context/watched-context";
import { Clapperboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Franquias" },
  { href: "/conquistas", label: "Conquistas" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { watched, ready } = useWatched();
  const catalog = catalogProgress(franchises, watched);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08090d]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
            <Clapperboard className="h-4 w-4" aria-hidden />
          </span>
          <span className="font-display text-lg leading-none tracking-tight">
            Chronos<span className="text-gold">Victor</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {ready ? (
            <p className="hidden text-xs text-muted sm:block">
              <span className="text-foreground">{catalog.done}</span> de {catalog.total} filmes
            </p>
          ) : null}
          <nav className="flex rounded-full border border-white/10 bg-white/5 p-1 text-sm">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 transition ${
                    active ? "bg-white text-black" : "text-muted hover:text-foreground"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
