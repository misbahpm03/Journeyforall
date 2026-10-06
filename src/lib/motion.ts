import { useEffect, useState } from "react";

/* One place for every easing and duration, so the whole piece
   moves with the same hand. */
export const ease = {
  out: [0.22, 1, 0.36, 1] as const,      // settling paper
  inOut: [0.65, 0, 0.35, 1] as const,    // camera moves
  soft: [0.4, 0, 0.2, 1] as const,
};

export const spring = {
  paper: { type: "spring", stiffness: 260, damping: 26, mass: 0.9 } as const,
  lift: { type: "spring", stiffness: 380, damping: 30 } as const,
  slow: { type: "spring", stiffness: 70, damping: 20 } as const,
};

export const dur = {
  fade: 1.2,
  scene: 1.6,
  line: 1.4,
};

/* Deterministic "randomness" — the scrapbook looks hand-placed
   but identical on every visit. */
export function seeded(i: number, salt = 1) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* Real mouse (hover exists) vs touch. */
export function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(hover: hover) and (pointer: fine)");
    const set = () => setFine(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  return fine;
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
