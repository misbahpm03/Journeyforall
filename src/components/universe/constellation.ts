/* Each letter as constellation strokes in a 0–1 box:
   points "x,y" joined by spaces, strokes split by "|". */
const letters: Record<string, string> = {
  A: "0,1 .5,0 1,1|.22,.58 .78,.58",
  B: "0,1 0,0 .65,.05 .75,.25 .6,.47 0,.5|.6,.47 .85,.7 .7,.95 0,1",
  C: "1,.15 .6,0 .2,.12 0,.5 .2,.88 .6,1 1,.85",
  D: "0,0 0,1 .6,.92 .9,.6 .85,.3 .55,.05 0,0",
  E: "1,0 0,0 0,1 1,1|0,.5 .7,.5",
  F: "1,0 0,0 0,1|0,.5 .7,.5",
  G: "1,.15 .6,0 .15,.15 0,.55 .25,.92 .65,1 .95,.8 .95,.55 .6,.55",
  H: "0,0 0,1|1,0 1,1|0,.5 1,.5",
  I: ".2,0 .8,0|.5,0 .5,1|.2,1 .8,1",
  J: ".3,0 1,0|.75,0 .75,.75 .55,1 .2,.95 0,.75",
  K: "0,0 0,1|1,0 0,.55|.3,.4 1,1",
  L: "0,0 0,1 .9,1",
  M: "0,1 0,0 .5,.6 1,0 1,1",
  N: "0,1 0,0 1,1 1,0",
  O: ".5,0 .1,.2 0,.5 .1,.8 .5,1 .9,.8 1,.5 .9,.2 .5,0",
  P: "0,1 0,0 .7,.05 .85,.25 .7,.48 0,.5",
  Q: ".5,0 .1,.2 0,.5 .1,.8 .5,1 .9,.8 1,.5 .9,.2 .5,0|.65,.75 1,1.05",
  R: "0,1 0,0 .7,.05 .85,.25 .7,.48 0,.5|.35,.5 .95,1",
  S: "1,.12 .6,0 .15,.08 .1,.35 .5,.5 .9,.65 .9,.9 .45,1 0,.88",
  T: "0,0 1,0|.5,0 .5,1",
  U: "0,0 0,.7 .2,.95 .5,1 .8,.95 1,.7 1,0",
  V: "0,0 .5,1 1,0",
  W: "0,0 .25,1 .5,.4 .75,1 1,0",
  X: "0,0 1,1|1,0 0,1",
  Y: "0,0 .5,.5 1,0|.5,.5 .5,1",
  Z: "0,0 1,0 0,1 1,1",
};

/* No initial given: a quiet five-petalled flower. */
const flower =
  ".5,.4 .2,.4|.5,.4 .29,.19|.5,.4 .5,.08|.5,.4 .71,.19|.5,.4 .8,.4|.5,.4 .47,.7 .5,1|.47,.7 .66,.6";

export type Pt = [number, number];

export function constellationFor(initial: string) {
  const src = letters[initial.trim().toUpperCase()] ?? flower;
  const strokes = src.split("|").map((s) => s.trim().split(/\s+/).map((p) => p.split(",").map(Number) as Pt));
  const key = (p: Pt) => p.join(",");
  const seen = new Map<string, Pt>();
  strokes.flat().forEach((p) => seen.set(key(p), p));
  const segments: [Pt, Pt][] = strokes.flatMap((s) => s.slice(1).map((p, i) => [s[i], p] as [Pt, Pt]));
  return { stars: [...seen.values()], segments, isLetter: initial.trim().toUpperCase() in letters };
}
