"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gift } from "@/content/gift";

/* Optional ambient track. Never autoplays: it can only begin from
   her first tap (the envelope), and fades in over a few seconds. */
export function useAmbient(enabled: boolean) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const a = new Audio(gift.audio.src);
    a.loop = true;
    a.preload = "none";
    a.volume = 0;
    audio.current = a;
    return () => a.pause();
  }, [enabled]);

  const fadeTo = useCallback((target: number, ms = 2600) => {
    const a = audio.current;
    if (!a) return;
    const from = a.volume, t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      a.volume = from + (target - from) * k;
      if (k < 1) requestAnimationFrame(step);
      else if (target === 0) a.pause();
    };
    requestAnimationFrame(step);
  }, []);

  const play = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    a.play().then(() => { setPlaying(true); fadeTo(gift.audio.volume); }).catch(() => {});
  }, [fadeTo]);

  const toggle = useCallback(() => {
    if (playing) { fadeTo(0, 900); setPlaying(false); }
    else play();
  }, [playing, play, fadeTo]);

  return { enabled, playing, play, toggle };
}

export function SoundToggle({ playing, toggle }: { playing: boolean; toggle: () => void }) {
  return (
    <button
      className="chrome sound-toggle"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Turn sound off" : "Turn sound on"}
    >
      <i /><i /><i />
    </button>
  );
}
