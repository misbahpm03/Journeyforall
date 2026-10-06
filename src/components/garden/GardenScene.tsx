"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useGift } from "@/content/GiftContext";
import type { GardenKind, GardenObject } from "@/content/gift";
import { ease, seeded, spring, useFinePointer } from "@/lib/motion";
import { useSound } from "../shared/Sound";
import { GardenArt, Plant, type PlantKind } from "./GardenArt";

/* The garden is a wide panorama in its own 2000×1000 world. On a
   phone she swipes sideways to wander; with a mouse the view drifts
   toward wherever she looks. A firefly follows her and lights what
   it passes. Everything is placed in world units. */
const W = 2000;
const H = 1000;
const SKY = 0.3;        // parallax of things in the sky (low, so they stay reachable)
const GROUND_Y = 770;   // below this line, a tap plants something
const MAX_PLANTED = 40;

// height and baseline (world units) for each kind of thing
const form: Record<GardenKind, { h: number; y: number }> = {
  tree: { h: 400, y: 735 },
  flower: { h: 150, y: 880 },
  butterfly: { h: 140, y: 860 },
  pond: { h: 110, y: 880 },
  lantern: { h: 220, y: 830 },
  moon: { h: 130, y: 400 },
};

const PATH = [[0, 965], [200, 935], [400, 905], [600, 922], [800, 908], [1000, 930], [1200, 908], [1400, 924], [1600, 902], [1800, 918], [2000, 898]];
const pathD = PATH.reduce((d, [x, y], i, a) => {
  if (!i) return `M${x} ${y}`;
  const [px, py] = a[i - 1];
  return `${d} Q ${px} ${py} ${(px + x) / 2} ${(py + y) / 2}`;
}, "") + ` T ${W} ${PATH[PATH.length - 1][1]}`;

const STARS = 120;

type Spot = { x: number; y: number; h: number; f: number };
type Planted = { x: number; y: number; kind: PlantKind; tint: number; h: number; delay: number };

function place(objects: GardenObject[], rich: number): Spot[] {
  const ground = objects.map((o, i) => ({ o, i })).filter(({ o }) => o.kind !== "moon");
  let moons = 0;
  return objects.map((o, i) => {
    const f = form[o.kind];
    if (o.kind === "moon") {
      const m = moons++;
      // the moon rises as the garden comes alive
      return { x: 1250 - m * 320, y: f.y - rich * 150 + m * 40, h: f.h, f: SKY };
    }
    const slot = ground.findIndex((g) => g.i === i);
    const x = 200 + (slot + 0.5) * (1600 / Math.max(1, ground.length));
    return { x, y: f.y + (slot % 2) * 14, h: f.h, f: 0 };
  });
}

const plantAt = (x: number, y: number, seed: number, delay = 0): Planted => ({
  x, y, delay,
  kind: Math.floor(seeded(seed, 91) * 4) as PlantKind,
  tint: Math.floor(seeded(seed, 92) * 4),
  h: 60 + seeded(seed, 93) * 50,
});

