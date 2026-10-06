"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue,
} from "framer-motion";
import { gift } from "@/content/gift";
import { ease, withName } from "@/lib/motion";
import { Photo } from "../shared/Photo";

const { exhibits } = gift.museum;
const panels = exhibits.length + 2; // title · exhibits · exit

export function MuseumScene({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.6 });
  const x = useTransform(progress, [0, 1], ["0%", `-${((panels - 1) / panels) * 100}%`]);
  const wallX = useTransform(progress, [0, 1], ["0%", "-12%"]);

  // the spotlight drifts a little toward the pointer
  const mx = useMotionValue(0);
  const lightX = useSpring(useTransform(mx, [-1, 1], [-40, 40]), { stiffness: 40, damping: 18 });

  const [full, setFull] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(null);
      if (full !== null) return;
      if (e.key === "ArrowRight") scrollBy({ top: innerHeight, behavior: "smooth" });
      if (e.key === "ArrowLeft") scrollBy({ top: -innerHeight, behavior: "smooth" });
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [full]);

  return (
    <motion.section
      ref={ref}
      className="scene museum"
      style={{ height: `${panels * 100}dvh` }}
      aria-label={withName(gift.museum.title)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 1.6 } }}
      onPointerMove={(e) => mx.set((e.clientX / innerWidth) * 2 - 1)}
    >
      <div className="museum-stage">
        <motion.div className="museum-wall" style={{ x: wallX }} aria-hidden="true" />
        <motion.div className="museum-track" style={{ x, width: `${panels * 100}vw` }}>
          <div className="museum-panel museum-intro">
            <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.8, duration: 1.4 }}>
              a private collection
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 1.8, ease: ease.out }}>
              {withName(gift.museum.title)}
            </motion.h1>
            <motion.span className="museum-rule" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 2, duration: 1.4, ease: ease.inOut }} />
            <motion.p className="museum-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 0.75 }} transition={{ delay: 2.6, duration: 1.6 }}>
              {gift.museum.subtitle}
            </motion.p>
            <motion.p className="eyebrow museum-hint" initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 4, duration: 1.4 }} aria-hidden="true">
              scroll to walk through
            </motion.p>
          </div>

          {exhibits.map((ex, i) => (
            <Artwork key={ex.image} index={i} progress={progress} lightX={lightX} onOpen={() => setFull(i)} />
          ))}

          <div className="museum-panel museum-exit">
            <p className="hand">the end of the exhibition.</p>
            <button className="museum-door" onClick={() => setLeaving(true)} data-cursor="go">
              <span className="eyebrow">{gift.museum.exit}</span>
            </button>
          </div>
        </motion.div>
        <div className="museum-vignette" aria-hidden="true" />
      </div>

      <AnimatePresence>
        {full !== null && <FullView index={full} onClose={() => setFull(null)} />}
      </AnimatePresence>

      {leaving && (
        <motion.div className="museum-leave" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, ease: ease.inOut }}>
          <motion.span
            className="glow-point"
            initial={{ scale: 6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, duration: 1.6, ease: ease.out }}
            onAnimationComplete={() => setTimeout(onDone, 700)}
          />
        </motion.div>
      )}
    </motion.section>
  );
}

function Artwork({
  index, progress, lightX, onOpen,
}: {
  index: number;
  progress: MotionValue<number>;
  lightX: MotionValue<number>;
  onOpen: () => void;
}) {
  const ex = exhibits[index];
  // where this panel sits on the 0→1 scroll, and one step either side
  const step = 1 / (panels - 1);
  const c = (index + 1) * step;
  const light = useTransform(progress, [c - step, c - step * 0.25, c + step * 0.25, c + step], [0.08, 1, 1, 0.08]);
  const labelY = useTransform(progress, [c - step, c, c + step], [30, 0, -30]);
  const artY = useTransform(progress, [c - step, c + step], [-10, 10]);
  const shade = useTransform(light, [0.08, 1], [0.7, 0]);

  return (
    <article className={`museum-panel museum-art museum-${ex.aspect}`} aria-label={`Exhibit ${index + 1}: ${ex.title}`}>
      <div className="museum-piece">
        <motion.div className="spotlight" style={{ opacity: light, x: lightX }} aria-hidden="true" />
        <motion.button className="museum-frame" style={{ y: artY }} onClick={onOpen} data-cursor="explore" aria-label={`View ${ex.title} full screen`}>
          <motion.span className="museum-frame-shade" style={{ opacity: shade }} aria-hidden="true" />
          <Photo src={ex.image} alt={ex.alt} aspect={ex.aspect} tone="dark" eager={index === 0} />
        </motion.button>
      </div>
      <motion.div className="museum-label" style={{ opacity: light, y: labelY }}>
        <p className="eyebrow">Exhibit {String(index + 1).padStart(2, "0")}</p>
        <h2>{ex.title}</h2>
        {ex.medium && <p className="museum-medium">{ex.medium}</p>}
        <p className="museum-desc">{ex.description}</p>
      </motion.div>
    </article>
  );
}

function FullView({ index, onClose }: { index: number; onClose: () => void }) {
  const ex = exhibits[index];
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => close.current?.focus(), []);
  return (
    <motion.div
      className="museum-full"
      role="dialog"
      aria-modal="true"
      aria-label={ex.title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      onClick={onClose}
    >
      <motion.div
        className={`museum-full-img museum-full-${ex.aspect}`}
        initial={{ scale: 0.94 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.97 }}
        transition={{ duration: 0.9, ease: ease.out }}
      >
        <Photo src={ex.image} alt={ex.alt} aspect={ex.aspect} tone="dark" eager />
      </motion.div>
      <p className="museum-full-cap"><span className="eyebrow">Exhibit {String(index + 1).padStart(2, "0")}</span> &nbsp; <em>{ex.title}</em></p>
      <button ref={close} className="sb-close eyebrow" onClick={onClose}>close</button>
    </motion.div>
  );
}
