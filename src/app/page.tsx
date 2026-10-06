import type { Metadata } from "next";
import { connection } from "next/server";
import { getContent } from "@/lib/store";
import { GiftExperience } from "@/components/GiftExperience";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getContent()).pageTitle };
}

export default async function Page() {
  await connection(); // render per request (content comes from the cached store, not the build)
  const content = await getContent();
  // the chosen palette, rendered on the server so there's no flash
  const vars = Object.entries(content.theme)
    .filter(([, v]) => /^#[0-9a-f]{3,8}$/i.test(v))
    .map(([k, v]) => `--${k}:${v}`)
    .join(";");
  return (
    <>
      <style>{`:root{${vars}}`}</style>
      <GiftExperience content={content} />
    </>
  );
}
