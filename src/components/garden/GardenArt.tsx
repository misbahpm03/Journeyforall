import type { GardenKind } from "@/content/gift";
import { seeded } from "@/lib/motion";

/* Small hand-drawn objects. Muted fills, a single ink line —
   closer to cut paper than to clip-art. */
export function GardenArt({ kind }: { kind: GardenKind }) {
  switch (kind) {
    case "flower":
      return (
        <svg viewBox="0 0 60 100" className="g-art g-flower">
          <path d="M30 98 C 30 80, 28 64, 31 46" stroke="#5d6b4f" strokeWidth="1.6" fill="none" />
          <path d="M30 76 C 22 72, 16 66, 18 60 C 25 62, 29 68, 30 76" fill="#56654a" />
          <g className="g-bloom">
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} cx="31" cy="34" rx="7" ry="12" transform={`rotate(${r} 31 46) translate(0 0)`} fill="#c99c98" stroke="#8d5f5c" strokeWidth="0.6" opacity="0.95" />
            ))}
            <circle cx="31" cy="46" r="5" fill="#c9ab6c" />
          </g>
        </svg>
      );
    case "butterfly":
      return (
        <svg viewBox="0 0 60 50" className="g-art g-butterfly">
          <g className="g-wings">
            <path d="M30 25 C 18 4, 2 6, 6 20 C 8 28, 20 28, 30 25 Z M30 26 C 20 30, 10 40, 18 44 C 24 46, 28 36, 30 26 Z" fill="#d7c9a5" stroke="#7c6c4c" strokeWidth="0.6" />
            <path d="M30 25 C 42 4, 58 6, 54 20 C 52 28, 40 28, 30 25 Z M30 26 C 40 30, 50 40, 42 44 C 36 46, 32 36, 30 26 Z" fill="#d7c9a5" stroke="#7c6c4c" strokeWidth="0.6" />
          </g>
          <path d="M30 16 L30 38" stroke="#3d3528" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "tree":
      return (
        <svg viewBox="0 0 120 160" className="g-art g-tree">
          <path d="M56 158 C 58 130, 54 110, 60 88 L 64 88 C 66 112, 64 132, 68 158 Z" fill="#2f2a22" />
          <path d="M60 104 C 50 96, 44 92, 38 92 M63 98 C 72 90, 80 88, 86 90" stroke="#2f2a22" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <g className="g-canopy">
            <circle cx="40" cy="74" r="30" fill="#243128" />
            <circle cx="82" cy="70" r="32" fill="#26342a" />
            <circle cx="60" cy="44" r="36" fill="#2b3a2e" />
            <path d="M34 40 C 44 24, 62 18, 78 26" stroke="#8fa07f" strokeWidth="1" fill="none" opacity="0.35" strokeLinecap="round" />
          </g>
        </svg>
      );
    case "pond":
      return (
        <svg viewBox="0 0 160 50" className="g-art g-pond">
          <ellipse cx="80" cy="25" rx="78" ry="22" fill="#172534" stroke="#2c3e4c" strokeWidth="1" />
          <ellipse cx="80" cy="25" rx="78" ry="22" fill="url(#pondShine)" />
          <ellipse className="g-ripple" cx="98" cy="22" rx="10" ry="3" fill="none" stroke="#9fb3bf" strokeWidth="0.6" />
          <ellipse cx="98" cy="22" rx="4" ry="1.6" fill="#f1ead6" opacity="0.8" />
          <defs>
            <radialGradient id="pondShine" cx="0.6" cy="0.35" r="0.6">
              <stop offset="0" stopColor="#c9d4d6" stopOpacity="0.25" />
              <stop offset="1" stopColor="#c9d4d6" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      );
    case "lantern":
      return (
        <svg viewBox="0 0 40 80" className="g-art g-lantern">
          <path d="M20 4 L20 14" stroke="#3a3328" strokeWidth="1" />
          <path d="M11 16 C 6 30, 6 46, 11 58 L 29 58 C 34 46, 34 30, 29 16 Z" fill="#e9c98b" stroke="#8a6d3d" strokeWidth="0.8" />
          <path d="M20 16 L20 58 M14 17 C 11 30, 11 44, 14 57 M26 17 C 29 30, 29 44, 26 57" stroke="#a88650" strokeWidth="0.5" fill="none" opacity="0.6" />
          <rect x="13" y="13" width="14" height="4" rx="1" fill="#3a3328" />
          <rect x="13" y="57" width="14" height="4" rx="1" fill="#3a3328" />
          <path d="M20 61 L20 78" stroke="#3a3328" strokeWidth="1" />
        </svg>
      );
    case "moon":
      return (
        <svg viewBox="0 0 80 80" className="g-art g-moon">
          <circle cx="40" cy="40" r="26" fill="#ece5cf" />
          <circle cx="32" cy="34" r="4" fill="#d9d0b6" />
          <circle cx="48" cy="48" r="6" fill="#ddd4ba" />
          <circle cx="47" cy="30" r="2.4" fill="#d9d0b6" />
        </svg>
      );
  }
}

/* Fireflies are pure CSS: each gets its own drift path and rhythm
   from a seed, so adding more costs nothing. */
export function Fireflies({ count }: { count: number }) {
  return (
    <div className="fireflies" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${4 + seeded(i, 11) * 92}%`,
            bottom: `${4 + seeded(i, 12) * 46}%`,
            ["--dx" as string]: `${(seeded(i, 13) - 0.5) * 120}px`,
            ["--dy" as string]: `${(seeded(i, 14) - 0.5) * 90}px`,
            animationDuration: `${7 + seeded(i, 15) * 9}s, ${2.4 + seeded(i, 16) * 3}s`,
            animationDelay: `${-seeded(i, 17) * 10}s, ${-seeded(i, 18) * 4}s`,
          }}
        />
      ))}
    </div>
  );
}
