"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useGift, useWithName } from "@/content/GiftContext";
import { useSound } from "../shared/Sound";
import { ease, spring } from "@/lib/motion";

type Phase = "dark" | "line1" | "line2" | "envelope" | "opening" | "out" | "fill";

const timeline: [Phase, number][] = [
  ["line1", 700],
  ["line2", 2300],
  ["envelope", 3900],
];

export function OpeningScene({ onOpen, onDone }: { onOpen: () => void; onDone: () => void }) {
  const gift = useGift();
  const withName = useWithName();
  const sound = useSound();
  const [phase, setPhase] = useState<Phase>("dark");
  const [fillFrom, setFillFrom] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ids = timeline.map(([p, t]) => setTimeout(() => setPhase(p), t));
    return () => ids.forEach(clearTimeout);
  }, []);

  const at = (p: Phase) => order.indexOf(phase) >= order.indexOf(p);

  const open = () => {
    if (phase !== "envelope") return;
    onOpen();
    sound.rustle();
    setPhase("opening");
    setTimeout(() => setPhase("out"), 900);
    setTimeout(() => {
      const r = cardRef.current?.getBoundingClientRect();
      if (r) {
        const { innerWidth: w, innerHeight: h } = window;
        setFillFrom(`inset(${r.top}px ${w - r.right}px ${h - r.bottom}px ${r.left}px round 3px)`);
      }
      setPhase("fill");
    }, 2100);
  };

  const opened = at("opening");

  return (
    <motion.section
      className="fixed-scene opening"
      aria-label="An envelope"
      exit={{ opacity: 1 }}
      onPointerMove={(e) => {
        e.currentTarget.style.setProperty("--mx", `${e.clientX}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY}px`);
      }}
    >
      <div className="opening-words" aria-live="polite">
        <motion.p
          className="hand opening-line1"
          initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
          animate={at("line1") && !opened ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 1.8, ease: ease.out }}
        >
          {gift.opening.line1}
        </motion.p>
        <motion.p
          className="hand opening-line2"
          initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
          animate={at("line2") && !opened ? { opacity: 0.82, y: 0, filter: "blur(0px)" } : { opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 1.8, ease: ease.out }}
        >
          {gift.opening.line2}
        </motion.p>
      </div>

      <motion.button
        className="envelope"
        onClick={open}
        disabled={!at("envelope") || opened}
        aria-label="Open the envelope"
        data-cursor="open"
        data-phase={phase}
        initial={{ opacity: 0, y: 24, rotate: -2 }}
        animate={
          phase === "out" || phase === "fill"
            ? { opacity: 1, y: 0, rotate: 0 }
            : at("envelope")
              ? { opacity: 1, y: [0, -4, 0], rotate: [-1.2, -0.4, -1.2] }
              : { opacity: 0, y: 24, rotate: -2 }
        }
        transition={
          at("envelope") && !opened
            ? { opacity: { duration: 1.6 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 7, repeat: Infinity, ease: "easeInOut" } }
            : { duration: 1.6, ease: ease.out }
        }
        whileHover={!opened ? { scale: 1.025 } : undefined}
        whileTap={!opened ? { scale: 0.98 } : undefined}
      >
        <span className="env-back" />
        <motion.span
          className="env-card paper"
          ref={cardRef}
          animate={at("out") ? { y: "-62%" } : { y: "0%" }}
          transition={{ duration: 1.3, ease: ease.inOut }}
        >
          <span className="hand">for you</span>
        </motion.span>
        <span className="env-pocket" />
        <motion.span className="env-address hand" animate={{ opacity: opened ? 0 : 0.8 }} transition={{ duration: 0.6 }}>
          {withName("for {name}")}
        </motion.span>
        <motion.span
          className="env-flap"
          style={{ zIndex: at("out") ? 1 : 5 }}
          animate={{ rotateX: opened ? 180 : 0 }}
          transition={spring.slow}
        />
        <motion.span
          className="env-seal"
          animate={opened ? { scale: 0.6, opacity: 0, y: -6 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: ease.out }}
        >
          {gift.recipientInitial || "✦"}
        </motion.span>
      </motion.button>

      <motion.p
        className="eyebrow opening-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "envelope" ? 0.45 : 0 }}
        transition={{ delay: phase === "envelope" ? 2.2 : 0, duration: 1.4 }}
        aria-hidden="true"
      >
        {gift.opening.hint}
      </motion.p>

      {phase === "fill" && fillFrom && (
        <motion.div
          className="opening-fill paper"
          initial={{ clipPath: fillFrom }}
          animate={{ clipPath: "inset(0px 0px 0px 0px round 0px)" }}
          transition={{ duration: 1.4, ease: ease.inOut }}
          onAnimationComplete={onDone}
        />
      )}
    </motion.section>
  );
}

const order: Phase[] = ["dark", "line1", "line2", "envelope", "opening", "out", "fill"];
