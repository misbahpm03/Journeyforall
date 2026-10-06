"use server";

import { redirect } from "next/navigation";
import type { GiftContent } from "@/content/gift";
import { isAdmin, signIn, signOut } from "@/lib/auth";
import { saveContent, storageReady } from "@/lib/store";

export async function login(_: string | null, form: FormData) {
  const ok = await signIn(String(form.get("password") ?? ""));
  if (!ok) return "That's not it.";
  redirect("/admin");
}

export async function logout() {
  await signOut();
  redirect("/admin");
}

export async function save(content: GiftContent): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdmin())) return { ok: false, error: "Signed out — reload and sign in again." };
  if (!storageReady()) return { ok: false, error: "Blob storage isn't connected (BLOB_READ_WRITE_TOKEN missing)." };
  try {
    await saveContent(content);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save." };
  }
}
