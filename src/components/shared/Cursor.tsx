"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";

/* Desktop only. A small dot; over anything interactive it becomes a
   ring, and elements with data-cursor="view" etc. put a word in it. */
export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("has-cursor");
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const t = (e.target as Element | null)?.closest?.("[data-cursor], button, a, [role=button]");
      setLabel(t ? (t.getAttribute("data-cursor") ?? "") : null);
    };
    const leave = () => setVisible(false);
    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, [x, y]);

  return (
    <motion.div className="cursor" style={{ x: sx, y: sy, opacity: visible ? 1 : 0 }} aria-hidden="true">
      <AnimatePresence initial={false} mode="popLayout">
        {label === null ? (
          <motion.div key="dot" className="cursor-dot" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} />
        ) : (
          <motion.div
            key="ring"
            className="cursor-ring"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: label ? 1.35 : 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
