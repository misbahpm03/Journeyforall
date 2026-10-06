"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import {
  aspects, blankExhibit, blankPhoto, gardenKinds, themeKeys, defaultContent,
  type GardenObject, type GiftContent,
} from "@/content/gift";
import { logout, save } from "./actions";
import { Area, AudioField, Check, Color, ImageField, List, Num, Pick, Text } from "./fields";
import { emailjsReady, sendMessage } from "@/lib/emailjs";

const chapters = ["opening", "scrapbook", "museum", "garden", "letter", "universe"];

export function Editor({ initial, storage }: { initial: GiftContent; storage: boolean }) {
  const [c, setC] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(c) !== saved;

  // edit a copy, so every field can just assign
  const edit = (fn: (d: GiftContent) => void) =>
    setC((prev) => { const d = structuredClone(prev); fn(d); return d; });

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [dirty]);

  const onSave = () => start(async () => {
    const r = await save(c);
    if (r.ok) setSaved(JSON.stringify(c));
    setStatus(r.ok ? { ok: true, text: "Saved. The site is updated." } : { ok: false, text: r.error ?? "Could not save." });
  });

  return (
    <div className="admin">
      <header className="admin-head">
        <div>
          <p className="admin-eyebrow">little world · editor</p>
          <h1>{c.recipientName || "Untitled"}</h1>
        </div>
        <form action={logout}><button className="btn btn-quiet">Sign out</button></form>
      </header>

      {!storage && (
        <p className="notice">
          Blob storage isn&apos;t connected, so nothing can be saved or uploaded yet. In Vercel: Storage → Create → Blob
          (public) → connect it to this project, then redeploy.
        </p>
      )}

      <Section title="Her" open>
        <Text label="Her name" value={c.recipientName} onChange={(v) => edit((d) => { d.recipientName = v; })}
          hint="Anywhere you write {name}, this is used instead." />
        <Text label="Initial for the final constellation" value={c.recipientInitial} placeholder="e.g. M"
          onChange={(v) => edit((d) => { d.recipientInitial = v.slice(0, 1).toUpperCase(); })}
          hint="One letter. Leave empty for a small flower instead." />
        <Text label="Browser tab title" value={c.pageTitle} onChange={(v) => edit((d) => { d.pageTitle = v; })} />
        <Text label="Loading line" value={c.loading} onChange={(v) => edit((d) => { d.loading = v; })} />
      </Section>

      <Section title="Opening · the envelope">
        <Text label="First line" value={c.opening.line1} onChange={(v) => edit((d) => { d.opening.line1 = v; })} />
        <Text label="Second line" value={c.opening.line2} onChange={(v) => edit((d) => { d.opening.line2 = v; })} />
        <Text label="Hint under the envelope" value={c.opening.hint} onChange={(v) => edit((d) => { d.opening.hint = v; })} />
      </Section>

      <Section title="01 · The scrapbook">
        <Text label="Heading" value={c.scrapbook.heading} onChange={(v) => edit((d) => { d.scrapbook.heading = v; })} />
        <Text label="Handwritten line under it" value={c.scrapbook.subheading} onChange={(v) => edit((d) => { d.scrapbook.subheading = v; })} />
        <List
          noun="Photo"
          items={c.scrapbook.photos}
          make={blankPhoto}
          onChange={(v) => edit((d) => { d.scrapbook.photos = v; })}
          render={(p, set) => (
            <>
              <ImageField label="Photo" value={p.image} onChange={(image) => set({ ...p, image })} />
              <div className="row">
                <Pick label="Shape" value={p.aspect} options={aspects} onChange={(aspect) => set({ ...p, aspect })} />
                <Text label="Title" value={p.title} onChange={(title) => set({ ...p, title })} />
              </div>
              <Area label="Note (shown when she opens it)" value={p.note} onChange={(note) => set({ ...p, note })} />
              <Text label="Scribble on the page" value={p.scribble} onChange={(scribble) => set({ ...p, scribble })} />
              <div className="row">
                <Text label="Date" value={p.date} onChange={(date) => set({ ...p, date })} />
                <Text label="Place" value={p.place} onChange={(place) => set({ ...p, place })} />
              </div>
              <Text label="Secret (press and hold the photo)" value={p.secret} onChange={(secret) => set({ ...p, secret })} />
              <Text label="Description for screen readers" value={p.alt} onChange={(alt) => set({ ...p, alt })} />
            </>
          )}
        />
        <Text label="Link to the museum" value={c.scrapbook.next} onChange={(v) => edit((d) => { d.scrapbook.next = v; })} />
      </Section>

      <Section title="02 · The museum">
        <Text label="Title" value={c.museum.title} onChange={(v) => edit((d) => { d.museum.title = v; })} />
        <Area label="Subtitle" rows={2} value={c.museum.subtitle} onChange={(v) => edit((d) => { d.museum.subtitle = v; })} />
        <List
          noun="Exhibit"
          min={1}
          items={c.museum.exhibits}
          make={blankExhibit}
          onChange={(v) => edit((d) => { d.museum.exhibits = v; })}
          render={(x, set) => (
            <>
              <ImageField label="Artwork" value={x.image} onChange={(image) => set({ ...x, image })} />
              <div className="row">
                <Pick label="Shape" value={x.aspect} options={aspects} onChange={(aspect) => set({ ...x, aspect })} />
                <Text label="Title" value={x.title} onChange={(title) => set({ ...x, title })} />
              </div>
              <Text label="Small print (medium, date)" value={x.medium} onChange={(medium) => set({ ...x, medium })} />
              <Area label="Description" value={x.description} onChange={(description) => set({ ...x, description })} />
              <Text label="Description for screen readers" value={x.alt} onChange={(alt) => set({ ...x, alt })} />
            </>
          )}
        />
        <small className="aside">The first exhibit is also the little photo at the end of the scrapbook.</small>
        <Text label="Exit button" value={c.museum.exit} onChange={(v) => edit((d) => { d.museum.exit = v; })} />
      </Section>

      <Section title="03 · The garden">
        <Text label="Opening line" value={c.garden.intro} onChange={(v) => edit((d) => { d.garden.intro = v; })} />
        <List
          noun="Thing"
          min={1}
          items={c.garden.objects}
          make={(): GardenObject => ({ kind: "flower", title: "", text: "", image: "" })}
          onChange={(v) => edit((d) => { d.garden.objects = v; })}
          render={(o, set) => (
            <>
              <div className="row">
                <Pick label="What it is" value={o.kind} options={gardenKinds} onChange={(kind) => set({ ...o, kind })} />
                <Text label="Title" value={o.title} onChange={(title) => set({ ...o, title })} />
              </div>
              <Area label="What it says" value={o.text} onChange={(text) => set({ ...o, text })} />
              <ImageField label="A photo it reveals (optional)" value={o.image} onChange={(image) => set({ ...o, image })} />
            </>
          )}
        />
        <div className="row">
          <Num label="Found before the letter appears" min={1} max={12} value={c.garden.findBeforeNote}
            onChange={(v) => edit((d) => { d.garden.findBeforeNote = v; })} />
          <Text label="The note's label" value={c.garden.note} onChange={(v) => edit((d) => { d.garden.note = v; })} />
        </div>
      </Section>

      <Section title="04 · The letter">
        <Text label="Greeting" value={c.letter.greeting} onChange={(v) => edit((d) => { d.letter.greeting = v; })} />
        <List
          noun="Paragraph"
          min={1}
          items={c.letter.paragraphs}
          make={() => ""}
          onChange={(v) => edit((d) => { d.letter.paragraphs = v; })}
          render={(p, set) => <Area label="Text" rows={5} value={p} onChange={set} />}
        />
        <div className="row">
          <Text label="Sign-off" value={c.letter.closing} onChange={(v) => edit((d) => { d.letter.closing = v; })} />
          <Text label="Your name" value={c.letter.signature} onChange={(v) => edit((d) => { d.letter.signature = v; })} />
        </div>
        <ImageField label="A photo clipped to the letter (optional)" value={c.letter.image} onChange={(v) => edit((d) => { d.letter.image = v; })} />
        <Text label="Button after the letter" value={c.letter.next} onChange={(v) => edit((d) => { d.letter.next = v; })} />
      </Section>

      <Section title="05 · The sky">
        <Text label="First line" value={c.ending.line1} onChange={(v) => edit((d) => { d.ending.line1 = v; })} />
        <Text label="Second line" value={c.ending.line2} onChange={(v) => edit((d) => { d.ending.line2 = v; })} />
        <Text label="Name" value={c.ending.name} onChange={(v) => edit((d) => { d.ending.name = v; })} />
        <Text label="Last little line" value={c.ending.whisper} onChange={(v) => edit((d) => { d.ending.whisper = v; })} />
      </Section>

      <Section title="Hidden things">
        <Text label="Bright star in the garden, tapped 3 times" value={c.easterEggs.secretStar} onChange={(v) => edit((d) => { d.easterEggs.secretStar = v; })} />
        <Text label="Press-and-hold note (photos without their own secret)" value={c.easterEggs.hiddenNote} onChange={(v) => edit((d) => { d.easterEggs.hiddenNote = v; })} />
        <Text label="If she stays on the last screen" value={c.easterEggs.finalMessage} onChange={(v) => edit((d) => { d.easterEggs.finalMessage = v; })} />
        <div className="row">
          <Text label="An important date (DD.MM)" value={c.easterEggs.importantDate} placeholder="14.02" onChange={(v) => edit((d) => { d.easterEggs.importantDate = v; })} />
          <Text label="…what it was" value={c.easterEggs.importantDateLabel} onChange={(v) => edit((d) => { d.easterEggs.importantDateLabel = v; })} />
        </div>
      </Section>

      <Section title="Writing back">
        <Check label="Let her write back from the last page" value={c.writeBack.enabled} onChange={(v) => edit((d) => { d.writeBack.enabled = v; })} />
        <div className="row">
          <Text label="The invitation" value={c.writeBack.invite} onChange={(v) => edit((d) => { d.writeBack.invite = v; })} />
          <Text label="Send button" value={c.writeBack.button} onChange={(v) => edit((d) => { d.writeBack.button = v; })} />
        </div>
        <Text label="Placeholder in the empty page" value={c.writeBack.placeholder} onChange={(v) => edit((d) => { d.writeBack.placeholder = v; })} />
        <Text label="After she sends it" value={c.writeBack.thanks} onChange={(v) => edit((d) => { d.writeBack.thanks = v; })} />
        <div className="row">
          <Text label="EmailJS service ID" value={c.writeBack.emailjs.serviceId} onChange={(v) => edit((d) => { d.writeBack.emailjs.serviceId = v.trim(); })} />
          <Text label="EmailJS template ID" value={c.writeBack.emailjs.templateId} onChange={(v) => edit((d) => { d.writeBack.emailjs.templateId = v.trim(); })} />
        </div>
        <Text label="EmailJS public key" value={c.writeBack.emailjs.publicKey} onChange={(v) => edit((d) => { d.writeBack.emailjs.publicKey = v.trim(); })}
          hint="Template variables you can use: {{message}}, {{from_name}}, {{recipient}}, {{sent_at}}, {{page_url}}." />
        <TestSend ids={c.writeBack.emailjs} recipient={c.recipientName} />
      </Section>

      <Section title="Music">
        <AudioField value={c.audio.src} onChange={(v) => edit((d) => { d.audio.src = v; })} />
        <Num label="Volume (0–1)" min={0} max={1} step={0.05} value={c.audio.volume} onChange={(v) => edit((d) => { d.audio.volume = v; })}
          hint="Starts after she opens the envelope, fading in. Quiet piano or ambient works best." />
      </Section>

      <Section title="Colours">
        <div className="colors">
          {themeKeys.map((k) => (
            <Color key={k} label={k.replace("-", " ")} value={c.theme[k]} onChange={(v) => edit((d) => { d.theme[k] = v; })} />
          ))}
        </div>
        <button type="button" className="btn btn-quiet" onClick={() => edit((d) => { d.theme = { ...defaultContent.theme }; })}>Reset colours</button>
      </Section>

      <footer className="admin-bar">
        <span className={`admin-status ${status?.ok === false ? "err" : ""}`} role="status">
          {pending ? "Saving…" : dirty ? "Unsaved changes" : status?.text ?? "All saved"}
        </span>
        <span className="admin-bar-links">
          <a href="/" target="_blank" rel="noreferrer">View site ↗</a>
          <select aria-label="Jump to a chapter" defaultValue="" onChange={(e) => { if (e.target.value) open(`/#${e.target.value}`, "_blank"); e.target.value = ""; }}>
            <option value="">Preview chapter…</option>
            {chapters.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
          </select>
        </span>
        <button className="btn btn-save" onClick={onSave} disabled={pending || !dirty || !storage}>Save</button>
      </footer>
    </div>
  );
}

function TestSend({ ids, recipient }: { ids: GiftContent["writeBack"]["emailjs"]; recipient: string }) {
  const [state, setState] = useState("");
  const run = async () => {
    setState("Sending…");
    try {
      await sendMessage(ids, { message: "A test from the editor — if you're reading this, writing back works.", from_name: "the editor", recipient });
      setState("Sent — check your inbox.");
    } catch (e) {
      setState(`Didn't work: ${e instanceof Error ? e.message : "unknown error"}`);
    }
  };
  return (
    <div className="f-test">
      <button type="button" className="btn" disabled={!emailjsReady(ids)} onClick={run}>Send a test</button>
      {state && <small className={state.startsWith("Didn't") ? "err" : ""}>{state}</small>}
    </div>
  );
}

function Section({ title, children, open }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="section" open={open}>
      <summary>{title}</summary>
      <div className="section-body">{children}</div>
    </details>
  );
}
