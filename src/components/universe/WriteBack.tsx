"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGift } from "@/content/GiftContext";
import { ease, spring } from "@/lib/motion";
import { emailjsReady, sendMessage } from "@/lib/emailjs";

const DRAFT = "lw-draft";
const read = () => { try { return localStorage.getItem(DRAFT) ?? ""; } catch { return ""; } };
const keep = (v: string) => { try { if (v) localStorage.setItem(DRAFT, v); else localStorage.removeItem(DRAFT); } catch {} };

/* A quiet line at the very end. If she taps it, a sheet of paper
   slides up and whatever she writes is sent on by EmailJS. */
export function WriteBack({ show }: { show: boolean }) {
  const { writeBack: wb, recipientName } = useGift();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [from, setFrom] = useState(recipientName.startsWith("[") ? "" : recipientName);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    area.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open]);

  if (!wb.enabled || !emailjsReady(wb.emailjs)) return null;

  const send = async () => {
    if (!text.trim() || state === "sending") return;
    setState("sending");
    try {
      await sendMessage(wb.emailjs, { message: text.trim(), from_name: from.trim(), recipient: recipientName });
      keep("");
      setState("sent");
      setOpen(false);
    } catch {
      setState("failed");
    }
  };

  return (
    <>
      <AnimatePresence>
        {show && !open && (
          <motion.button
            key={state === "sent" ? "sent" : "invite"}
            className="wb-invite hand"
            disabled={state === "sent"}
            initial={{ opacity: 0 }}
            animate={{ opacity: state === "sent" ? 0.75 : 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4 }}
            onClick={() => { if (!text) setText(read()); setOpen(true); }}
          >
            {state === "sent" ? wb.thanks : wb.invite}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="wb-wrap"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.form
              className="wb-sheet paper"
              role="dialog"
              aria-label={wb.invite}
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => { e.preventDefault(); send(); }}
              initial={{ y: 60, rotate: 1.5 }}
              animate={{ y: 0, rotate: -0.5 }}
              exit={{ y: 40, opacity: 0, transition: { duration: 0.5, ease: ease.inOut } }}
              transition={spring.paper}
            >
              <label className="sr-only" htmlFor="wb-text">Your message</label>
              <textarea
                id="wb-text"
                ref={area}
                className="hand"
                rows={7}
                value={text}
                placeholder={wb.placeholder}
                onChange={(e) => { setText(e.target.value); keep(e.target.value); if (state === "failed") setState("idle"); }}
              />
              <div className="wb-foot">
                <label className="wb-from">
                  <span>—</span>
                  <input className="hand" value={from} placeholder="your name" onChange={(e) => setFrom(e.target.value)} aria-label="Your name" />
                </label>
                <button className="wb-send hand" disabled={!text.trim() || state === "sending"}>
                  {state === "sending" ? "sending…" : wb.button}
                </button>
              </div>
              {state === "failed" && <p className="wb-err" role="alert">Couldn&apos;t send — try again?</p>}
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
