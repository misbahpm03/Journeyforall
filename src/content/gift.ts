/* ─────────────────────────────────────────────────────────────
   The shape of everything personal, and the placeholder content a
   fresh deployment starts with. Real content is edited at /admin
   and stored in Vercel Blob — you shouldn't need to touch this
   file per recipient.

   • {name} anywhere is replaced with recipientName.
   • Empty strings ("") are simply not shown.
   • An empty image ("") shows an elegant paper placeholder.
   ───────────────────────────────────────────────────────────── */

export type Aspect = "portrait" | "landscape" | "square";
export const aspects: Aspect[] = ["portrait", "landscape", "square"];

export type GardenKind = "flower" | "butterfly" | "tree" | "pond" | "lantern" | "moon";
export const gardenKinds: GardenKind[] = ["flower", "butterfly", "tree", "pond", "lantern", "moon"];

export type ScrapbookPhoto = {
  image: string;
  alt: string;
  aspect: Aspect;
  title: string;
  note: string;      // shown when she opens the photo
  scribble: string;  // tiny handwriting on the page beside it
  date: string;
  place: string;
  secret: string;    // shown only on press-and-hold
};

export type Exhibit = {
  image: string;
  alt: string;
  aspect: Aspect;
  title: string;
  medium: string;
  description: string;
};

export type GardenObject = { kind: GardenKind; title: string; text: string; image: string };

export type GiftContent = {
  recipientName: string;
  recipientInitial: string; // A–Z draws it in the final sky; "" draws a flower
  pageTitle: string;
  loading: string;
  opening: { line1: string; line2: string; hint: string };
  scrapbook: { heading: string; subheading: string; photos: ScrapbookPhoto[]; next: string };
  museum: { title: string; subtitle: string; exhibits: Exhibit[]; exit: string };
  garden: { intro: string; objects: GardenObject[]; note: string; findBeforeNote: number };
  letter: { greeting: string; paragraphs: string[]; closing: string; signature: string; next: string; image: string };
  ending: { line1: string; line2: string; name: string; whisper: string };
  easterEggs: {
    secretStar: string;
    hiddenNote: string;
    finalMessage: string;
    importantDate: string; // DD.MM — drawn as a tiny star cluster
    importantDateLabel: string;
  };
  audio: { src: string; volume: number };
  /* lets her write back from the last page, delivered by EmailJS */
  writeBack: {
    enabled: boolean;
    invite: string;
    placeholder: string;
    button: string;
    thanks: string;
    emailjs: { serviceId: string; templateId: string; publicKey: string };
  };
  theme: Record<ThemeKey, string>;
};

export const themeKeys = ["ivory", "cream", "burgundy", "rose", "gold", "charcoal", "warm-black", "night"] as const;
export type ThemeKey = (typeof themeKeys)[number];

export const blankPhoto = (): ScrapbookPhoto => ({
  image: "", alt: "", aspect: "portrait", title: "", note: "", scribble: "", date: "", place: "", secret: "",
});
export const blankExhibit = (): Exhibit => ({
  image: "", alt: "", aspect: "portrait", title: "", medium: "", description: "",
});

export const defaultContent: GiftContent = {
  recipientName: "[HER NAME]",
  recipientInitial: "",
  pageTitle: "for you",
  loading: "preparing something…",

  opening: {
    line1: "Hey.",
    line2: "I made something for you.",
    hint: "open it",
  },

  scrapbook: {
    heading: "Some moments are small.",
    subheading: "They still stay.",
    photos: [
      { ...blankPhoto(), title: "A little moment", note: "One of those moments I wanted to keep.", scribble: "[a tiny annotation]" },
      { ...blankPhoto(), aspect: "landscape", title: "[TITLE]", note: "[PERSONAL MESSAGE about this photo]", date: "[DATE]" },
      { ...blankPhoto(), aspect: "square", title: "[TITLE]", note: "[PERSONAL MESSAGE about this photo]", scribble: "[annotation]", place: "[PLACE]" },
      { ...blankPhoto(), title: "[TITLE]", note: "[PERSONAL MESSAGE about this photo]", date: "[DATE]" },
      { ...blankPhoto(), title: "[TITLE]", note: "[PERSONAL MESSAGE about this photo]", scribble: "[annotation]" },
    ],
    next: "there's a little more",
  },

  museum: {
    title: "The Museum of {name}",
    subtitle: "A very small exhibition about someone rather difficult to forget.",
    exhibits: [
      { ...blankExhibit(), title: "The Smile", medium: "[e.g. Photograph, the afternoon of …]", description: "[A small observation about her.]" },
      { ...blankExhibit(), aspect: "landscape", title: "The Moment", medium: "[medium / date]", description: "[A memory.]" },
      { ...blankExhibit(), title: "Something I Never Said", medium: "[medium / date]", description: "[A short message.]" },
    ],
    exit: "step outside",
  },

  garden: {
    intro: "Have a look around.",
    objects: [
      { kind: "flower", title: "Something I like about you", text: "[WHAT I LIKE ABOUT HER]", image: "" },
      { kind: "butterfly", title: "A memory", text: "[PERSONAL MEMORY]", image: "" },
      { kind: "tree", title: "A story", text: "[A SHORT STORY]", image: "" },
      { kind: "pond", title: "A thought I never said out loud", text: "[HONEST THOUGHT]", image: "" },
      { kind: "lantern", title: "Something small I noticed", text: "[A TINY OBSERVATION]", image: "" },
      { kind: "moon", title: "When I think of you", text: "[WHAT COMES TO MIND]", image: "" },
    ],
    note: "a letter",
    findBeforeNote: 4,
  },

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
    image: "",
  },

  ending: {
    line1: "Out of all the people I could have met…",
    line2: "I'm really glad I met you.",
    name: "{name}",
    whisper: "That's all.",
  },

  easterEggs: {
    secretStar: "You found this.",
    hiddenNote: "I almost didn't include this one.",
    finalMessage: "Thank you for staying until the end.",
    importantDate: "",
    importantDateLabel: "[what this date was]",
  },

  audio: { src: "", volume: 0.35 },

  writeBack: {
    enabled: false,
    invite: "write something back?",
    placeholder: "…",
    button: "send",
    thanks: "Sent. I'll read it slowly.",
    emailjs: { serviceId: "", templateId: "", publicKey: "" },
  },

  theme: {
    ivory: "#f3ede1",
    cream: "#e8dfcf",
    burgundy: "#6b3a3a",
    rose: "#b88989",
    gold: "#b69b62",
    charcoal: "#121212",
    "warm-black": "#090909",
    night: "#111a2b",
  },
};

/* Stored content is merged over the defaults, so a field added to
   the code later still has a sensible value on older deployments.
   Arrays are taken whole (they're lists the user curated). */
export function withDefaults<T>(base: T, saved: unknown): T {
  if (Array.isArray(base)) {
    if (!Array.isArray(saved)) return base;
    const item = base[0];
    return (item && typeof item === "object" ? saved.map((s) => withDefaults(item, s)) : saved) as T;
  }
  if (base && typeof base === "object") {
    const s = (saved && typeof saved === "object" ? saved : {}) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(base).map(([k, v]) => [k, withDefaults(v, s[k])]),
    ) as T;
  }
  return (typeof saved === typeof base ? saved : base) as T;
}
