"use client";

import { useId, useState, type ReactNode } from "react";
import { upload } from "@vercel/blob/client";

/* Small, plain form controls for the editor. */

export function Text({ label, value, onChange, hint, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="f">
      <label htmlFor={id}>{label}</label>
      <input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function Area({ label, value, onChange, hint, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; rows?: number;
}) {
  const id = useId();
  return (
    <div className="f">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function Pick<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: readonly T[]; onChange: (v: T) => void;
}) {
  const id = useId();
  return (
    <div className="f">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function Num({ label, value, onChange, min, max, step = 1, hint }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; hint?: string;
}) {
  const id = useId();
  return (
    <div className="f">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="number" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))} />
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function Check({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="f f-check">
      <input id={id} type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

export function Color({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="f f-color">
      <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

/* Photos are shrunk in the browser before upload: ~2000px WebP is
   plenty for a full-screen photo and keeps the site fast. */
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * k);
  canvas.height = Math.round(bmp.height * k);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const out = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.82));
  if (!out) throw new Error("Could not process this image.");
  return out;
}

function useUpload() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = async (fn: () => Promise<string>, done: (url: string) => void) => {
    setBusy(true);
    setError("");
    try {
      done(await fn());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, run };
}

export function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { busy, error, run } = useUpload();
  const pick = (file?: File) => {
    if (!file) return;
    run(async () => {
      let body: Blob;
      try {
        body = await shrink(file);
      } catch {
        throw new Error("This browser can't read that file — please export it as JPEG first (HEIC isn't supported).");
      }
      const blob = await upload(`images/photo.webp`, body, {
        access: "public", handleUploadUrl: "/api/upload", contentType: "image/webp",
      });
      return blob.url;
    }, onChange);
  };
  return (
    <div className="f f-media">
      <span className="f-label">{label}</span>
      <div className="f-media-row">
        <div className="thumb">{value ? <img src={value} alt="" /> : <span>no photo</span>}</div>
        <div className="f-media-actions">
          <label className="btn">
            {busy ? "Uploading…" : value ? "Replace" : "Upload photo"}
            <input type="file" accept="image/*" hidden disabled={busy} onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          {value && <button type="button" className="btn btn-quiet" onClick={() => onChange("")}>Remove</button>}
        </div>
      </div>
      {error && <small className="err">{error}</small>}
    </div>
  );
}

export function AudioField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { busy, error, run } = useUpload();
  const pick = (file?: File) => {
    if (!file) return;
    run(async () => {
      const blob = await upload(`audio/${file.name.replace(/[^\w.-]+/g, "-")}`, file, {
        access: "public", handleUploadUrl: "/api/upload", contentType: file.type || "audio/mpeg",
      });
      return blob.url;
    }, onChange);
  };
  return (
    <div className="f f-media">
      <span className="f-label">Song</span>
      {value ? <audio controls src={value} preload="none" /> : <small>No song — the site stays silent and shows no sound button.</small>}
      <div className="f-media-actions">
        <label className="btn">
          {busy ? "Uploading…" : value ? "Replace song" : "Upload song"}
          <input type="file" accept="audio/*" hidden disabled={busy} onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        {value && <button type="button" className="btn btn-quiet" onClick={() => onChange("")}>Remove</button>}
      </div>
      {error && <small className="err">{error}</small>}
    </div>
  );
}

/* A reorderable list of cards. */
export function List<T>({ items, onChange, make, render, noun, min = 0 }: {
  items: T[];
  onChange: (items: T[]) => void;
  make: () => T;
  render: (item: T, set: (next: T) => void, index: number) => ReactNode;
  noun: string;
  min?: number;
}) {
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="list">
      {items.map((item, i) => (
        <div className="card" key={i}>
          <div className="card-head">
            <span>{noun} {i + 1}</span>
            <span className="card-tools">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
              <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
              <button type="button" disabled={items.length <= min} onClick={() => onChange(items.filter((_, j) => j !== i))}>Remove</button>
            </span>
          </div>
          {render(item, (next) => onChange(items.map((x, j) => (j === i ? next : x))), i)}
        </div>
      ))}
      <button type="button" className="btn btn-add" onClick={() => onChange([...items, make()])}>+ Add {noun.toLowerCase()}</button>
    </div>
  );
}
