"use client";

import { ProgressBar } from "@/components/progress-bar";
import { useWatched } from "@/context/watched-context";
import { formatHours } from "@/lib/format";
import { catalogProgress, getAchievements } from "@/lib/progress";
import { franchises } from "@/lib/franchises";
import type { AchievementTier } from "@/lib/types";
import { Award, Check, Lock, RotateCcw, Sparkles } from "lucide-react";

const tiers: {
  id: AchievementTier;
  title: string;
  kicker: string;
  copy: string;
  color: string;
}[] = [
  {
    id: "senior",
    title: "Sênior",
    kicker: "Cronologias completas",
    copy: "O nível de quem chega ao último cartaz da saga. Cada franquia fechada conta como uma conquista.",
    color: "#e7c36a",
  },
  {
    id: "professional",
    title: "Profissional",
    kicker: "Metas e maratonas",
    copy: "Sagas longas, cruzamentos de universos e porcentagens altas do catálogo. Aqui o intervalo é opcional.",
    color: "#c4b5fd",
  },
];

export function AchievementsView() {
  const { watched, ready, clear } = useWatched();
  const catalog = catalogProgress(franchises, watched);
  const achievements = getAchievements(watched);

  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Minhas conquistas</p>
        <h1 className="mt-3 font-display text-5xl leading-none">O que a sua maratona já provou.</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Sênior fecha universos. Profissional encara as metas longas. Tudo fica salvo neste navegador, junto com os
          filmes que você marcar.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Assistidos" value={ready ? String(catalog.done) : "—"} />
          <Metric label="Do catálogo" value={ready ? `${catalog.percent}%` : "—"} />
          <Metric label="Horas" value={ready ? formatHours(catalog.minutes) : "—"} />
          <Metric label="Franquias" value={ready ? `${catalog.completed}/${franchises.length}` : "—"} />
        </div>
      </section>

      {tiers.map((tier) => {
        const items = achievements.filter((item) => item.tier === tier.id);
        const unlocked = items.filter((item) => item.unlocked).length;
        return (
          <section key={tier.id} id={tier.id === "senior" ? "senior" : "profissional"} className="scroll-mt-24">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: tier.color }}>
                  {tier.kicker}
                </p>
                <h2 className="mt-1 flex items-center gap-2 font-display text-3xl">
                  {tier.id === "senior" ? <Award className="h-6 w-6" style={{ color: tier.color }} /> : <Sparkles className="h-6 w-6" style={{ color: tier.color }} />}
                  {tier.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-muted">{tier.copy}</p>
              </div>
              <p className="shrink-0 text-sm" style={{ color: tier.color }}>
                {ready ? `${unlocked}/${items.length}` : ""}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item) => {
                const ratio = item.target > 0 ? Math.round((Math.min(item.current, item.target) / item.target) * 100) : 0;
                return (
                  <article
                    key={item.id}
                    className={`rounded-3xl border p-5 ${
                      item.unlocked ? "border-white/15 bg-white/[0.04]" : "border-white/8 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-2xl leading-tight">{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
                      </div>
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                          item.unlocked ? "text-black" : "border border-white/10 text-white/40"
                        }`}
                        style={item.unlocked ? { background: tier.color } : undefined}
                      >
                        {item.unlocked ? <Check className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </span>
                    </div>
                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs text-white/70">
                        <span>{item.unlocked ? "Conquistada" : "Em progresso"}</span>
                        <span>
                          {ready ? `${Math.min(item.current, item.target)}/${item.target}` : "—"}
                        </span>
                      </div>
                      <ProgressBar value={ready ? ratio : 0} color={tier.color} />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <button
        type="button"
        onClick={() => {
          if (window.confirm("Apagar todos os filmes marcados como assistidos neste navegador?")) {
            clear();
          }
        }}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition hover:border-white/25 hover:text-white"
      >
        <RotateCcw className="h-4 w-4" />
        Zerar progresso
      </button>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="font-display text-2xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}
