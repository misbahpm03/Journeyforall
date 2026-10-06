/* Pencil marks in the margins. Drawn by hand, slightly wrong on purpose. */
const paths = {
  star: "M20 4 L23 15 L35 15 L25 22 L29 34 L20 26 L11 34 L15 22 L5 15 L17 15 Z",
  squiggle: "M2 20 C 8 4, 14 36, 20 20 S 32 4, 38 20 S 50 36, 56 18",
  sprig: "M20 38 C 20 26, 21 16, 24 4 M21 26 C 14 24, 11 19, 12 14 C 18 16, 20 20, 21 26 M22 18 C 28 15, 31 10, 30 6 C 25 8, 23 12, 22 18",
  circle: "M30 8 C 12 4, 4 18, 10 28 C 16 38, 36 36, 38 22 C 40 12, 30 6, 22 9",
};

export function Doodle({ kind, className }: { kind: keyof typeof paths; className?: string }) {
  return (
    <svg viewBox={kind === "squiggle" ? "0 0 58 40" : "0 0 40 40"} className={className} aria-hidden="true">
      <path d={paths[kind]} fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
