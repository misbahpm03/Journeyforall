"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { gift } from "@/content/gift";
import { ease, withName } from "@/lib/motion";
import type { InkPoint } from "../universe/UniverseScene";

const { letter } = gift;

/* The letter is revealed a sentence at a time, at roughly the pace
   it would be read — never a typewriter. */
type Line = { text: string; para: number; at: number };

function schedule(reduced: boolean) {
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
  const reduced = !!useReducedMotion();
  const { lines, end } = useMemo(() => schedule(reduced), [reduced]);
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

      {!finished && (
        <p className="sr-only">Tap anywhere to show the whole letter.</p>
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
