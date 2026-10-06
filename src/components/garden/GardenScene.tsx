"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { gift, type GardenKind } from "@/content/gift";
import { ease, seeded, spring } from "@/lib/motion";
import { Fireflies, GardenArt } from "./GardenArt";

const { objects } = gift.garden;
const needed = Math.min(gift.garden.findBeforeNote, objects.length);

/* Where each kind of thing grows. [left%, bottom%] for wide and
   tall screens; repeats of a kind shift sideways. */
const spots: Record<GardenKind, { wide: [number, number]; tall: [number, number]; depth: number }> = {
  tree: { wide: [12, 17], tall: [17, 24], depth: 0.5 },
  flower: { wide: [34, 9], tall: [16, 11], depth: 1 },
  butterfly: { wide: [55, 40], tall: [60, 47], depth: 0.8 },
  pond: { wide: [66, 8], tall: [52, 13], depth: 0.9 },
  lantern: { wide: [86, 14], tall: [82, 19], depth: 0.7 },
  moon: { wide: [80, 72], tall: [78, 84], depth: 0.15 },
};

const STARS = 90;
const BLOOMS = 14;

export function GardenScene({ onDone }: { onDone: () => void }) {
  const [found, setFound] = useState<Set<number>>(new Set());
  const [reading, setReading] = useState<number | null>(null);
  const [secretTaps, setSecretTaps] = useState(0);
  const [entering, setEntering] = useState<DOMRect | null>(null);
  const noteRef = useRef<HTMLButtonElement>(null);

  // pointer parallax: far layers barely move, near ones more
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 16 });
  const sy = useSpring(my, { stiffness: 40, damping: 16 });
  const far = useTransform(sx, (v) => v * -6);
  const mid = useTransform(sx, (v) => v * -14);
  const near = useTransform(sx, (v) => v * -26);
  const lean = useTransform(sx, (v) => v * 4);
  const farY = useTransform(sy, (v) => v * -4);

  const richness = found.size / objects.length;
  const visibleStars = Math.round(14 + richness * (STARS - 14));
  const showNote = found.size >= needed;

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setReading(null);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, []);

  const discover = (i: number) => {
    setReading(i);
    setFound((f) => new Set(f).add(i));
  };

  const kindCount: Partial<Record<GardenKind, number>> = {};

  return (
    <motion.section
      className="fixed-scene garden"
      aria-label="A small garden at night"
      initial={{ clipPath: "circle(0.5% at 50% 50%)" }}
      animate={{ clipPath: "circle(150% at 50% 50%)" }}
      transition={{ duration: 2.6, ease: ease.inOut }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      onPointerMove={(e) => {
        mx.set((e.clientX / innerWidth) * 2 - 1);
        my.set((e.clientY / innerHeight) * 2 - 1);
      }}
      style={{ ["--rich" as string]: richness }}
    >
      {/* sky */}
      <motion.div className="g-sky" style={{ x: far, y: farY }} aria-hidden="true">
        {Array.from({ length: STARS }, (_, i) => (
          <span
            key={i}
            className="g-star"
            data-on={i < visibleStars}
            style={{
              left: `${seeded(i, 21) * 100}%`,
              top: `${seeded(i, 22) * 58}%`,
              width: 1 + seeded(i, 23) * 1.8,
              height: 1 + seeded(i, 23) * 1.8,
              animationDelay: `${-seeded(i, 24) * 6}s`,
              transitionDelay: `${(i % 9) * 0.12}s`,
            }}
          />
        ))}
        <div className="g-cloud g-cloud-1 paper" />
        <div className="g-cloud g-cloud-2 paper" />
      </motion.div>

      {/* the one star that's a little too bright */}
      <button
        className="g-secret-star"
        aria-label="A small bright star"
        onClick={() => setSecretTaps((n) => n + 1)}
      />

      {/* hills */}
      <motion.svg className="g-hills g-hills-far" viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ x: far }} aria-hidden="true">
        <path d="M0 120 C 140 70, 260 90, 380 100 S 640 50, 780 80 S 940 110, 1000 90 L1000 200 L0 200 Z" />
      </motion.svg>
      <motion.svg className="g-hills g-hills-mid" viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ x: mid }} aria-hidden="true">
        <path d="M-40 140 C 120 100, 300 130, 460 118 S 760 90, 1040 130 L1040 200 L-40 200 Z" />
      </motion.svg>

      <motion.div className="g-ground" style={{ x: near }}>
        <motion.svg className="g-hills g-hills-near" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
          <path d="M-60 120 C 200 80, 420 110, 600 96 S 900 80, 1060 110 L1060 200 L-60 200 Z" />
        </motion.svg>

        {/* blooms that open as she explores */}
        {Array.from({ length: BLOOMS }, (_, i) => (
          <span
            key={i}
            className="g-tiny-bloom"
            data-on={i < Math.round(richness * BLOOMS)}
            style={{
              left: `${3 + seeded(i, 31) * 94}%`,
              bottom: `${2 + seeded(i, 32) * 13}%`,
              ["--c" as string]: ["#c99c98", "#e6dcc4", "#b9a3c4", "#d9c48f"][i % 4],
              transitionDelay: `${(i % 3) * 0.25}s`,
            }}
            aria-hidden="true"
          />
        ))}

        <motion.div className="g-grass" style={{ skewX: lean }} aria-hidden="true">
          <Grass />
        </motion.div>
      </motion.div>

      <Fireflies count={4 + found.size * 5} />

      {/* the things to find */}
      {objects.map((o, i) => {
        const n = (kindCount[o.kind] = (kindCount[o.kind] ?? -1) + 1);
        const s = spots[o.kind];
        return (
          <motion.button
            key={i}
            className={`g-object g-object-${o.kind}`}
            data-found={found.has(i)}
            data-cursor="look"
            aria-label={`${o.title}${found.has(i) ? " (found)" : ""}`}
            style={{
              ["--l" as string]: `${s.wide[0] - n * 9}%`,
              ["--b" as string]: `${s.wide[1] + n * 3}%`,
              ["--tl" as string]: `${s.tall[0] + n * 12}%`,
              ["--tb" as string]: `${s.tall[1] + n * 4}%`,
              x: s.depth > 0.6 ? near : mid,
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 + i * 0.25, duration: 1.4, ease: ease.out }}
            whileHover={{ scale: 1.06, transition: spring.lift }}
            whileTap={{ scale: 0.96 }}
            onClick={() => discover(i)}
          >
            <GardenArt kind={o.kind} />
          </motion.button>
        );
      })}

      <motion.p
        className="hand g-intro"
        initial={{ opacity: 0 }}
        animate={{ opacity: found.size ? 0 : [0, 0.75, 0.75, 0.4] }}
        transition={{ delay: found.size ? 0 : 2.6, duration: found.size ? 1 : 6 }}
      >
        {gift.garden.intro}
      </motion.p>

      <AnimatePresence>
        {showNote && !entering && (
          <motion.button
            ref={noteRef}
            className="g-note paper"
            initial={{ opacity: 0, y: 20, rotate: -14 }}
            animate={{ opacity: 1, y: 0, rotate: -6 }}
            exit={{ opacity: 0 }}
            transition={{ delay: reading === null ? 0.4 : 1.2, ...spring.paper }}
            onClick={() => setEntering(noteRef.current?.getBoundingClientRect() ?? null)}
            data-cursor="read"
          >
            <span className="hand">{gift.garden.note}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reading !== null && (
          <motion.div
            key={reading}
            className="g-card-wrap"
            onClick={() => setReading(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="g-card paper"
              role="dialog"
              aria-label={objects[reading].title}
              initial={{ y: 40, rotate: 2 }}
              animate={{ y: 0, rotate: -0.6 }}
              exit={{ y: 24 }}
              transition={spring.paper}
            >
              <p className="eyebrow">{objects[reading].title}</p>
              <p className="g-card-text">{objects[reading].text}</p>
              <span className="g-card-count hand">{found.size} / {objects.length}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {secretTaps >= 3 && (
          <motion.p
            className="hand g-secret-msg"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.9, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6 }}
            onAnimationComplete={() => setTimeout(() => setSecretTaps(-99), 4000)}
          >
            {gift.easterEggs.secretStar}
          </motion.p>
        )}
      </AnimatePresence>

      {entering && (
        <motion.div
          className="g-enter paper"
          initial={{
            clipPath: `inset(${entering.top}px ${innerWidth - entering.right}px ${innerHeight - entering.bottom}px ${entering.left}px)`,
          }}
          animate={{ clipPath: "inset(0px 0px 0px 0px)" }}
          transition={{ duration: 1.6, ease: ease.inOut }}
          onAnimationComplete={() => setTimeout(onDone, 300)}
        />
      )}
    </motion.section>
  );
}

/* A few hundred blades, generated once. */
function Grass() {
  const blades = Array.from({ length: 140 }, (_, i) => {
    const x = (i / 140) * 1000 + seeded(i, 41) * 8;
    const h = 18 + seeded(i, 42) * 34;
    const bend = (seeded(i, 43) - 0.5) * 14;
    return `M${x.toFixed(1)} 80 Q ${(x + bend * 0.4).toFixed(1)} ${(80 - h * 0.6).toFixed(1)} ${(x + bend).toFixed(1)} ${(80 - h).toFixed(1)}`;
  });
  return (
    <svg viewBox="0 0 1000 80" preserveAspectRatio="none">
      <g className="g-blades">
        {blades.map((d, i) => (
          <path key={i} d={d} className={i % 3 ? "" : "g-blade-alt"} />
        ))}
      </g>
    </svg>
  );
}
