"use client";

import { Film } from "lucide-react";
import { useState } from "react";

type PosterProps = {
  src: string;
  alt: string;
  className?: string;
};

export function Poster({ src, alt, className }: PosterProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`grid place-items-center bg-gradient-to-br from-zinc-700 to-zinc-950 text-zinc-400 ${className ?? ""}`}
      >
        <Film className="h-5 w-5" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
