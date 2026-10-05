"use client";

import { useRankAccounts, useWatched, type RankAccount } from "@/context/watched-context";
import { buildRanking, type RankedUser } from "@/lib/ranking";
import { Medal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

const podiumOrder = [2, 1, 3];

const medals = {
  1: { label: "Ouro", metal: "#e7c36a", height: "h-44" },
  2: { label: "Prata", metal: "#d5d8de", height: "h-32" },
  3: { label: "Bronze", metal: "#c4845a", height: "h-24" },
} as const;

function TrophyCard({ user }: { user: RankedUser }) {
  const featured = user.completed[0];
  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-3 text-left">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-white/55">
        <Trophy className="h-3.5 w-3.5" style={{ color: featured?.accent ?? "#e7c36a" }} />
        Troféu
      </p>
      {featured ? (
        <>
          <p className="mt-1 font-display text-lg leading-tight" style={{ color: featured.accent }}>
            {featured.name}
          </p>
          <p className="mt-1 text-xs text-white/60">
            {user.completed.length === 1
              ? "Cronologia completa."
              : `${user.completed.length} cronologias completas.`}
          </p>
        </>
      ) : (
        <p className="mt-1 text-sm text-white/70">Ainda na maratona. {user.done} títulos fechados.</p>
      )}
    </div>
  );
}

function PodiumSlot({ user }: { user?: RankedUser }) {
  const place = user?.place ?? 0;
  const medal = place === 1 || place === 2 || place === 3 ? medals[place] : null;
  return (
    <div className={`flex w-full flex-col justify-end ${place === 1 ? "order-2" : place === 2 ? "order-1" : "order-3"}`}>
      <div className="mb-3 text-center">
        {user && medal ? (
          <>
            <span
              className="mx-auto grid h-14 w-14 place-items-center rounded-full border"
              style={{ borderColor: medal.metal, color: medal.metal, background: `${medal.metal}22` }}
            >
              <Medal className="h-7 w-7" />
            </span>
            <p className="mt-2 font-display text-xl">{user.name}</p>
            <p className="text-xs text-white/60">
              {user.done} títulos · {user.completed.length} {user.completed.length === 1 ? "saga" : "sagas"}
            </p>
            <TrophyCard user={user} />
          </>
        ) : (
          <p className="text-sm text-white/35">Lugar em aberto</p>
        )}
      </div>
      <div
        className={`flex items-end justify-center rounded-t-2xl border border-white/10 ${medal?.height ?? "h-16"}`}
        style={{ background: medal ? `linear-gradient(180deg, ${medal.metal}33, transparent)` : "rgba(255,255,255,0.03)" }}
      >
        <span className="pb-3 font-display text-3xl" style={{ color: medal?.metal ?? "rgba(255,255,255,0.25)" }}>
          {place || "—"}
        </span>
      </div>
    </div>
  );
}

function accountKey(name: string) {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function mergeAccounts(local: RankAccount[], remote: RankAccount[]) {
  const merged = new Map<string, RankAccount>();
  for (const account of remote) merged.set(accountKey(account.name), account);
  for (const account of local) merged.set(accountKey(account.name), account);
  return [...merged.values()];
}

export function RankingView() {
  const local = useRankAccounts();
  const { user } = useWatched();
  const [remote, setRemote] = useState<RankAccount[]>([]);

  useEffect(() => {
    let ignore = false;
    const load = () => {
      fetch("/api/ranking", { cache: "no-store" })
        .then((response) => response.json())
        .then((data: { accounts?: RankAccount[] }) => {
          if (!ignore && Array.isArray(data.accounts)) setRemote(data.accounts);
        })
        .catch(() => undefined);
    };
    load();
    window.addEventListener("chronosvictor-ranking", load);
    const timer = window.setInterval(load, 15000);
    return () => {
      ignore = true;
      window.removeEventListener("chronosvictor-ranking", load);
      window.clearInterval(timer);
    };
  }, []);

  const accounts = mergeAccounts(local, remote);
  const ranking = buildRanking(accounts);
  const byPlace = new Map(ranking.map((row) => [row.place, row]));

  return (
    <div className="space-y-10">
      <section>
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Sala</p>
        <h1 className="mt-2 font-display text-4xl sm:text-6xl">Quem está à frente.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
          O pódio junta todas as contas cadastradas. Fecha uma cronologia e o troféu leva o nome dela. O ouro vai para quem tem mais sagas completas e, no desempate, mais títulos.
        </p>
      </section>

      {ranking.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-muted">
          Ainda não há contas no ranking. Entre numa conta para publicar o seu lugar.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
            {podiumOrder.map((place) => (
              <PodiumSlot key={place} user={byPlace.get(place)} />
            ))}
          </div>
          <ol className="space-y-3">
            {ranking.map((row) => {
              const active = user === row.name;
              return (
                <li
                  key={row.name}
                  className={`flex items-center gap-4 rounded-2xl border px-4 py-3 ${
                    active ? "border-gold/40 bg-gold/10" : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <span className="w-8 font-display text-2xl text-white/50">{row.place}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-xl">{row.name}</p>
                    <p className="text-xs text-white/55">
                      {row.done}/{row.total} títulos · {row.percent}%
                      {row.completed.length
                        ? ` · ${row.completed.map((item) => item.name).join(", ")}`
                        : ""}
                    </p>
                  </div>
                  <span className="text-sm text-gold">{row.points}</span>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
