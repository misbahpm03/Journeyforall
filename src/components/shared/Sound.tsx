"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/* All sound in one place. Nothing ever starts on its own: the song
   (if one was uploaded) begins from her tap on the envelope; the
   small sounds — paper, the garden at night — are made on the fly
   with Web Audio and only play while sound is on. */

type Ambience = "garden" | null;
type Sound = { on: boolean; rustle: () => void; setAmbience: (a: Ambience) => void };

const Ctx = createContext<Sound>({ on: false, rustle: () => {}, setAmbience: () => {} });
export const SoundProvider = Ctx.Provider;
export const useSound = () => useContext(Ctx);

export function useSoundSystem(song: string, volume: number) {
  const [on, setOn] = useState(false);
  const live = useRef(false); // same as `on`, readable inside the same tap that turns it on
  const ctx = useRef<AudioContext | null>(null);
  const noise = useRef<AudioBuffer | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const wanted = useRef<Ambience>(null);
  const stopAmbience = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!song) return;
    const a = new Audio(song);
    a.loop = true;
    a.preload = "none";
    a.volume = 0;
    audio.current = a;
    return () => a.pause();
  }, [song]);

  // must run inside a tap/click: browsers only allow audio after a gesture
  const ensureContext = () => {
    if (!ctx.current) {
      const c = new AudioContext();
      const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      ctx.current = c;
      noise.current = buf;
    }
    if (ctx.current.state === "suspended") ctx.current.resume();
    return ctx.current;
  };

  const fadeSong = (target: number, ms: number) => {
    const a = audio.current;
    if (!a) return;
    if (target > 0) a.play().catch(() => {});
    const from = a.volume, t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      a.volume = from + (target - from) * k;
      if (k < 1) requestAnimationFrame(step);
      else if (target === 0) a.pause();
    };
    requestAnimationFrame(step);
  };

  const startAmbience = useCallback((name: Ambience) => {
    stopAmbience.current?.();
    stopAmbience.current = null;
    const c = ctx.current, buf = noise.current;
    if (!name || !c || !buf) return;

    const out = c.createGain();
    out.gain.value = 0;
    out.gain.linearRampToValueAtTime(1, c.currentTime + 4);
    out.connect(c.destination);

    // wind: low, slowly breathing noise
    const wind = c.createBufferSource();
    wind.buffer = buf;
    wind.loop = true;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    const windGain = c.createGain();
    windGain.gain.value = 0.045;
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoDepth = c.createGain();
    lfoDepth.gain.value = 0.03;
    lfo.connect(lfoDepth).connect(windGain.gain);
    wind.connect(lp).connect(windGain).connect(out);
    wind.start();
    lfo.start();

    // crickets: a few soft triple-chirps at random moments
    let timer = 0;
    const chirp = () => {
      const t = c.currentTime;
      const pitch = 4200 + Math.random() * 600;
      for (let k = 0; k < 3; k++) {
        const o = c.createOscillator();
        const g = c.createGain();
        o.frequency.value = pitch;
        g.gain.setValueAtTime(0, t + k * 0.06);
        g.gain.linearRampToValueAtTime(0.012, t + k * 0.06 + 0.01);
        g.gain.linearRampToValueAtTime(0, t + k * 0.06 + 0.035);
        o.connect(g).connect(out);
        o.start(t + k * 0.06);
        o.stop(t + k * 0.06 + 0.05);
      }
      timer = window.setTimeout(chirp, 700 + Math.random() * 2600);
    };
    timer = window.setTimeout(chirp, 1500);

    stopAmbience.current = () => {
      clearTimeout(timer);
      out.gain.cancelScheduledValues(c.currentTime);
      out.gain.setValueAtTime(out.gain.value, c.currentTime);
      out.gain.linearRampToValueAtTime(0, c.currentTime + 1.5);
      setTimeout(() => { wind.stop(); lfo.stop(); out.disconnect(); }, 1600);
    };
  }, []);

  const turnOn = useCallback(() => {
    ensureContext();
    live.current = true;
    setOn(true);
    fadeSong(volume, 2600);
    startAmbience(wanted.current);
  }, [volume, startAmbience]);

  const turnOff = useCallback(() => {
    live.current = false;
    setOn(false);
    fadeSong(0, 900);
    stopAmbience.current?.();
    stopAmbience.current = null;
  }, []);

  /* the envelope: sound only begins here if there's a song */
  const begin = useCallback(() => { if (song) turnOn(); }, [song, turnOn]);
  const toggle = useCallback(() => (on ? turnOff() : turnOn()), [on, turnOn, turnOff]);

  const rustle = useCallback(() => {
    const c = ctx.current, buf = noise.current;
    if (!live.current || !c || !buf) return;
    const src = c.createBufferSource();
    src.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2400;
    bp.Q.value = 0.7;
    const g = c.createGain();
    const t = c.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    src.connect(bp).connect(g).connect(c.destination);
    src.start(t, Math.random());
    src.stop(t + 0.5);
  }, []);

  const setAmbience = useCallback((a: Ambience) => {
    wanted.current = a;
    if (live.current) startAmbience(a);
  }, [startAmbience]);

  const value = useMemo(() => ({ on, rustle, setAmbience }), [on, rustle, setAmbience]);
  return { on, begin, toggle, value };
}

export function SoundToggle({ on, toggle }: { on: boolean; toggle: () => void }) {
  return (
    <button
      className="chrome sound-toggle"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
    >
      <i /><i /><i />
    </button>
  );
}
