"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useGift, useWithName } from "@/content/GiftContext";
import type { GiftContent } from "@/content/gift";
import { ease } from "@/lib/motion";
import type { InkPoint } from "../universe/UniverseScene";

/* The letter is revealed a sentence at a time, at roughly the pace
   it would be read — never a typewriter. */
type Line = { text: string; para: number; at: number };

function schedule(letter: GiftContent["letter"], withName: (s: string) => string, reduced: boolean) {
  const lines: Line[] = [];
  let t = 1.2;
  const push = (text: string, para: number) => {
    lines.push({ text, para, at: t });
    t += reduced ? 0.15 : Math.min(3.6, Math.max(1.1, text.length * 0.034));
  };
  push(withName(letter.greeting), -1);
  t += 0.8;
  letter.paragraphs.forEach((p, i) => {
    const sentences = withName(p).match(/[^.!?…]+[.!?…]*["”’)]*\s*/g) ?? [p];
    sentences.forEach((s) => push(s, i));
    t += reduced ? 0.4 : 0.9;
  });
  return { lines, end: t };
}

export function LetterScene({ onDone }: { onDone: (ink: InkPoint[]) => void }) {
  const { letter } = useGift();
  const withName = useWithName();
  const reduced = !!useReducedMotion();
  const { lines, end } = useMemo(() => schedule(letter, withName, reduced), [letter, withName, reduced]);
  const [skipped, setSkipped] = useState(false);
  const [finished, setFinished] = useState(false);
  const [ink, setInk] = useState<InkPoint[] | null>(null);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setFinished(true), (skipped ? 1 : end + 2.4) * 1000);
    return () => clearTimeout(id);
  }, [end, skipped]);

  const delay = (at: number) => (skipped ? 0 : at);

  const dissolve = () => {
    const pts: InkPoint[] = [];
    body.current?.querySelectorAll<HTMLElement>("[data-ink]").forEach((el) => {
      for (const r of el.getClientRects()) {
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const n = Math.max(1, Math.round(r.width / 26));
        for (let k = 0; k < n; k++) {
          pts.push({ x: r.left + ((k + Math.random()) / n) * r.width, y: r.top + r.height * (0.35 + Math.random() * 0.4) });
        }
      }
    });
    setInk(pts.slice(0, 260));
  };

  return (
    <motion.section
      className="scene letter paper"
      aria-label="A letter"
      initial={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      onClick={() => !finished && setSkipped(true)}
    >
      <motion.div
        className="letter-sheet"
        key={skipped ? "all" : "slow"}
        ref={body}
        animate={ink ? { opacity: 0, filter: "blur(6px)" } : { opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.6, ease: ease.soft }}
      >
        {letter.image && (
          <motion.span
            className="letter-photo"
            initial={{ opacity: 0, rotate: 9, y: -8 }}
            animate={{ opacity: 1, rotate: 4, y: 0 }}
            transition={{ delay: 0.6, duration: 1.4, ease: ease.out }}
          >
            <img src={letter.image} alt="" />
            <svg className="letter-clip" viewBox="0 0 20 54" aria-hidden="true">
              <path d="M6 50 V10 a4 4 0 0 1 8 0 V44 a6 6 0 0 1 -12 0 V14" fill="none" stroke="#9aa0a3" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.span>
        )}
        <p className="letter-greeting"><Ink at={delay(lines[0].at)}>{lines[0].text}</Ink></p>
        {letter.paragraphs.map((_, pi) => (
          <p key={pi} className="letter-p">
            {lines.filter((l) => l.para === pi).map((l, li) => (
              <Ink key={li} at={delay(l.at)}>{l.text}</Ink>
            ))}
          </p>
        ))}
        <div className="letter-sign">
          <Ink at={skipped ? 0 : end}>{letter.closing}</Ink>
          <Ink at={skipped ? 0 : end + 1.2} className="letter-signature">{letter.signature}</Ink>
          <svg className="letter-flourish" viewBox="0 0 160 24" aria-hidden="true">
            <motion.path
              d="M4 16 C 30 22, 60 4, 90 12 S 140 20, 156 6"
              fill="none" stroke="var(--burgundy)" strokeWidth="1.3" strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.7 }}
              transition={{ delay: (skipped ? 0 : end) + 2, duration: 1.4, ease: ease.inOut }}
            />
          </svg>
        </div>
      </motion.div>

      <motion.button
        className="letter-next hand"
        initial={{ opacity: 0 }}
        animate={{ opacity: finished && !ink ? 0.75 : 0 }}
        transition={{ duration: 1.6 }}
        disabled={!finished || !!ink}
        onClick={dissolve}
      >
        {letter.next} →
      </motion.button>

      {!skipped && (
        <motion.p
          className="eyebrow letter-skip"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.45, 0.45, 0] }}
          transition={{ delay: 3, duration: 6, times: [0, 0.15, 0.8, 1] }}
        >
          tap to read it all at once
        </motion.p>
      )}

      {ink && (
        <div className="ink-dots" aria-hidden="true">
          {ink.map((p, i) => (
            <motion.span
              key={i}
              style={{ left: p.x, top: p.y }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ delay: 0.2 + (i % 17) * 0.04, duration: 1 }}
              onAnimationComplete={i === 0 ? () => setTimeout(() => onDone(ink), 1600) : undefined}
            />
          ))}
        </div>
      )}
    </motion.section>
  );
}

function Ink({ at, children, className = "" }: { at: number; children: React.ReactNode; className?: string }) {
  return (
    <motion.span
      data-ink
      className={className}
      initial={{ opacity: 0, filter: "blur(5px)", color: "#9a8e7c" }}
      animate={{ opacity: 1, filter: "blur(0px)", color: "#2a2622" }}
      transition={{
        delay: at,
        opacity: { delay: at, duration: 1.4, ease: ease.out },
        filter: { delay: at, duration: 1.2, ease: ease.out },
        color: { delay: at + 0.3, duration: 2.4 },
      }}
    >
      {children}
    </motion.span>
  );
}
