"use client";

import { Poster } from "@/components/poster";
import { ProgressBar } from "@/components/progress-bar";
import { useWatched } from "@/context/watched-context";
import { franchises } from "@/lib/franchises";
import { formatHours } from "@/lib/format";
import { catalogProgress, franchiseProgress, getAchievements } from "@/lib/progress";
import { Award, Clapperboard, Sparkles, Timer } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function HomeView() {
  const { watched, ready } = useWatched();
  const catalog = catalogProgress(franchises, watched);
  const achievements = getAchievements(watched);
  const seniorUnlocked = achievements.filter((item) => item.tier === "senior" && item.unlocked).length;
  const proUnlocked = achievements.filter((item) => item.tier === "professional" && item.unlocked).length;
  const seniorTotal = achievements.filter((item) => item.tier === "senior").length;
  const proTotal = achievements.filter((item) => item.tier === "professional").length;

  const featured =
    franchises
      .map((franchise) => ({ franchise, progress: franchiseProgress(franchise, watched) }))
      .sort((a, b) => {
        const score = (item: typeof a) => {
          if (!ready) return 0;
          if (item.progress.percent > 0 && item.progress.percent < 100) return 2;
          if (item.progress.percent === 0) return 1;
          return 0;
        };
        return score(b) - score(a);
      })[0] ?? null;

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-gold">Em sessão</p>
          <h1 className="mt-3 max-w-xl font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl">
            As luzes baixam.
            <span className="mt-1 block text-gold">A saga, no tempo certo.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
            Universos inteiros, montados como foram vividos. A maratona fica na sua conta e reabre no mesmo frame
            quando você volta à sala.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat icon={<Clapperboard className="h-4 w-4" />} label="Filmes" value={ready ? `${catalog.done}/${catalog.total}` : "—"} />
          <Stat icon={<Timer className="h-4 w-4" />} label="Horas vistas" value={ready ? formatHours(catalog.minutes) : "—"} />
          <Stat icon={<Award className="h-4 w-4" />} label="Sagas fechadas" value={ready ? String(catalog.completed) : "—"} />
        </div>
      </section>

      {featured ? (
        <Link
          href={`/franquia/${featured.franchise.slug}`}
          className="group relative block min-h-[340px] overflow-hidden rounded-[28px] border border-white/10"
        >
          <Poster
            src={featured.franchise.backdrop}
            alt=""
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-50 transition duration-700 group-hover:scale-110"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(100deg, rgba(8,9,13,0.94) 10%, ${featured.franchise.glow} 58%, rgba(8,9,13,0.25) 100%)`,
            }}
          />
          <div className="relative flex min-h-[340px] flex-col justify-end p-6 sm:p-10">
            <p className="text-xs uppercase tracking-[0.28em]" style={{ color: featured.franchise.accent }}>
              {ready && featured.progress.done > 0 ? "Continuar cronologia" : "Começar por aqui"}
            </p>
            <h2 className="mt-2 max-w-xl font-display text-4xl sm:text-5xl">{featured.franchise.name}</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
              {featured.franchise.tagline}
            </p>
            <div className="mt-6 max-w-md">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>
                  {ready ? `${featured.progress.done}/${featured.progress.total} filmes` : "Carregando progresso"}
                </span>
                <span>{ready ? `${featured.progress.percent}%` : ""}</span>
              </div>
              <ProgressBar value={ready ? featured.progress.percent : 0} color={featured.franchise.accent} />
            </div>
          </div>
        </Link>
      ) : null}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Franquias</h2>
            <p className="mt-1 text-sm text-muted">{franchises.length} cronologias prontas para maratonar.</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {franchises.map((franchise) => {
            const progress = franchiseProgress(franchise, watched);
            return (
              <Link
                key={franchise.slug}
                href={`/franquia/${franchise.slug}`}
                className="group relative min-h-[280px] overflow-hidden rounded-3xl border border-white/10 bg-card"
              >
                <Poster
                  src={franchise.backdrop}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/15" />
                <span className="absolute inset-x-0 top-0 h-1" style={{ background: franchise.accent }} />
                <div className="relative flex min-h-[280px] flex-col justify-end p-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em]" style={{ color: franchise.accent }}>
                    {franchise.movies.length} filmes
                  </p>
                  <h3 className="mt-1 font-display text-3xl leading-none">{franchise.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-white/70">{franchise.tagline}</p>
                  <div className="mt-4">
                    <div className="mb-2 flex justify-between text-xs text-white/80">
                      <span>{ready ? `${progress.done}/${progress.total} assistidos` : "Progresso local"}</span>
                      <span>{ready ? `${progress.percent}%` : ""}</span>
                    </div>
                    <ProgressBar value={ready ? progress.percent : 0} color={franchise.accent} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="font-display text-3xl">Categorias em destaque</h2>
          <p className="mt-1 text-sm text-muted">Dois níveis de espectador, desbloqueados pelo que você assiste.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/conquistas#senior"
            className="rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/15 to-transparent p-6 transition hover:-translate-y-0.5 hover:border-gold/60"
          >
            <Award className="h-6 w-6 text-gold" />
            <h3 className="mt-4 font-display text-2xl">Sênior</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Para quem fecha cronologias inteiras. Cada franquia concluída vira uma conquista permanente.
            </p>
            <p className="mt-5 text-sm text-gold">
              {ready ? `${seniorUnlocked}/${seniorTotal} desbloqueadas` : "Ver categorias"}
            </p>
          </Link>
          <Link
            href="/conquistas#profissional"
            className="rounded-3xl border border-violet-300/30 bg-gradient-to-br from-violet-400/15 to-transparent p-6 transition hover:-translate-y-0.5 hover:border-violet-300/60"
          >
            <Sparkles className="h-6 w-6 text-violet-300" />
            <h3 className="mt-4 font-display text-2xl">Profissional</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Maratonas longas, sagas específicas e metas de catálogo. O nível de quem não pula o intervalo.
            </p>
            <p className="mt-5 text-sm text-violet-200">
              {ready ? `${proUnlocked}/${proTotal} desbloqueadas` : "Ver categorias"}
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center gap-1.5 text-gold">{icon}</div>
      <p className="mt-3 font-display text-xl leading-none">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}
