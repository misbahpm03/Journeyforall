"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { gift } from "@/content/gift";
import { ease, useFinePointer, wait } from "@/lib/motion";
import { AvailableProvider } from "./shared/Photo";
import { Cursor } from "./shared/Cursor";
import { SoundToggle, useAmbient } from "./shared/Sound";
import { OpeningScene } from "./opening/OpeningScene";
import { ScrapbookScene } from "./scrapbook/ScrapbookScene";
import { MuseumScene } from "./museum/MuseumScene";
import { GardenScene } from "./garden/GardenScene";
import { LetterScene } from "./letter/LetterScene";
import { UniverseScene, type InkPoint } from "./universe/UniverseScene";

const chapters = ["loading", "opening", "scrapbook", "museum", "garden", "letter", "universe"] as const;
type Chapter = (typeof chapters)[number];

const marks: Partial<Record<Chapter, string>> = {
  scrapbook: "the scrapbook",
  museum: "the museum",
  garden: "the garden",
  universe: "the sky",
};

export function GiftExperience({ available }: { available: string[] }) {
  const [chapter, setChapter] = useState<Chapter>("loading");
  const [ink, setInk] = useState<InkPoint[]>([]);
  const fine = useFinePointer();
  const files = useMemo(() => new Set(available), [available]);
  const sound = useAmbient(files.has(gift.audio.src));

  const go = (next: Chapter) => {
    window.scrollTo(0, 0);
    setChapter(next);
  };

  useEffect(() => {
    if (chapter !== "loading") return;
    let live = true;
    // Dev convenience: /#garden jumps straight to a chapter.
    const h = location.hash.slice(1) as Chapter;
    const first = process.env.NODE_ENV !== "production" && chapters.includes(h) ? h : "opening";
    Promise.all([document.fonts.ready, wait(2200)]).then(() => live && setChapter(first));
    return () => { live = false; };
  }, [chapter]);

  useEffect(() => {
    document.body.dataset.chapter = chapter;
  }, [chapter]);

  const index = chapters.indexOf(chapter) - 1;

  return (
    <MotionConfig reducedMotion="user">
      <AvailableProvider value={files}>
        <main>
          <AnimatePresence mode="wait">
            {chapter === "loading" && <Loading key="loading" />}
            {chapter === "opening" && (
              <OpeningScene key="opening" onOpen={sound.play} onDone={() => go("scrapbook")} />
            )}
            {chapter === "scrapbook" && <ScrapbookScene key="scrapbook" onDone={() => go("museum")} />}
            {chapter === "museum" && <MuseumScene key="museum" onDone={() => go("garden")} />}
            {chapter === "garden" && <GardenScene key="garden" onDone={() => go("letter")} />}
            {chapter === "letter" && (
              <LetterScene key="letter" onDone={(pts) => { setInk(pts); go("universe"); }} />
            )}
            {chapter === "universe" && <UniverseScene key="universe" ink={ink} />}
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {marks[chapter] && (
            <motion.p
              key={chapter}
              className={`chrome chapter-mark ${chapter === "universe" ? "fade-late" : ""}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 1.2, duration: 1.4 } }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
            >
              <b>0{index}</b> <span>/ 05 &nbsp;·&nbsp; {marks[chapter]}</span>
            </motion.p>
          )}
        </AnimatePresence>

        {sound.enabled && chapter !== "loading" && chapter !== "opening" && (
          <SoundToggle playing={sound.playing} toggle={sound.toggle} />
        )}
        {fine && <Cursor />}
        <div className="grain" aria-hidden="true" />
      </AvailableProvider>
    </MotionConfig>
  );
}

function Loading() {
  return (
    <motion.div
      className="fixed-scene loading"
      exit={{ opacity: 0, transition: { duration: 0.9, ease: ease.soft } }}
      role="status"
    >
      <svg viewBox="0 0 40 40" aria-hidden="true" className="loading-mark">
        <motion.path
          d="M8 26 C 12 12, 20 10, 22 20 S 30 30, 33 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: ease.inOut }}
        />
      </svg>
      <motion.p
        className="hand loading-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.7, duration: 1.2 }}
      >
        {gift.loading}
      </motion.p>
    </motion.div>
  );
}
