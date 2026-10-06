"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gift } from "@/content/gift";
import { ease, spring, useFinePointer } from "@/lib/motion";
import { Photo } from "../shared/Photo";
import { ScrapbookPhoto } from "./ScrapbookPhoto";
import { Doodle } from "./Doodle";

const { photos } = gift.scrapbook;
const bridge = gift.museum.exhibits[0];

export function ScrapbookScene({ onDone }: { onDone: () => void }) {
  const page = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const [open, setOpen] = useState<number | null>(null);
  const [secret, setSecret] = useState<number | null>(null);

  useEffect(() => {
    if (open === null && secret === null) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(null), setSecret(null));
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open, secret]);

  return (
    <motion.section
      className="scene scrapbook paper"
      aria-label="A scrapbook"
      initial={{ opacity: 0.999 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      <header className="sb-head">
        <motion.h1
          className="sb-title"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.6, ease: ease.out }}
        >
          {gift.scrapbook.heading}
        </motion.h1>
        <motion.p
          className="hand sb-sub"
          initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
          animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
          transition={{ delay: 1.6, duration: 1.6, ease: ease.inOut }}
        >
          {gift.scrapbook.subheading}
        </motion.p>
        <motion.span
          className="sb-scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 3.2, duration: 1.2 }}
          aria-hidden="true"
        />
      </header>

      <div className="sb-page" ref={page}>
        <Doodle kind="star" className="dd dd-1" />
        <Doodle kind="squiggle" className="dd dd-2" />
        <Doodle kind="sprig" className="dd dd-3" />
        <Doodle kind="circle" className="dd dd-4" />

        {photos.map((item, i) => (
          <ScrapbookPhoto
            key={item.image}
            item={item}
            index={i}
            draggable={fine}
            bounds={page}
            onOpen={() => setOpen(i)}
            onSecret={() => setSecret(i)}
          />
        ))}
      </div>

      {fine && <p className="sb-drag-hint hand" aria-hidden="true">(you can move them around)</p>}

      <BridgeToMuseum onDone={onDone} />

      <AnimatePresence>
        {open !== null && <Opened index={open} onClose={() => setOpen(null)} />}
        {secret !== null && (
          <motion.div
            key="secret"
            className="sb-secret-wrap"
            onClick={() => setSecret(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.p
              className="sb-secret hand"
              role="note"
              initial={{ y: 20, rotate: -6, scale: 0.9 }}
              animate={{ y: 0, rotate: -2, scale: 1 }}
              transition={spring.paper}
            >
              {photos[secret].secret || gift.easterEggs.hiddenNote}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function Opened({ index, onClose }: { index: number; onClose: () => void }) {
  const item = photos[index];
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => close.current?.focus(), []);
  const meta = [item.date, item.place].filter(Boolean).join("  ·  ");

  return (
    <motion.div
      className="sb-open"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      initial={{ backgroundColor: "rgba(30, 24, 18, 0)" }}
      animate={{ backgroundColor: "rgba(30, 24, 18, 0.62)" }}
      exit={{ backgroundColor: "rgba(30, 24, 18, 0)" }}
      onClick={onClose}
    >
      <div className={`sb-open-inner sb-open-${item.aspect}`} onClick={(e) => e.stopPropagation()}>
        <motion.div className="sb-frame sb-open-frame" layoutId={`sb-${index}`} transition={spring.paper}>
          <Photo src={item.image} alt={item.alt} aspect={item.aspect} eager />
        </motion.div>
        <motion.div
          className="sb-open-text"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.9, ease: ease.out } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <h2>{item.title}</h2>
          <p className="hand">{item.note}</p>
          {meta && <p className="eyebrow">{meta}</p>}
        </motion.div>
      </div>
      <button ref={close} className="sb-close eyebrow" onClick={onClose}>close</button>
    </motion.div>
  );
}

/* The last thing on the page: one more photograph, tucked in the
   corner. Lifting it carries her into the museum — the photograph
   becomes the first artwork. */
function BridgeToMuseum({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [lift, setLift] = useState<DOMRect | null>(null);

  const go = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setLift(r);
  };

  const target = () => {
    const vw = innerWidth, vh = innerHeight;
    const h = Math.min(vh * 0.62, (vw * 0.7) / 0.8);
    const w = h * 0.8;
    return { left: (vw - w) / 2, top: (vh - h) / 2 - vh * 0.04, width: w, height: h };
  };

  return (
    <div className="sb-end">
      <button ref={ref} className="sb-bridge" onClick={go} data-cursor="open" style={{ opacity: lift ? 0 : 1 }}>
        <span className="sb-frame">
          <Photo src={bridge.image} alt={bridge.alt} aspect="portrait" />
        </span>
        <span className="tape" style={{ rotate: "8deg" }} aria-hidden="true" />
      </button>
      <p className="hand sb-next">{gift.scrapbook.next} →</p>

      {lift && (
        <>
          <motion.div
            className="sb-lift-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.4, ease: ease.inOut }}
          />
          <motion.div
            className="sb-lift"
            initial={{ left: lift.left, top: lift.top, width: lift.width, height: lift.height, rotate: 4, padding: 8 }}
            animate={{ ...target(), rotate: 0, padding: 14 }}
            transition={{ duration: 1.8, ease: ease.inOut }}
            onAnimationComplete={() => setTimeout(onDone, 500)}
          >
            <motion.span
              className="sb-lift-frame"
              initial={{ backgroundColor: "#fbf8f1", boxShadow: "0 6px 14px rgba(40,30,20,.25)" }}
              animate={{ backgroundColor: "#1a1814", boxShadow: "0 40px 80px rgba(0,0,0,.6), inset 0 0 0 1px rgba(182,155,98,.55)" }}
              transition={{ delay: 0.6, duration: 1.4 }}
            />
            <Photo src={bridge.image} alt="" aspect="portrait" tone="dark" />
          </motion.div>
        </>
      )}
    </div>
  );
}
