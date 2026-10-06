import { existsSync } from "node:fs";
import { join } from "node:path";
import { gift } from "@/content/gift";
import { GiftExperience } from "@/components/GiftExperience";

/* Runs at build time: find out which photos / audio really exist,
   so the client never requests a missing file. */
export default function Page() {
  const paths = [
    ...gift.scrapbook.photos.map((p) => p.image),
    ...gift.museum.exhibits.map((e) => e.image),
    gift.audio.src,
  ];
  const available = paths.filter((p) => existsSync(join(process.cwd(), "public", p)));
  return <GiftExperience available={available} />;
}
