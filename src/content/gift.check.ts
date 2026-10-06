// Self-check for withDefaults. Run: node src/content/gift.check.ts
import assert from "node:assert/strict";
import { defaultContent, withDefaults } from "./gift.ts";

// nothing saved → defaults
assert.deepEqual(withDefaults(defaultContent, null), defaultContent);

// saved values win, missing fields fall back, wrong types are ignored
const merged = withDefaults(defaultContent, {
  recipientName: "Maya",
  opening: { line1: "Hi." },
  garden: { findBeforeNote: "3", objects: [{ kind: "moon", title: "t", text: "x" }] },
  letter: { paragraphs: ["one"] },
});
assert.equal(merged.recipientName, "Maya");
assert.equal(merged.opening.line1, "Hi.");
assert.equal(merged.opening.line2, defaultContent.opening.line2);
assert.equal(merged.garden.findBeforeNote, 4);
assert.deepEqual(merged.garden.objects, [{ kind: "moon", title: "t", text: "x", image: "" }]); // new fields filled in
assert.deepEqual(merged.letter.paragraphs, ["one"]);
assert.equal(merged.theme.gold, defaultContent.theme.gold);

// array items get missing keys filled in
const photos = withDefaults(defaultContent, { scrapbook: { photos: [{ title: "only" }] } }).scrapbook.photos;
assert.equal(photos.length, 1);
assert.equal(photos[0].title, "only");
assert.equal(typeof photos[0].image, "string");

console.log("withDefaults ok");
