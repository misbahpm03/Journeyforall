import type { Metadata } from "next";
import { connection } from "next/server";
import { isAdmin, passwordConfigured } from "@/lib/auth";
import { getContent, storageReady } from "@/lib/store";
import { Editor } from "./Editor";
import { Login } from "./Login";
import "./admin.css";

export const metadata: Metadata = { title: "Editor", robots: { index: false, follow: false } };

export default async function AdminPage() {
  await connection();
  if (!passwordConfigured()) {
    return (
      <main className="admin-shell">
        <div className="login">
          <p className="admin-eyebrow">little world</p>
          <h1>Almost there</h1>
          <p>Set an <code>ADMIN_PASSWORD</code> environment variable for this project, then redeploy.</p>
        </div>
      </main>
    );
  }
  return (
    <main className="admin-shell">
      {(await isAdmin()) ? <Editor initial={await getContent()} storage={storageReady()} /> : <Login />}
    </main>
  );
}
