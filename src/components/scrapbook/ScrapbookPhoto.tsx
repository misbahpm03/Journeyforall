"use client";

import { useRef, type RefObject } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { ScrapbookPhoto as Item } from "@/content/gift";
import { seeded, spring } from "@/lib/motion";
import { Photo } from "../shared/Photo";

const LONG_PRESS_MS = 650;

export function ScrapbookPhoto({
  item, index, draggable, bounds, onOpen, onSecret,
}: {
  item: Item;
  index: number;
  draggable: boolean;
  bounds: RefObject<HTMLElement | null>;
  onOpen: () => void;
  onSecret: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const pressed = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  // hand-placed, but the same on every visit
  const rot = (seeded(index, 3) - 0.5) * 7;
  const tapeRot = (seeded(index, 9) - 0.5) * 14;
  const speed = 0.5 + seeded(index, 5);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [36 * speed, -36 * speed]);

  const startPress = () => {
    moved.current = false;
    longPressed.current = false;
    pressed.current = setTimeout(() => {
      if (moved.current) return;
      longPressed.current = true;
      onSecret();
    }, LONG_PRESS_MS);
  };
  const endPress = () => { if (pressed.current) clearTimeout(pressed.current); };

  return (
    <motion.div
      ref={ref}
      className={`sb-item sb-${item.aspect} ${index % 2 ? "sb-right" : "sb-left"}`}
      style={{ y, ["--i" as string]: index }}
    >
      <motion.button
        type="button"
        className="sb-photo"
        aria-label={`Open photograph: ${item.title}`}
        data-cursor="view"
        style={{ rotate: rot }}
        drag={draggable}
        dragConstraints={bounds}
        dragElastic={0.12}
        dragTransition={{ bounceStiffness: 220, bounceDamping: 24 }}
        whileHover={{ y: -6, rotate: rot * 0.6, scale: 1.015, transition: spring.lift }}
        whileDrag={{ scale: 1.05, rotate: rot * 0.3, zIndex: 20, cursor: "grabbing" }}
        onDragStart={() => { moved.current = true; endPress(); }}
        onPointerDown={startPress}
        onPointerUp={endPress}
        onPointerLeave={endPress}
        onContextMenu={(e) => e.preventDefault()}
        onClick={() => {
          if (moved.current || longPressed.current) return;
          onOpen();
        }}
      >
        <motion.span className="sb-frame" layoutId={`sb-${index}`}>
          <Photo src={item.image} alt={item.alt} aspect={item.aspect} eager={index === 0} develop />
        </motion.span>
        <span className="tape" style={{ rotate: `${tapeRot}deg` }} aria-hidden="true" />
      </motion.button>

      {(item.scribble || item.date) && (
        <p className="sb-scribble hand" aria-hidden="true">
          <svg viewBox="0 0 40 24" className="sb-arrow">
            <path d="M36 4 C 26 4, 14 8, 6 18 M6 18 l1 -6 M6 18 l6 -1" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
          {item.scribble || item.date}
        </p>
      )}
    </motion.div>
  );
}
