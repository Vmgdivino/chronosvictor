"use client";

import { Poster } from "@/components/poster";
import { ProgressBar } from "@/components/progress-bar";
import { playMovie } from "@/context/sound-context";
import { useWatched } from "@/context/watched-context";
import { formatRuntime } from "@/lib/format";
import { getFranchise } from "@/lib/franchises";
import { franchiseProgress } from "@/lib/progress";
import type { WatchFilter } from "@/lib/types";
import { ArrowLeft, Check, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const filters: { id: WatchFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "watching", label: "Assistindo" },
  { id: "watched", label: "Assistidos" },
  { id: "pending", label: "Por assistir" },
];

const spotlights: Record<string, string> = {
  marvel: "mcu-endgame",
  velozes: "fast-7",
  "star-wars": "sw-anh",
  dceu: "dceu-ww",
  "harry-potter": "hp-1",
  "terra-media": "lotr-1",
  jurassic: "jp-1",
  "indiana-jones": "indy-raiders",
  "missao-impossivel": "mi-6",
  "john-wick": "wick-1",
  "007-craig": "bond-skyfall",
  matrix: "mx-1",
  "planeta-dos-macacos": "apes-1",
  piratas: "potc-1",
  "mad-max": "max-fury",
  "jogos-vorazes": "hg-1",
  monsterverse: "mv-godzilla",
  duna: "dune-1",
  avatar: "av-1",
  "batman-nolan": "bm-2",
  alien: "al-1",
};

function inkFor(accent: string) {
  return accent === "#ffe81f" ? "#1a1604" : "#ffffff";
}