export function GardenScene({ onDone }: { onDone: () => void }) {
  const { garden, easterEggs } = useGift();
  const { objects } = garden;
  const needed = Math.max(1, Math.min(garden.findBeforeNote, objects.length));
  const fine = useFinePointer();
  const reduced = !!useReducedMotion();
  const sound = useSound();

  const [found, setFound] = useState<Set<number>>(new Set());
  const [open, setOpen] = useState<number | null>(null);
  const [plants, setPlants] = useState<Planted[]>([]);
  const [secretTaps, setSecretTaps] = useState(0);
  const [wandered, setWandered] = useState(false);
  const [entering, setEntering] = useState<DOMRect | null>(null);

  const richness = objects.length ? found.size / objects.length : 1;
  const spots = useMemo(() => place(objects, richness), [objects, richness]);
  const showNote = found.size >= needed;
  const treeFound = objects.some((o, i) => o.kind === "tree" && found.has(i));

  const view = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const things = useRef<(HTMLDivElement | null)[]>([]);
  const companion = useRef<HTMLDivElement>(null);
  const blades = useRef<SVGPathElement[]>([]);
  const noteRef = useRef<HTMLButtonElement>(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const fly = useRef({ x: -1, y: -1, tx: -1, ty: -1, touching: false });
  const spotsRef = useRef(spots);
  const foundRef = useRef(found);
  useEffect(() => { spotsRef.current = spots; foundRef.current = found; }, [spots, found]);
  const section = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false); // the "tap" marks wait until the garden has opened
  useEffect(() => { const id = setTimeout(() => setReady(true), 3200); return () => clearTimeout(id); }, []);

  const { setAmbience } = sound;
  useEffect(() => {
    setAmbience("garden");
    return () => setAmbience(null);
  }, [setAmbience]);

  /* one loop: the firefly, and how lit each thing is */
  useEffect(() => {
    const v = view.current!, s = stage.current!;
    v.scrollLeft = (v.scrollWidth - v.clientWidth) / 2;
    const onScroll = () => {
      s.style.setProperty("--sx", String(v.scrollLeft));
      if (Math.abs(v.scrollLeft - (v.scrollWidth - v.clientWidth) / 2) > 40) setWandered(true);
    };
    onScroll();
    v.addEventListener("scroll", onScroll, { passive: true });

    // a mouse wheel scrolls the garden sideways (trackpads already do)
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      v.scrollLeft += e.deltaY;
    };
    v.addEventListener("wheel", onWheel, { passive: false });

    let raf = 0;
    const lit: number[] = [];
    const tick = (now: number) => {
      const sw = s.clientWidth, sh = s.clientHeight, S = v.scrollLeft;
      const f = fly.current;
      // with no finger down (touch) or before the mouse moves, rest mid-screen
      if (f.tx < 0 || (!fine && !f.touching)) { f.tx = S + v.clientWidth / 2; f.ty = sh * 0.66; }
      if (f.x < 0) { f.x = f.tx; f.y = f.ty; }
      f.x += (f.tx - f.x) * 0.07;
      f.y += (f.ty - f.y) * 0.07;
      const wob = reduced ? 0 : 1;
      const fx = f.x + Math.sin(now / 520) * 9 * wob, fy = f.y + Math.cos(now / 690) * 7 * wob - 18;
      if (companion.current) companion.current.style.transform = `translate(${fx}px, ${fy}px)`;

      const r0 = sh * 0.07, r1 = sh * 0.26;
      spotsRef.current.forEach((sp, i) => {
        const el = things.current[i];
        if (!el) return;
        const ox = (sp.x / W) * sw + sp.f * S, oy = ((sp.y - sp.h / 2) / H) * sh;
        const d = Math.hypot(ox - fx, oy - fy);
        const l = Math.max(0, Math.min(1, 1 - (d - r0) / (r1 - r0)));
        if (Math.abs((lit[i] ?? -1) - l) > 0.02) { lit[i] = l; el.style.setProperty("--lit", l.toFixed(2)); }
      });

      // edge arrows: is something still waiting off to the left or right?
      let left = false, right = false;
      spotsRef.current.forEach((sp, i) => {
        if (foundRef.current.has(i)) return;
        const x = (sp.x / W) * sw + sp.f * S - S;
        if (x < 24) left = true;
        if (x > v.clientWidth - 24) right = true;
      });
      const sec = section.current;
      if (sec && (sec.dataset.left !== String(left) || sec.dataset.right !== String(right))) {
        sec.dataset.left = String(left);
        sec.dataset.right = String(right);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); v.removeEventListener("scroll", onScroll); v.removeEventListener("wheel", onWheel); };
  }, [fine, reduced]);

  /* where a screen point is, in stage pixels */
  const toStage = (cx: number, cy: number) => {
    const r = stage.current!.getBoundingClientRect();
    return { x: cx - r.left, y: cy - r.top, w: r.width, h: r.height };
  };

  /* the grass near her leans away */
  const bent = useRef(new Set<SVGPathElement>());
  const bendGrass = useCallback((px: number) => {
    const next = new Set<SVGPathElement>();
    for (const el of blades.current) {
      const dx = Number(el.dataset.x) - px;
      if (Math.abs(dx) > 70) continue;
      el.style.transform = `rotate(${(dx > 0 ? 1 : -1) * (1 - Math.abs(dx) / 70) * 16}deg)`;
      next.add(el);
    }
    for (const el of bent.current) if (!next.has(el)) el.style.transform = "";
    bent.current = next;
  }, []);

  const steer = useCallback((cx: number, cy: number) => {
    const r = stage.current!.getBoundingClientRect();
    fly.current.tx = cx - r.left;
    fly.current.ty = cy - r.top;
    bendGrass(((cx - r.left) / r.width) * W);
  }, [bendGrass]);

  // touch: follow the finger while it's down (native scrolling keeps working)
  useEffect(() => {
    const v = view.current!;
    const move = (e: TouchEvent) => { fly.current.touching = true; steer(e.touches[0].clientX, e.touches[0].clientY); };
    const end = () => { fly.current.touching = false; };
    v.addEventListener("touchstart", move, { passive: true });
    v.addEventListener("touchmove", move, { passive: true });
    v.addEventListener("touchend", end);
    return () => {
      v.removeEventListener("touchstart", move);
      v.removeEventListener("touchmove", move);
      v.removeEventListener("touchend", end);
    };
  }, [steer]);

  /* mouse: click-and-drag pans the garden, like a finger would */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { down: true, x: e.clientX, left: view.current!.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const d = drag.current;
    if (d.down) {
      const dx = e.clientX - d.x;
      if (Math.abs(dx) > 5) d.moved = true;
      if (d.moved) view.current!.scrollLeft = d.left - dx;
    }
    steer(e.clientX, e.clientY);
  };
  const onPointerUp = () => { drag.current.down = false; };
  // a drag shouldn't also count as a tap
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) { e.stopPropagation(); e.preventDefault(); drag.current.moved = false; }
  };

  const centerOn = (sp: Spot) => {
    const v = view.current!, sw = stage.current!.clientWidth;
    const max = v.scrollWidth - v.clientWidth;
    const target = Math.max(0, Math.min(max, ((sp.x / W) * sw - v.clientWidth / 2) / (1 - sp.f)));
    v.scrollTo({ left: target, behavior: "smooth" });
  };

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, []);

  /* where each thing is on screen right now (x of its centre) */
  const screenX = (sp: Spot) => {
    const v = view.current!, sw = stage.current!.clientWidth;
    return (sp.x / W) * sw + sp.f * v.scrollLeft - v.scrollLeft;
  };

  // edge arrow: glide to the nearest unfound thing on that side
  const goSide = (dir: -1 | 1) => {
    const vw = view.current!.clientWidth;
    const pick = spots
      .map((sp, i) => ({ sp, i, x: screenX(sp) }))
      .filter(({ i, x }) => !found.has(i) && (dir < 0 ? x < 24 : x > vw - 24))
      .sort((a, b) => Math.abs(a.x - vw / 2) - Math.abs(b.x - vw / 2))[0];
    if (pick) centerOn(pick.sp);
  };

  const discover = (i: number) => {
    setOpen((o) => (o === i ? null : i));
    centerOn(spots[i]);
    if (found.has(i)) return;
    sound.rustle();
    setFound((f) => new Set(f).add(i));
    // a little cluster grows up around whatever she found
    const sp = spots[i];
    const base = sp.f ? 600 + seeded(i, 95) * 800 : sp.x;
    setPlants((p) => [
      ...p,
      ...Array.from({ length: 4 }, (_, k) => plantAt(
        base + (seeded(i * 7 + k, 96) - 0.5) * 260,
        Math.max(GROUND_Y + 20, (sp.f ? 880 : sp.y) + (seeded(i * 7 + k, 97) - 0.3) * 60),
        i * 7 + k + 100,
        0.4 + k * 0.25,
      )),
    ]);
  };

  // tapping open ground plants something; tapping anywhere closes a note
  const onGroundTap = (e: React.MouseEvent) => {
    if (open !== null) return setOpen(null);
    const p = toStage(e.clientX, e.clientY);
    const wx = (p.x / p.w) * W, wy = (p.y / p.h) * H;
    if (wy < GROUND_Y) return;
    setPlants((list) => (list.length >= MAX_PLANTED + found.size * 4 ? list : [...list, plantAt(wx, wy, list.length + 1)]));
  };

  const grass = useMemo(
    () => Array.from({ length: 180 }, (_, i) => {
      const x = (i / 180) * W + seeded(i, 41) * 9;
      const h = 34 + seeded(i, 42) * 60 + (i % 23 === 0 ? 50 : 0);
      const bend = (seeded(i, 43) - 0.5) * 22;
      return { x, d: `M${x.toFixed(1)} 200 Q ${(x + bend * 0.4).toFixed(1)} ${(200 - h * 0.6).toFixed(1)} ${(x + bend).toFixed(1)} ${(200 - h).toFixed(1)}` };
    }),
    [],
  );

  const pondImage = objects.find((o, i) => o.kind === "pond" && found.has(i) && o.image)?.image;

  return (
    <motion.section
      ref={section}
      data-note={showNote}
      className="fixed-scene garden"
      aria-label="A small garden at night"
      initial={{ clipPath: "circle(0.5% at 50% 50%)" }}
      animate={{ clipPath: "circle(150% at 50% 50%)" }}
      transition={{ duration: 2.6, ease: ease.inOut }}
      exit={entering ? { opacity: 1, transition: { duration: 0 } } : { opacity: 0, transition: { duration: 0.4 } }}
      style={{ ["--rich" as string]: richness }}
    >
      {/* walking up to the note: the world leans in and softens. This wrapper
          only animates during that move, so the scroller inside stays untouched. */}
      <motion.div
        className="g-cam"
        style={{ transformOrigin: entering ? `${entering.left + entering.width / 2}px ${entering.top + entering.height / 2}px` : undefined }}
        animate={entering ? { scale: 1.35, filter: "blur(4px) brightness(0.75)" } : undefined}
        transition={{ duration: 1.8, ease: ease.inOut }}
      >
      <div
        className="g-view"
        ref={view}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClickCapture={onClickCapture}
        onClick={onGroundTap}
      >
        <div className="g-stage" ref={stage}>
          {/* sky: dusk gives way to night as she explores */}
          <div className="g-layer" style={{ ["--f" as string]: 0.82 }} aria-hidden="true">
            <div className="g-dusk" />
            {Array.from({ length: STARS }, (_, i) => (
              <span
                key={i}
                className="g-star"
                data-on={i < 10 + richness * (STARS - 10)}
                style={{
                  left: `${seeded(i, 21) * 100}%`,
                  top: `${seeded(i, 22) * 56}%`,
                  width: 1 + seeded(i, 23) * 1.8,
                  height: 1 + seeded(i, 23) * 1.8,
                  animationDelay: `${-seeded(i, 24) * 6}s`,
                  transitionDelay: `${(i % 9) * 0.15}s`,
                }}
              />
            ))}
            <span className="g-shooting" style={{ left: "30%", top: "10%" }} />
            <span className="g-shooting g-shooting-2" style={{ left: "62%", top: "6%" }} />
            <div className="g-moonlight" />
          </div>

          {/* the bright star — tap it three times */}
          <div className="g-layer g-layer-click" style={{ ["--f" as string]: 0.82 }}>
            <button
              className="g-secret-star"
              style={{ left: "21%", top: "12%" }}
              aria-label="A small bright star"
              onClick={(e) => { e.stopPropagation(); setSecretTaps((n) => n + 1); }}
            />
            <AnimatePresence>
              {secretTaps >= 3 && (
                <motion.p
                  className="hand g-secret-msg"
                  style={{ left: "21%", top: "15%" }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 0.9, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.6 }}
                  onAnimationComplete={() => setTimeout(() => setSecretTaps(-99), 4000)}
                >
                  {easterEggs.secretStar}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* distant tree line, mist, hills */}
          <svg className="g-layer g-svg" style={{ ["--f" as string]: 0.55 }} viewBox="0 0 2000 1000" preserveAspectRatio="none" aria-hidden="true">
            <path className="g-treeline" d={treeline()} />
          </svg>
          <div className="g-layer" style={{ ["--f" as string]: 0.42 }} aria-hidden="true"><div className="g-mist" /></div>
          <svg className="g-layer g-svg" style={{ ["--f" as string]: 0.25 }} viewBox="0 0 2000 1000" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#1f2e27" />
                <stop offset="1" stopColor="#121a15" />
              </linearGradient>
            </defs>
            <path d="M0 700 C 260 640, 520 668, 760 676 S 1240 620, 1520 650 S 1880 690, 2000 670 L2000 1000 L0 1000 Z" fill="url(#hill)" />
            <path d="M0 700 C 260 640, 520 668, 760 676 S 1240 620, 1520 650 S 1880 690, 2000 670" className="g-rim" />
          </svg>

          {/* the near ground and the path through it */}
          <svg className="g-layer g-svg" style={{ ["--f" as string]: 0 }} viewBox="0 0 2000 1000" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#17221a" />
                <stop offset="1" stopColor="#0b120d" />
              </linearGradient>
            </defs>
            <path d="M0 760 C 300 730, 640 752, 1000 744 S 1700 726, 2000 748 L2000 1000 L0 1000 Z" fill="url(#ground)" />
            <path d={pathD} className="g-path" />
          </svg>

          {/* lights along the path, fireflies */}
          <div className="g-layer" style={{ ["--f" as string]: 0 }} aria-hidden="true">
            {PATH.slice(1, -1).map(([x, y], i) => (
              <span key={i} className="g-path-light" data-on={i < found.size * 2} style={{ left: `${(x / W) * 100}%`, top: `${((y - 18) / H) * 100}%` }} />
            ))}
            {Array.from({ length: 4 + found.size * 5 }, (_, i) => (
              <span
                key={i}
                className="g-firefly"
                style={{
                  left: `${3 + seeded(i, 11) * 94}%`,
                  top: `${46 + seeded(i, 12) * 44}%`,
                  ["--dx" as string]: `${(seeded(i, 13) - 0.5) * 140}px`,
                  ["--dy" as string]: `${(seeded(i, 14) - 0.5) * 90}px`,
                  animationDuration: `${7 + seeded(i, 15) * 9}s, ${2.4 + seeded(i, 16) * 3}s`,
                  animationDelay: `${-seeded(i, 17) * 10}s, ${-seeded(i, 18) * 4}s`,
                }}
              />
            ))}
          </div>

          {/* everything that has grown */}
          {plants.map((p, i) => (
            <div
              key={i}
              className="g-plant"
              aria-hidden="true"
              style={{
                left: `${(p.x / W) * 100}%`,
                top: `${((p.y - p.h) / H) * 100}%`,
                height: `${(p.h / H) * 100}%`,
                ["--d" as string]: `${p.delay}s`,
                zIndex: Math.round(p.y),
              }}
            >
              <Plant kind={p.kind} tint={p.tint} />
            </div>
          ))}

          {/* the things to find */}
          {objects.map((o, i) => {
            const s = spots[i];
            return (
              <div
                key={i}
                ref={(el) => { things.current[i] = el; }}
                className={`g-thing g-${o.kind}`}
                data-found={found.has(i)}
                data-open={open === i}
                style={{
                  left: `${(s.x / W) * 100}%`,
                  top: `${((s.y - s.h) / H) * 100}%`,
                  height: `${(s.h / H) * 100}%`,
                  ["--f" as string]: s.f,
                  ["--lit" as string]: 0,
                  animationDelay: `${1.8 + i * 0.2}s`,
                  zIndex: open === i ? 2000 : Math.round(s.y),
                }}
              >
                <button
                  className="g-thing-btn"
                  aria-label={o.title || o.kind}
                  aria-expanded={open === i}
                  data-cursor="look"
                  onClick={(e) => { e.stopPropagation(); discover(i); }}
                >
                  <GardenArt kind={o.kind} />
                  {o.kind === "pond" && pondImage && (
                    <span className="g-pond-photo" style={{ backgroundImage: `url("${pondImage}")` }} aria-hidden="true" />
                  )}
                </button>
                {ready && !found.has(i) && open !== i && !showNote && (
                  <span className={`g-point ${s.f ? "g-point-below" : ""}`} aria-hidden="true">
                    <svg viewBox="0 0 30 40"><path d="M15 3 C 13 14, 17 24, 15 35 M8 28 L15 36 L22 27" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span className="hand">tap</span>
                  </span>
                )}

                <AnimatePresence>
                  {open === i && (
                    <Tag
                      below={!!s.f}
                      className={`g-tag paper ${s.f ? "g-tag-below" : ""}`}
                    >
                      <span className="g-tag-string" aria-hidden="true" />
                      {o.image && (
                        <span className="g-tag-photo"><img src={o.image} alt="" /></span>
                      )}
                      {o.title && <p className="eyebrow">{o.title}</p>}
                      <p className="g-tag-text">{o.text}</p>
                    </Tag>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* the firefly that keeps her company */}
          <div className="g-companion" ref={companion} data-gone={showNote} aria-hidden="true"><span /></div>

          {/* foreground grass: wind passes through it, and it leans away from her */}
          <svg className="g-grass" viewBox="0 0 2000 200" preserveAspectRatio="none" aria-hidden="true">
            {grass.map((b, i) => (
              <path
                key={i}
                d={b.d}
                data-x={b.x}
                ref={(el) => { if (el) blades.current[i] = el; }}
                className={i % 3 ? "" : "g-blade-alt"}
                style={{ animationDelay: `${(b.x / W) * 2.2}s` }}
              />
            ))}
          </svg>
        </div>
      </div>
      </motion.div>

      {/* arrows at the edges while something is still waiting that way */}
      <button className="g-edge g-edge-l" aria-label="Look left" onClick={() => goSide(-1)}>
        <svg viewBox="0 0 24 40"><path d="M18 4 C 10 14, 8 18, 5 20 C 8 22, 10 26, 18 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      <button className="g-edge g-edge-r" aria-label="Look right" onClick={() => goSide(1)}>
        <svg viewBox="0 0 24 40"><path d="M6 4 C 14 14, 16 18, 19 20 C 16 22, 14 26, 6 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>

      {treeFound && (
        <div className="g-drift" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} style={{ top: `${10 + seeded(i, 71) * 60}%`, animationDelay: `${seeded(i, 72) * 12}s`, animationDuration: `${11 + seeded(i, 73) * 8}s` }} />
          ))}
        </div>
      )}

      <p className="sr-only" aria-live="polite">{open !== null ? `${objects[open].title}. ${objects[open].text}` : ""}</p>

      <motion.div
        className="g-intro"
        initial={{ opacity: 0 }}
        animate={{ opacity: found.size ? 0 : 1 }}
        transition={{ delay: found.size ? 0 : 2.4, duration: 1.4 }}
        aria-hidden="true"
      >
        <p className="hand">{garden.intro}</p>
        {!fine && <p className="eyebrow g-swipe" data-hide={wandered}>swipe to wander</p>}
      </motion.div>

      {/* when she's found enough, the fireflies gather into a note */}
      <AnimatePresence>
        {showNote && (
          <>
            {!entering && Array.from({ length: 12 }, (_, i) => (
              <motion.span
                key={`gather-${i}`}
                className="g-gather"
                initial={{ x: `${(seeded(i, 61) - 0.5) * 90}vw`, y: `${-seeded(i, 62) * 60}vh`, opacity: 0 }}
                animate={{ x: 0, y: 0, opacity: [0, 1, 1, 0] }}
                transition={{ delay: 0.8 + i * 0.06, duration: 2.4, ease: ease.inOut }}
              />
            ))}
            <motion.button
              ref={noteRef}
              key="note"
              className="g-note paper"
              data-entering={!!entering}
              initial={{ opacity: 0, scale: 0.6, rotate: -14 }}
              animate={entering ? { opacity: 0, scale: 1.5, rotate: 0 } : { opacity: 1, scale: 1, rotate: -5 }}
              exit={{ opacity: 0 }}
              transition={entering ? { duration: 1.6, ease: ease.inOut, opacity: { delay: 0.7, duration: 1 } } : { delay: 2.9, ...spring.paper }}
              disabled={!!entering}
              onClick={() => { sound.rustle(); setOpen(null); setEntering(noteRef.current?.getBoundingClientRect() ?? null); }}
              data-cursor="read"
            >
              <span className="hand">{garden.note}</span>
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {entering && (
        <motion.div
          className="g-enter paper"
          initial={{
            clipPath: `inset(${entering.top}px ${innerWidth - entering.right}px ${innerHeight - entering.bottom}px ${entering.left}px)`,
          }}
          animate={{ clipPath: "inset(0px 0px 0px 0px)" }}
          transition={{ duration: 1.8, ease: ease.out }}
          onAnimationComplete={() => setTimeout(onDone, 200)}
        />
      )}
    </motion.section>
  );
}

/* The paper tag tied to a found thing. Tall things (or tags with a
   photo) would push it off the top of the screen, so it measures
   itself once and slides down far enough to stay in view. */
function Tag({ below, className, children }: { below: boolean; className: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [push, setPush] = useState(0);
  useLayoutEffect(() => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const over = below ? r.bottom - (innerHeight - 12) : 12 - r.top;
    if (over > 0) setPush(below ? -over : over);
  }, [below]);
  return (
    <motion.div
      ref={ref}
      className={className}
      role="note"
      style={{ marginBottom: below ? 0 : -push, marginTop: below ? push : 0 }}
      onClick={(e) => e.stopPropagation()}
      initial={{ opacity: 0, y: below ? -10 : 10, rotate: -3, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, rotate: -1, scale: 1 }}
      exit={{ opacity: 0, y: below ? -6 : 6, transition: { duration: 0.25 } }}
      transition={{ delay: 0.25, ...spring.paper }}
    >
      {children}
    </motion.div>
  );
}

/* A ragged line of far-off trees along the horizon. */
function treeline() {
  let d = "M0 660";
  for (let x = 0; x <= W; x += 22) {
    const tall = seeded(x, 81);
    const y = 618 - tall * 46 - (seeded(Math.floor(x / 300), 82) * 30);
    d += ` L${x} ${y.toFixed(0)} L${x + 11} ${(y + 10 + tall * 14).toFixed(0)}`;
  }
  return `${d} L${W} 700 L0 700 Z`;
}
