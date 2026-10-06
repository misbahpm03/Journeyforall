"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useGift, useWithName } from "@/content/GiftContext";
import { ease, seeded } from "@/lib/motion";
import { constellationFor } from "./constellation";
import { WriteBack } from "./WriteBack";

export type InkPoint = { x: number; y: number };

/* Seconds from the moment the sky starts. Everything is one clock. */
const T = {
  dusk: 2.6,        // paper → night
  stars: 2.4,       // background stars begin
  memories: 5,      // memory stars appear
  shape: 8,         // constellation stars
  lines: 10,        // constellation lines
  text1: 15,
  text2: 19.5,
  name: 24,
  whisper: 29,
  final: 75,        // the very faint last line, only if she stays
};

export function UniverseScene({ ink }: { ink: InkPoint[] }) {
  const gift = useGift();
  const withName = useWithName();
  const { ending, easterEggs } = gift;
  const { memories, memorySpots, shape, dateDigits } = useMemo(() => {
    const memories = [
      ...gift.scrapbook.photos.map((p) => ({ title: p.title, text: p.note, image: p.image })),
      ...gift.museum.exhibits.map((e) => ({ title: e.title, text: e.description, image: e.image })),
      ...gift.garden.objects.map((o) => ({ title: o.title, text: o.text, image: o.image })),
    ].filter((m) => m.title || m.text).slice(0, 10);
    // memory stars sit around the edges, never over the shape or the words
    const memorySpots = memories.map((_, i) => {
      const a = (i / memories.length) * Math.PI * 2 + seeded(i, 51) * 0.5;
      return { x: 50 + Math.cos(a) * (36 + seeded(i, 52) * 8), y: 34 + Math.sin(a) * (24 + seeded(i, 53) * 6) };
    });
    return {
      memories,
      memorySpots,
      shape: constellationFor(gift.recipientInitial),
      dateDigits: gift.easterEggs.importantDate.replace(/\D/g, "").split("").map(Number),
    };
  }, [gift]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = !!useReducedMotion();
  const [elapsed, setElapsed] = useState(0);
  const [shown, setShown] = useState<number | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const fromPaper = ink.length > 0;

  // one coarse clock for the HTML layer (the canvas has its own)
  useEffect(() => {
    const t0 = performance.now();
    const id = setInterval(() => setElapsed((performance.now() - t0) / 1000), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (shown === null) return;
    const id = setTimeout(() => setShown(null), 4200);
    return () => clearTimeout(id);
  }, [shown]);

  const field = useMemo(() => {
    const small = typeof window !== "undefined" && innerWidth < 700;
    const n = small ? 130 : 240;
    return Array.from({ length: n }, (_, i) => ({
      x: seeded(i, 61),
      y: seeded(i, 62),
      r: 0.35 + seeded(i, 63) ** 3 * 1.3,
      at: T.stars + Math.pow(i / n, 1.4) * 10,
      tw: 0.4 + seeded(i, 64) * 1.6,
      ph: seeded(i, 65) * 6.28,
    }));
  }, []);

  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const resize = () => {
      w = innerWidth; h = innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener("resize", resize);

    // ink drifts a little and becomes the first stars
    const inkStars = ink.map((p, i) => ({
      x0: p.x, y0: p.y,
      dx: (seeded(i, 71) - 0.5) * 60, dy: (seeded(i, 72) - 0.7) * 50,
      r: 0.5 + seeded(i, 73) * 0.9,
    }));

    const box = () => {
      const s = Math.min(w * 0.42, h * 0.3);
      const sw = shape.isLetter ? s * 0.72 : s;
      return { x: w / 2 - sw / 2, y: h * 0.36 - s / 2, sw, s };
    };

    const t0 = performance.now();
    const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

    const draw = (now: number) => {
      const t = reduced ? 60 : (now - t0) / 1000;
      const dusk = fromPaper ? clamp(t / T.dusk) : 1;
      const e = dusk * dusk * (3 - 2 * dusk);

      ctx.fillStyle = "#f3ede1";
      ctx.globalAlpha = 1;
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#070b14");
      g.addColorStop(0.6, "#0d1524");
      g.addColorStop(1, "#111a2b");
      ctx.globalAlpha = e;
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // ink → light
      for (const s of inkStars) {
        const k = e;
        const x = s.x0 + s.dx * k, y = s.y0 + s.dy * k;
        const tw = reduced ? 1 : 0.7 + 0.3 * Math.sin(t * 1.3 + s.x0);
        ctx.globalAlpha = (0.85 - 0.25 * k) * tw;
        ctx.fillStyle = k < 0.5 ? "#2a2622" : "#f6f0de";
        ctx.beginPath();
        ctx.arc(x, y, s.r * (1 + k * 0.4), 0, 6.283);
        ctx.fill();
      }

      // the sky fills in
      ctx.fillStyle = "#f4efdf";
      for (const s of field) {
        const a = clamp((t - s.at) / 2);
        if (!a) continue;
        ctx.globalAlpha = a * (reduced ? 0.7 : 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph)));
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, 6.283);
        ctx.fill();
      }

      // the constellation
      const b = box();
      const P = ([x, y]: [number, number]) => [b.x + x * b.sw, b.y + y * b.s] as const;

      // when the last line is drawn, a soft breath of light behind it
      const done = T.lines + shape.segments.length * 0.5 + 0.9;
      const pulse = reduced ? 0 : Math.exp(-((t - done - 1.2) ** 2) / 0.9) * 0.55;
      if (pulse > 0.01) {
        const cx = b.x + b.sw / 2, cy = b.y + b.s / 2;
        const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.s);
        bloom.addColorStop(0, "rgba(255,236,196,0.35)");
        bloom.addColorStop(1, "rgba(255,236,196,0)");
        ctx.globalAlpha = pulse;
        ctx.fillStyle = bloom;
        ctx.fillRect(cx - b.s, cy - b.s, b.s * 2, b.s * 2);
      }
      ctx.strokeStyle = "#f1e3c0";
      ctx.lineWidth = 0.8;
      shape.segments.forEach(([p, q], i) => {
        const k = clamp((t - T.lines - i * 0.5) / 0.9);
        if (!k) return;
        const [x1, y1] = P(p), [x2, y2] = P(q);
        ctx.globalAlpha = 0.32;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + (x2 - x1) * k, y1 + (y2 - y1) * k);
        ctx.stroke();
      });
      shape.stars.forEach((p, i) => {
        const a = clamp((t - T.shape - i * 0.22) / 1.4);
        if (!a) return;
        const [x, y] = P(p);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 10);
        glow.addColorStop(0, "rgba(255,244,214,0.55)");
        glow.addColorStop(1, "rgba(255,244,214,0)");
        ctx.globalAlpha = a;
        ctx.fillStyle = glow;
        ctx.fillRect(x - 10, y - 10, 20, 20);
        ctx.fillStyle = "#fff8e6";
        ctx.beginPath();
        ctx.arc(x, y, 1.7, 0, 6.283);
        ctx.fill();
      });

      // a tiny cluster that is really a date, read as tally marks
      if (dateDigits.length) {
        const a = clamp((t - T.lines - 4) / 3) * 0.55;
        const ox = w * 0.1, oy = h * 0.14;
        ctx.globalAlpha = a;
        ctx.fillStyle = "#f4efdf";
        dateDigits.forEach((d, col) => {
          for (let r = 0; r < Math.max(1, d); r++) {
            ctx.beginPath();
            ctx.arc(ox + col * 9, oy + r * 5.5, d === 0 ? 0.5 : 0.85, 0, 6.283);
            ctx.fill();
          }
        });
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, [ink, field, reduced, fromPaper, shape, dateDigits]);

  const after = (s: number) => reduced || elapsed >= s;

  return (
    <section className="fixed-scene universe" aria-label="The night sky">
      <canvas ref={canvas} className="universe-canvas" aria-hidden="true" />

      {memories.map((m, i) => (
        <button
          key={i}
          className="memory-star"
          data-on={after(T.memories + i * 0.6)}
          style={{ left: `${memorySpots[i].x}%`, top: `${memorySpots[i].y}%` }}
          onClick={() => setShown(i)}
          onMouseEnter={() => setShown(i)}
          aria-label={`A star: ${m.title}`}
          tabIndex={after(T.memories) ? 0 : -1}
          data-cursor=""
        />
      ))}

      {dateDigits.length > 0 && (
        <button
          className="date-cluster"
          aria-label="A small cluster of stars"
          onClick={() => setDateOpen((o) => !o)}
          tabIndex={after(T.lines + 4) ? 0 : -1}
        />
      )}

      <AnimatePresence>
        {shown !== null && (
          <motion.div
            key={shown}
            className="memory-caption"
            style={{
              left: `${memorySpots[shown].x}%`,
              top: `${memorySpots[shown].y}%`,
              ["--side" as string]: memorySpots[shown].x > 60 ? "-100%" : memorySpots[shown].x < 40 ? "0%" : "-50%",
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: ease.out }}
            role="status"
          >
            {memories[shown].image && <img className="memory-photo" src={memories[shown].image} alt="" />}
            <p className="eyebrow">{memories[shown].title}</p>
            <p>{memories[shown].text}</p>
          </motion.div>
        )}
        {dateOpen && (
          <motion.p key="date" className="date-caption hand" initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }}>
            {easterEggs.importantDate} — {easterEggs.importantDateLabel}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="universe-words">
        <Line on={after(T.text1)} className="u-line1">{ending.line1}</Line>
        <Line on={after(T.text2)} className="u-line2">{ending.line2}</Line>
        <Line on={after(T.name)} className="u-name">{withName(ending.name)}</Line>
        <Line on={after(T.whisper)} className="u-whisper hand">{ending.whisper}</Line>
      </div>

      {!reduced && after(T.whisper + 5) && <span className="u-shooting" aria-hidden="true" />}
      <WriteBack show={after(T.whisper + 6)} />

      <Line on={!reduced && elapsed >= T.final} className="u-final hand">{easterEggs.finalMessage}</Line>
    </section>
  );
}

function Line({ on, className, children }: { on: boolean; className: string; children: React.ReactNode }) {
  return (
    <motion.p
      className={className}
      initial={{ opacity: 0, filter: "blur(8px)", y: 6 }}
      animate={on ? { opacity: 1, filter: "blur(0px)", y: 0 } : { opacity: 0, filter: "blur(8px)", y: 6 }}
      transition={{ duration: 3, ease: ease.out }}
      aria-hidden={!on}
    >
      {children}
    </motion.p>
  );
}
