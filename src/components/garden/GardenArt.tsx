import type { GardenKind } from "@/content/gift";

/* The things in the garden. Each has a "before" and an "after":
   finding it changes it (data-found on the wrapper drives the CSS).
   Fills are lit from the upper right, where the moon is. */
export function GardenArt({ kind }: { kind: GardenKind }) {
  switch (kind) {
    case "tree":
      return (
        <svg viewBox="0 0 300 380" className="g-art">
          <defs>
            <radialGradient id="canopy" cx="0.72" cy="0.25" r="0.85">
              <stop offset="0" stopColor="#3f5446" />
              <stop offset="0.45" stopColor="#253429" />
              <stop offset="1" stopColor="#141d17" />
            </radialGradient>
            {/* ragged, leafy edges instead of perfect circles */}
            <filter id="leafy" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="4" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="22" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <path d="M140 380 C 144 330, 138 290, 146 240 C 150 214, 150 196, 148 180 L 158 180 C 160 200, 160 220, 164 244 C 170 290, 162 330, 168 380 Z" fill="#221d17" />
          <path d="M150 250 C 128 228, 104 214, 84 210 M156 232 C 178 212, 204 202, 226 204" stroke="#221d17" strokeWidth="7" fill="none" strokeLinecap="round" />
          <g className="g-canopy" fill="url(#canopy)" filter="url(#leafy)">
            <ellipse cx="86" cy="178" rx="62" ry="50" />
            <ellipse cx="222" cy="172" rx="64" ry="54" />
            <ellipse cx="118" cy="112" rx="66" ry="60" />
            <ellipse cx="190" cy="98" rx="70" ry="64" />
            <ellipse cx="152" cy="52" rx="52" ry="42" />
            <ellipse cx="156" cy="190" rx="66" ry="44" />
          </g>
          <g className="g-blossom">
            {[[96, 128], [130, 70], [182, 62], [222, 120], [250, 168], [70, 188], [120, 150], [176, 140], [204, 196], [150, 36], [104, 98], [238, 214], [62, 140], [196, 92]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 3 ? 3.4 : 4.6} style={{ transitionDelay: `${i * 0.08}s` }} />
            ))}
          </g>
          <g className="g-petals">
            {[[110, 210], [190, 220], [150, 240], [230, 200], [80, 230]].map(([x, y], i) => (
              <ellipse key={i} cx={x} cy={y} rx="3.2" ry="2" style={{ animationDelay: `${0.3 + i * 0.5}s` }} />
            ))}
          </g>
        </svg>
      );
    case "flower":
      return (
        <svg viewBox="0 0 90 170" className="g-art">
          <path d="M45 170 C 45 140, 42 112, 46 80" stroke="#4f5f45" strokeWidth="2.4" fill="none" />
          <path d="M45 140 C 32 134, 24 124, 26 114 C 37 117, 44 128, 45 140" fill="#46563f" />
          <path d="M46 120 C 58 112, 66 104, 66 94 C 56 98, 48 108, 46 120" fill="#3d4c37" />
          <g className="g-bloom">
            {[0, 60, 120, 180, 240, 300].map((r, i) => (
              <g key={r} transform={`rotate(${r} 46 64)`}>
                <ellipse className="g-petal" cx="46" cy="44" rx="10" ry="19" style={{ transitionDelay: `${i * 0.07}s` }} />
              </g>
            ))}
            <circle cx="46" cy="64" r="7" fill="#d4b26a" />
          </g>
        </svg>
      );
    case "butterfly":
      return (
        <svg viewBox="0 0 90 150" className="g-art">
          <path d="M44 150 C 46 120, 40 96, 46 74" stroke="#3f4d39" strokeWidth="2" fill="none" />
          <g className="g-fly">
            <g className="g-wings">
              <path d="M45 52 C 30 26, 8 28, 13 46 C 16 56, 32 56, 45 52 Z M45 54 C 33 58, 20 70, 30 75 C 38 77, 43 65, 45 54 Z" fill="#e2d5b2" stroke="#8c7b55" strokeWidth="0.7" />
              <path d="M45 52 C 60 26, 82 28, 77 46 C 74 56, 58 56, 45 52 Z M45 54 C 57 58, 70 70, 60 75 C 52 77, 47 65, 45 54 Z" fill="#e8dcbc" stroke="#8c7b55" strokeWidth="0.7" />
            </g>
            <path d="M45 42 L45 68" stroke="#3a3226" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        </svg>
      );
    case "pond":
      return (
        <svg viewBox="0 0 360 120" className="g-art">
          <defs>
            <radialGradient id="pondWater" cx="0.62" cy="0.4" r="0.7">
              <stop offset="0" stopColor="#2a3e52" />
              <stop offset="1" stopColor="#0f1a26" />
            </radialGradient>
          </defs>
          <ellipse cx="180" cy="64" rx="170" ry="46" fill="url(#pondWater)" />
          <ellipse cx="180" cy="64" rx="170" ry="46" fill="none" stroke="rgba(160,180,170,0.12)" strokeWidth="2" />
          {[[24, 70], [60, 100], [300, 98], [340, 66], [180, 112]].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="12" ry="5" fill="#1e2722" />
          ))}
          <ellipse className="g-reflection" cx="236" cy="52" rx="20" ry="7" fill="#f1ead6" />
          <g className="g-ripples" fill="none" stroke="#a9bccb" strokeWidth="1">
            <ellipse cx="236" cy="52" rx="26" ry="8" />
            <ellipse cx="236" cy="52" rx="26" ry="8" style={{ animationDelay: "1.2s" }} />
          </g>
          <g className="g-lily">
            <ellipse cx="122" cy="72" rx="18" ry="6" fill="#3c5240" />
            <circle cx="126" cy="66" r="4" fill="#efe6d8" />
          </g>
          <path d="M22 66 C 20 40, 24 22, 30 6 M30 68 C 30 48, 34 34, 40 22 M14 68 C 12 52, 8 42, 4 34" stroke="#2d3b2a" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "lantern":
      return (
        <svg viewBox="0 0 90 220" className="g-art">
          <path d="M30 220 L30 30 C 30 16, 44 10, 56 14 C 64 17, 66 24, 66 32" stroke="#2b261f" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M66 32 L66 46" stroke="#2b261f" strokeWidth="1.4" />
          <g className="g-lamp">
            <path d="M55 48 C 49 64, 49 86, 55 102 L 77 102 C 83 86, 83 64, 77 48 Z" className="g-paper" />
            <path d="M66 48 L66 102 M59 49 C 55 64, 55 86, 59 101 M73 49 C 77 64, 77 86, 73 101" stroke="#8a6d3d" strokeWidth="0.7" fill="none" opacity="0.5" />
            <rect x="57" y="44" width="18" height="5" rx="1.5" fill="#2b261f" />
            <rect x="57" y="101" width="18" height="5" rx="1.5" fill="#2b261f" />
          </g>
        </svg>
      );
    case "moon":
      return (
        <svg viewBox="0 0 120 120" className="g-art g-moon-art">
          <circle cx="60" cy="60" r="34" fill="#ece5cf" />
          <circle cx="50" cy="52" r="5" fill="#dcd3b8" />
          <circle cx="70" cy="70" r="8" fill="#e0d7bd" />
          <circle cx="70" cy="46" r="3" fill="#dcd3b8" />
        </svg>
      );
  }
}

