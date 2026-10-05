"use client";

import { Poster } from "@/components/poster";
import { useScene } from "@/context/scene-context";
import { franchises, getFranchise } from "@/lib/franchises";
import { motionFor } from "@/lib/scene";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function CinemaBackdrop() {
  const pathname = usePathname();
  const { preview } = useScene();
  const match = pathname.match(/^\/franquia\/([^/]+)/);
  const slug = match ? decodeURIComponent(match[1]) : null;
  const franchise = slug ? getFranchise(slug) : undefined;
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (franchise || preview) return;
    const id = window.setInterval(() => setCycle((value) => value + 1), 9000);
    return () => window.clearInterval(id);
  }, [franchise, preview]);

  const roaming = franchises[cycle % franchises.length] ?? franchises[0];
  const image = franchise?.backdrop ?? preview?.image ?? roaming?.backdrop;
  const motion = franchise ? motionFor(franchise.slug) : (preview?.motion ?? motionFor(roaming?.slug ?? null));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="cinema-stage absolute inset-[-10%]">
        {image ? (
          <Poster key={image} src={image} alt="" className={`cinema-scene cinema-scene-${motion}`} />
        ) : null}
      </div>
      <div className="cinema-shade absolute inset-0" />
    </div>
  );
}
