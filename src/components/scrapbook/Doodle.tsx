/* Pencil marks in the margins. Drawn by hand, slightly wrong on purpose. */
const paths = {
  star: "M20 4 L23 15 L35 15 L25 22 L29 34 L20 26 L11 34 L15 22 L5 15 L17 15 Z",
  squiggle: "M2 20 C 8 4, 14 36, 20 20 S 32 4, 38 20 S 50 36, 56 18",
  sprig: "M20 38 C 20 26, 21 16, 24 4 M21 26 C 14 24, 11 19, 12 14 C 18 16, 20 20, 21 26 M22 18 C 28 15, 31 10, 30 6 C 25 8, 23 12, 22 18",
  circle: "M30 8 C 12 4, 4 18, 10 28 C 16 38, 36 36, 38 22 C 40 12, 30 6, 22 9",
};

/* Two bits of paper kept between the pages. */
export function Ticket({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 56" className={className} aria-hidden="true">
      <path d="M4 2 H116 V20 a6 6 0 0 0 0 16 V54 H4 V36 a6 6 0 0 0 0 -16 Z" fill="#e9dcc0" stroke="#c9b48e" strokeWidth="0.8" />
      <path d="M86 4 V52" stroke="#b9a37c" strokeWidth="0.8" strokeDasharray="2 3" />
      <text x="44" y="25" textAnchor="middle" fontFamily="var(--sans)" fontSize="7" letterSpacing="2.4" fill="#8a7653">ADMIT ONE</text>
      <text x="44" y="38" textAnchor="middle" fontFamily="var(--serif)" fontStyle="italic" fontSize="9" fill="#8a7653">no. 0417</text>
      <text x="101" y="31" textAnchor="middle" fontFamily="var(--sans)" fontSize="6" fill="#8a7653" transform="rotate(-90 101 29)">STUB</text>
    </svg>
  );
}

export function PressedLeaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 100" className={className} aria-hidden="true">
      <path d="M30 98 C 30 80, 30 60, 30 10" stroke="#7d6a46" strokeWidth="1.2" fill="none" />
      <path d="M30 12 C 50 26, 54 54, 30 86 C 6 54, 10 26, 30 12 Z" fill="#a39466" opacity="0.55" />
      {[24, 36, 48, 60, 72].map((y) => (
        <path key={y} d={`M30 ${y} L${44 - (y - 24) / 6} ${y - 8} M30 ${y} L${16 + (y - 24) / 6} ${y - 8}`} stroke="#7d6a46" strokeWidth="0.6" opacity="0.6" />
      ))}
    </svg>
  );
}

export function Doodle({ kind, className }: { kind: keyof typeof paths; className?: string }) {
  return (
    <svg viewBox={kind === "squiggle" ? "0 0 58 40" : "0 0 40 40"} className={className} aria-hidden="true">
      <path d={paths[kind]} fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