export function FranchiseView({ slug }: { slug: string }) {
  const franchise = getFranchise(slug);
  const { ready, watched, watching, toggle, toggleWatching } = useWatched();
  const [filter, setFilter] = useState<WatchFilter>("all");

  if (!franchise) return null;

  const progress = franchiseProgress(franchise, watched);
  const ink = inkFor(franchise.accent);
  const spotlight =
    franchise.movies.find((movie) => movie.id === spotlights[franchise.slug]) ?? franchise.movies[0];
  const watchingCount = franchise.movies.filter((movie) => watching.has(movie.id)).length;
  const visible = franchise.movies.filter((movie) => {
    const seen = watched.has(movie.id);
    const started = watching.has(movie.id);
    if (filter === "watching") return started;
    if (filter === "watched") return seen;
    if (filter === "pending") return !seen;
    return true;
  });

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10">
        <Poster
          src={franchise.backdrop}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-2xl"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(105deg, rgba(8,9,13,0.92) 8%, ${franchise.glow} 70%, rgba(8,9,13,0.55))`,
          }}
        />
        <div className="relative grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_11rem] lg:items-end">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-white/70 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Franquias
            </Link>
            <p className="mt-5 text-[11px] uppercase tracking-[0.28em]" style={{ color: franchise.accent }}>
              Ordem da história
            </p>
            <h1 className="mt-2 font-display text-4xl leading-none sm:text-6xl">{franchise.name}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
              {franchise.description}
            </p>
            <p className="mt-3 max-w-2xl text-sm text-gold/90">{franchise.orderNote}</p>
            <div className="mt-6 max-w-md">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>
                  {ready ? `${progress.done} de ${progress.total} títulos` : "Progresso da sua conta"}
                </span>
                <span className="font-medium">{ready ? `${progress.percent}%` : "—"}</span>
              </div>
              <ProgressBar value={ready ? progress.percent : 0} color={franchise.accent} className="h-2" />
            </div>
          </div>
          <Poster
            src={spotlight?.poster ?? franchise.backdrop}
            alt={`Cartaz de ${spotlight?.title ?? franchise.name}`}
            className="mx-auto h-64 w-44 rounded-2xl object-cover shadow-2xl ring-1 ring-white/20 lg:mx-0"
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar cronologia">
          {filters.map((item) => {
            const count =
              item.id === "watched"
                ? progress.done
                : item.id === "watching"
                  ? watchingCount
                  : item.id === "pending"
                    ? progress.total - progress.done
                    : progress.total;
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(item.id)}
                className={`min-h-11 rounded-full px-4 py-2 text-sm transition ${
                  active ? "text-black" : "border border-white/10 bg-white/5 text-white/75 hover:text-white"
                }`}
                style={active ? { background: franchise.accent, color: ink } : undefined}
              >
                {item.label}
                <span className={`ml-2 text-xs ${active ? "opacity-70" : "text-white/40"}`}>
                  {ready ? count : ""}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-muted">
          {visible.length} {visible.length === 1 ? "título nesta lista" : "títulos nesta lista"}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-muted">
          {filter === "watching"
            ? "Nenhum filme em andamento. Use Comecei a assistir quando a sessão começar."
            : filter === "watched"
              ? "Nenhum filme marcado ainda. A cronologia inteira continua à sua espera."
              : "Você já assistiu a todos os filmes deste filtro."}
        </p>
      ) : (
        <div className="relative">
          <div className="pointer-events-none absolute bottom-6 left-[17px] top-6 w-px bg-white/10" aria-hidden />
          <ol className="space-y-4">
          {visible.map((movie, listIndex) => {
            const index = franchise.movies.findIndex((item) => item.id === movie.id);
            const seen = watched.has(movie.id);
            const started = watching.has(movie.id);
            const showChapter = listIndex === 0 || movie.chapter !== visible[listIndex - 1]?.chapter;
            return (
              <li key={movie.id} className="relative">
                {showChapter ? (
                  <p
                    className="mb-3 ml-12 text-[11px] font-medium uppercase tracking-[0.22em]"
                    style={{ color: franchise.accent }}
                  >
                    {movie.chapter}
                  </p>
                ) : null}
                <div className="grid grid-cols-[2.25rem_1fr] gap-3">
                  <div className="flex justify-center pt-4">
                    <span
                      className="z-10 grid h-9 w-9 place-items-center rounded-full border text-xs font-semibold"
                      style={
                        seen
                          ? { background: franchise.accent, color: ink, borderColor: franchise.accent }
                          : { borderColor: "rgba(255,255,255,0.2)", background: "#08090d", color: "#fff" }
                      }
                    >
                      {index + 1}
                    </span>
                  </div>
                  <article
                    className={`rounded-2xl border bg-white/[0.03] p-3 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.05] sm:p-4 ${
                      started ? "border-gold/40 shadow-[0_0_32px_rgba(231,195,106,0.08)]" : seen ? "border-white/5" : "border-white/10"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={`Ouvir o tema de ${movie.title}`}
                        onClick={() => playMovie(movie, franchise)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            playMovie(movie, franchise);
                          }
                        }}
                        className="flex min-w-0 flex-1 cursor-pointer gap-4 rounded-xl text-left"
                      >
                      <div className={`relative h-36 w-24 shrink-0 overflow-hidden rounded-xl ${seen ? "opacity-60" : ""}`}>
                        <Poster src={movie.poster} alt={`Pôster de ${movie.title}`} className="h-full w-full object-cover" />
                        {seen ? (
                          <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-400 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
                            <Check className="h-3 w-3" />
                            Assistido
                          </span>
                        ) : started ? (
                          <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
                            <Play className="h-3 w-3 fill-current" />
                            Na tela
                          </span>
                        ) : null}
                      </div>
                      <div className={`min-w-0 flex-1 ${seen ? "opacity-70" : ""}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display text-2xl leading-tight">{movie.title}</h2>
                          {movie.kind === "series" ? (
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
                              Série
                            </span>
                          ) : null}
                          <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/70">
                            {movie.year}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted">
                          {movie.setting} · {movie.kind === "series" && movie.episodes ? `${movie.episodes} episódios · ` : ""}
                          {formatRuntime(movie.runtime)}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-white/70">{movie.synopsis}</p>
                        {movie.note ? <p className="mt-2 text-xs italic text-gold/90">{movie.note}</p> : null}
                      </div>
                      </div>
                      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-56">
                        <button
                          type="button"
                          aria-pressed={started}
                          disabled={seen}
                          onClick={() => toggleWatching(movie.id)}
                          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition active:scale-[0.98] ${
                            started
                              ? "bg-gold text-black shadow-[0_0_24px_rgba(231,195,106,0.35)]"
                              : "border border-white/15 bg-white/5 text-white/85 hover:border-gold/60 hover:text-white"
                          } ${seen ? "cursor-default opacity-35" : ""}`}
                        >
                          <span
                            className={`grid h-5 w-5 place-items-center rounded-full ${
                              started ? "bg-black/15" : "bg-gold/15 text-gold"
                            }`}
                            aria-hidden
                          >
                            <Play className={`h-3 w-3 ${started ? "fill-black" : "fill-gold"}`} />
                          </span>
                          {started ? "Assistindo" : "Comecei a assistir"}
                        </button>
                        <button
                          type="button"
                          aria-pressed={seen}
                          onClick={() => toggle(movie.id)}
                          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition active:scale-[0.98] ${
                            seen
                              ? "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/40"
                              : "bg-white text-black hover:bg-white/90"
                          }`}
                        >
                          <span
                            className={`grid h-4 w-4 place-items-center rounded-[4px] border ${
                              seen ? "border-emerald-300 bg-emerald-400 text-black" : "border-black/30"
                            }`}
                            aria-hidden
                          >
                            {seen ? <Check className="h-3 w-3" /> : null}
                          </span>
                          {seen ? "Assistido" : "Marcar como assistido"}
                        </button>
                      </div>
                    </div>
                  </article>
                </div>
              </li>
            );
          })}
          </ol>
        </div>
      )}
    </div>
  );
}
