import { createHash } from "node:crypto";
import { del, list, put } from "@vercel/blob";
import { unstable_cache, updateTag } from "next/cache";
import { defaultContent, withDefaults, type GiftContent } from "@/content/gift";

/* Site content is one JSON file in Vercel Blob. Every save writes a
   new randomly-named file (so no CDN copy is ever stale) and deletes
   the older ones; reading takes the newest. */
const PREFIX = "content/";
const TAG = "content";

export const storageReady = () => !!process.env.BLOB_READ_WRITE_TOKEN;

/* Cached until the next save (which invalidates the tag), so visits
   don't each hit the Blob API. The key carries a hash of the code's
   defaults, so a deploy that changes the content shape starts fresh. */
const shape = createHash("sha1").update(JSON.stringify(defaultContent)).digest("hex").slice(0, 10);
const cached = unstable_cache(loadContent, ["content", shape], { tags: [TAG] });

export async function getContent(): Promise<GiftContent> {
  return storageReady() ? cached() : defaultContent;
}

async function loadContent(): Promise<GiftContent> {
  try {
    const { blobs } = await list({ prefix: PREFIX });
    const latest = blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))[0];
    if (!latest) return defaultContent;
    const res = await fetch(latest.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`content fetch ${res.status}`);
    return withDefaults(defaultContent, await res.json());
  } catch (e) {
    console.error("Could not load content, showing defaults:", e);
    return defaultContent;
  }
}

export async function saveContent(content: GiftContent) {
  const clean = withDefaults(defaultContent, content);
  const { blobs } = await list({ prefix: PREFIX });
  await put(`${PREFIX}site.json`, JSON.stringify(clean), {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/json",
  });
  if (blobs.length) await del(blobs.map((b) => b.url));
  updateTag(TAG);
}
