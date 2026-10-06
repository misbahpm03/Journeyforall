/* ─────────────────────────────────────────────────────────────
   EVERYTHING PERSONAL LIVES IN THIS FILE.

   • Anything in [SQUARE BRACKETS] is a placeholder — search this
     file for "[" to find every one.
   • Photos: drop files into /public/images/... using the exact
     paths below. Until a file exists, an elegant paper placeholder
     is shown instead (nothing breaks, no 404s).
   • Empty strings ("") are simply not shown.
   • {name} anywhere is replaced with recipientName.
   • Colours live in src/app/globals.css under ":root".
   ───────────────────────────────────────────────────────────── */

export type Aspect = "portrait" | "landscape" | "square";

export type GardenKind = "flower" | "butterfly" | "tree" | "pond" | "lantern" | "moon";

export const gift = {
  /* Her name, exactly as you'd write it to her. */
  recipientName: "[HER NAME]",

  /* One letter (A–Z). The final constellation draws it.
     Leave as "" for an abstract flower instead. */
  recipientInitial: "",

  /* Shown in the browser tab. Keep it quiet. */
  pageTitle: "for you",

  loading: "preparing something…",

  opening: {
    line1: "Hey.",
    line2: "I made something for you.",
    hint: "open it",
  },

  /* ── CHAPTER 1 · the scrapbook ─────────────────────────────
     4–8 photos works best. `note` is the handwriting that
     appears when she opens the photo. `scribble` is the tiny
     annotation written on the page next to it (optional).
     `secret` appears only if she presses and holds the photo. */
  scrapbook: {
    heading: "Some moments are small.",
    subheading: "They still stay.",
    photos: [
      {
        image: "/images/scrapbook/photo-01.jpg",
        alt: "[Describe photo 01 — e.g. her laughing at the café]",
        aspect: "portrait" as Aspect,
        title: "A little moment",
        note: "One of those moments I wanted to keep.",
        scribble: "[a tiny annotation]",
        date: "",
        place: "",
        secret: "",
      },
      {
        image: "/images/scrapbook/photo-02.jpg",
        alt: "[Describe photo 02]",
        aspect: "landscape" as Aspect,
        title: "[TITLE]",
        note: "[PERSONAL MESSAGE about this photo]",
        scribble: "",
        date: "[DATE]",
        place: "",
        secret: "",
      },
      {
        image: "/images/scrapbook/photo-03.jpg",
        alt: "[Describe photo 03]",
        aspect: "square" as Aspect,
        title: "[TITLE]",
        note: "[PERSONAL MESSAGE about this photo]",
        scribble: "[annotation]",
        date: "",
        place: "[PLACE]",
        secret: "",
      },
      {
        image: "/images/scrapbook/photo-04.jpg",
        alt: "[Describe photo 04]",
        aspect: "portrait" as Aspect,
        title: "[TITLE]",
        note: "[PERSONAL MESSAGE about this photo]",
        scribble: "",
        date: "[DATE]",
        place: "",
        secret: "",
      },
      {
        image: "/images/scrapbook/photo-05.jpg",
        alt: "[Describe photo 05]",
        aspect: "portrait" as Aspect,
        title: "[TITLE]",
        note: "[PERSONAL MESSAGE about this photo]",
        scribble: "[annotation]",
        date: "",
        place: "",
        secret: "",
      },
    ],
    /* The button at the bottom of the page that leads on. */
    next: "there's a little more",
  },

  /* ── CHAPTER 2 · the museum ───────────────────────────────── */
  museum: {
    title: "The Museum of {name}",
    subtitle: "A very small exhibition about someone rather difficult to forget.",
    exhibits: [
      {
        image: "/images/museum/exhibit-01.jpg",
        alt: "[Describe exhibit 01]",
        aspect: "portrait" as Aspect,
        title: "The Smile",
        medium: "[e.g. Photograph, the afternoon of …]",
        description: "[A small observation about her.]",
      },
      {
        image: "/images/museum/exhibit-02.jpg",
        alt: "[Describe exhibit 02]",
        aspect: "landscape" as Aspect,
        title: "The Moment",
        medium: "[medium / date]",
        description: "[A memory.]",
      },
      {
        image: "/images/museum/exhibit-03.jpg",
        alt: "[Describe exhibit 03]",
        aspect: "portrait" as Aspect,
        title: "Something I Never Said",
        medium: "[medium / date]",
        description: "[A short message.]",
      },
    ],
    exit: "step outside",
  },

  /* ── CHAPTER 3 · the garden ───────────────────────────────
     5–8 objects. Each one she finds makes the garden a little
     more alive. kinds: flower, butterfly, tree, pond, lantern, moon */
  garden: {
    intro: "Have a look around.",
    objects: [
      { kind: "flower" as GardenKind, title: "Something I like about you", text: "[WHAT I LIKE ABOUT HER]" },
      { kind: "butterfly" as GardenKind, title: "A memory", text: "[PERSONAL MEMORY]" },
      { kind: "tree" as GardenKind, title: "A story", text: "[A SHORT STORY]" },
      { kind: "pond" as GardenKind, title: "A thought I never said out loud", text: "[HONEST THOUGHT]" },
      { kind: "lantern" as GardenKind, title: "Something small I noticed", text: "[A TINY OBSERVATION]" },
      { kind: "moon" as GardenKind, title: "When I think of you", text: "[WHAT COMES TO MIND]" },
    ],
    /* The paper note that appears after she's found a few things. */
    note: "a letter",
    findBeforeNote: 4,
  },

  /* ── CHAPTER 4 · the letter ─────────────────────────────── */
  letter: {
    greeting: "Dear {name},",
    paragraphs: [
      "[WHY I MADE THIS — a few honest sentences.]",
      "[PERSONAL MEMORY — the one you think about.]",
      "[WHAT I LIKE ABOUT HER — be specific, small things count.]",
      "[HONEST MESSAGE — say the true thing, plainly.]",
    ],
    closing: "[sign-off, e.g. “Yours,” or just a dash]",
    signature: "[YOUR NAME]",
    next: "one more thing",
  },

  /* ── CHAPTER 5 · the universe ───────────────────────────── */
  ending: {
    line1: "Out of all the people I could have met…",
    line2: "I'm really glad I met you.",
    name: "{name}",
    whisper: "That's all.",
  },

  /* ── hidden things ──────────────────────────────────────── */
  easterEggs: {
    /* Tap the one slightly brighter star in the garden sky 3×. */
    secretStar: "You found this.",
    /* Shown when she presses and holds a scrapbook photo that has
       no `secret` of its own. */
    hiddenNote: "I almost didn't include this one.",
    /* Appears very faintly if she stays on the final screen. */
    finalMessage: "Thank you for staying until the end.",
    /* A small cluster in the final sky is drawn from this date
       (DD.MM). Tapping it shows the label. Leave "" to hide it. */
    importantDate: "",
    importantDateLabel: "[what this date was]",
  },

  /* ── optional sound ─────────────────────────────────────────
     Drop a quiet piano/ambient track at /public/audio/ambient.mp3.
     If the file doesn't exist, no sound toggle is shown at all. */
  audio: {
    src: "/audio/ambient.mp3",
    volume: 0.35,
  },
};

export type Gift = typeof gift;
