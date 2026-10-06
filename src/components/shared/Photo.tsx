"use client";

import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import type { Aspect } from "@/content/gift";

/* No image yet (src === "") → a quiet paper placeholder, so the
   site looks finished before any photos are uploaded. */
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
  develop?: boolean; // starts washed-out, comes up like a print in the tray
};

export function Photo({ src, alt, aspect = "portrait", className = "", eager, tone = "paper", develop }: Props) {
  const has = !!src;
  const [loaded, setLoaded] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, amount: 0.4 });

  return (
    <div
      ref={box}
      className={`photo photo-${tone} ${className}`}
      data-develop={develop ? (seen && loaded ? "done" : "wait") : undefined}
      style={{ aspectRatio: aspectRatio[aspect] }}
    >
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
        </div>
      )}
    </div>
  );
}
