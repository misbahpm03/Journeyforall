"use client";

import { createContext, useContext, useState } from "react";
import type { Aspect } from "@/content/gift";

/* Which image files actually exist is decided at build time
   (see app/page.tsx), so missing photos never 404 — they show a
   paper placeholder that tells you exactly which file to add. */
const Available = createContext<Set<string>>(new Set());
export const AvailableProvider = Available.Provider;
export const useHasFile = (src: string) => useContext(Available).has(src);

export const aspectRatio: Record<Aspect, string> = {
  portrait: "4 / 5",
  landscape: "3 / 2",
  square: "1 / 1",
};

type Props = {
  src: string;
  alt: string;
  aspect?: Aspect;
  className?: string;
  eager?: boolean;
  tone?: "paper" | "dark";
};

export function Photo({ src, alt, aspect = "portrait", className = "", eager, tone = "paper" }: Props) {
  const has = useHasFile(src);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`photo photo-${tone} ${className}`} style={{ aspectRatio: aspectRatio[aspect] }}>
      {has ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          ref={(el) => { if (el?.complete) setLoaded(true); }}
          data-loaded={loaded}
        />
      ) : (
        <div className="photo-empty" role="img" aria-label={alt}>
          <svg viewBox="0 0 60 40" aria-hidden="true">
            <path d="M4 34 L20 18 L30 27 L38 20 L56 34" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" />
            <circle cx="44" cy="10" r="3.2" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </svg>
          <span className="photo-empty-label">Your photograph</span>
          <span className="photo-empty-path">{src.replace(/^\/images\//, "")}</span>
        </div>
      )}
    </div>
  );
}