/* Small plants that grow where she plants them, and around
   everything she finds. Four kinds, tinted by a seed. */
export type PlantKind = 0 | 1 | 2 | 3;
const tints = ["#e0b4ae", "#ece3cc", "#b9a3c9", "#e2c98f"];

export function Plant({ kind, tint }: { kind: PlantKind; tint: number }) {
  const c = tints[tint % tints.length];
  switch (kind) {
    case 0: // bells
      return (
        <svg viewBox="0 0 40 90" className="g-plant-art">
          <path d="M20 90 C 20 60, 22 40, 30 22" stroke="#3f5039" strokeWidth="1.6" fill="none" />
          <g className="g-plant-head">
            {[[30, 22], [25, 36], [22, 50]].map(([x, y], i) => (
              <path key={i} d={`M${x} ${y} c -5 2, -6 9, -3 12 c 2 -2, 5 -2, 7 0 c 2 -4, 0 -10, -4 -12 z`} fill={c} />
            ))}
          </g>
        </svg>
      );
    case 1: // daisy
      return (
        <svg viewBox="0 0 40 90" className="g-plant-art">
          <path d="M20 90 C 18 70, 22 50, 20 30" stroke="#46573f" strokeWidth="1.6" fill="none" />
          <path d="M20 66 C 12 62, 9 56, 11 52 C 16 54, 19 59, 20 66" fill="#3f5039" />
          <g className="g-plant-head">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
              <ellipse key={r} cx="20" cy="22" rx="2.6" ry="7" fill={c} transform={`rotate(${r} 20 30)`} />
            ))}
            <circle cx="20" cy="30" r="3" fill="#d6b45f" />
          </g>
        </svg>
      );
    case 2: // tall spike
      return (
        <svg viewBox="0 0 40 120" className="g-plant-art">
          <path d="M20 120 C 20 90, 19 60, 21 18" stroke="#3f5039" strokeWidth="1.6" fill="none" />
          <g className="g-plant-head">
            {Array.from({ length: 9 }, (_, i) => (
              <circle key={i} cx={20 + (i % 2 ? 3 : -3)} cy={20 + i * 5} r={2.8 - i * 0.15} fill={c} />
            ))}
          </g>
        </svg>
      );
    default: // tuft with a glowing bud
      return (
        <svg viewBox="0 0 40 60" className="g-plant-art">
          <path d="M20 60 C 18 44, 10 34, 4 30 M20 60 C 20 44, 22 30, 20 16 M20 60 C 24 46, 32 38, 37 34" stroke="#3a4a35" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <g className="g-plant-head">
            <circle cx="20" cy="15" r="3.4" fill="#fff0c0" className="g-bud" />
          </g>
        </svg>
      );
  }
}
