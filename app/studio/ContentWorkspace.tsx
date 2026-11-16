"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { contentModule, parseDraft, type ContentKind, type StudioDraft } from "../../lib/studio/content";
import type { StudioMedia } from "../../lib/studio/media.server";
import Feedback from "../components/Feedback";
import ConfirmDialog from "./ConfirmDialog";
import ContentPreview from "./ContentPreview";
import PublicationControls from "./PublicationControls";
import StudioField from "./StudioField";
import { useStudioEditing } from "./EditingContext";
import { studioRequest, useStudioData } from "./useStudioData";

function DraftEditor({ entry, media, onSaved }: { entry: StudioDraft; media: StudioMedia[]; onSaved: () => Promise<void> }) {
  const [value, setValue] = useState(entry);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  const running = useRef(false);
  const { unsaved, setUnsaved } = useStudioEditing();
  const collection = contentModule(value.kind)!;

  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) { if (unsaved) event.preventDefault(); }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [unsaved]);
  useEffect(() => () => setUnsaved(false), [setUnsaved]);

  function change(key: "title" | "slug" | "summary" | "body", text: string) {
    setValue((current) => ({ ...current, [key]: text }));
    setUnsaved(true); setMessage("");
  }
  async function save(workflow: "draft" | "ready") {
    if (running.current) return;
    setError(""); setMessage(""); setConfirm(false);
    try { parseDraft({ ...value, workflow }); }
    catch (error) { setError(error instanceof Error ? error.message : "Check this entry."); return; }
    running.current = true; setBusy(true);
    try {
      const result = await studioRequest<{ entry: StudioDraft }>("/api/studio/content", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entry: { ...value, workflow }, revision: value.revision }),
      });
      setValue((current) => ({ ...current, ...result.entry })); setUnsaved(false);
      setMessage(workflow === "ready" ? "Saved and ready for publication review." : "Private draft saved to Supabase.");
      await onSaved();
    } catch (error) { setError(error instanceof Error ? error.message : "Could not save this entry."); }
    finally { running.current = false; setBusy(false); }
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void save("draft"); }
  return (
    <section className="studio-editor">
      <div className="studio-editor-heading"><h2>{value.revision ? "Edit entry" : "New entry"}</h2><span className="studio-label">{unsaved ? "UNSAVED CHANGES" : value.workflow === "ready" ? "READY FOR REVIEW" : "DRAFT"}</span></div>
      <form onSubmit={submit}>
        <fieldset disabled={busy || Boolean(value.archivedAt || value.deletedAt)}>
          <StudioField label="Title"><input value={value.title} maxLength={200} onChange={(event) => change("title", event.target.value)} required /></StudioField>
          <StudioField label="Slug" hint="Lowercase words separated by hyphens."><input value={value.slug} maxLength={120} onChange={(event) => change("slug", event.target.value)} pattern="[a-z0-9]+(-[a-z0-9]+)*" required /></StudioField>
          <StudioField label="Summary"><textarea value={value.summary} rows={3} maxLength={1000} onChange={(event) => change("summary", event.target.value)} /></StudioField>
          {collection.fields.map((field) => <StudioField label={field.label} key={field.key}>
            {"options" in field ? <select value={value.details[field.key] ?? ""} onChange={(event) => { setValue((current) => ({ ...current, details: { ...current.details, [field.key]: event.target.value } })); setUnsaved(true); }}><option value="">Choose a channel</option>{field.options.map((option) => <option key={option}>{option}</option>)}</select> : <input value={value.details[field.key] ?? ""} maxLength={2000} onChange={(event) => { setValue((current) => ({ ...current, details: { ...current.details, [field.key]: event.target.value } })); setUnsaved(true); }} />}
          </StudioField>)}
          <StudioField label="Body" hint="Separate paragraphs with a blank line."><textarea value={value.body} rows={12} maxLength={50000} onChange={(event) => change("body", event.target.value)} /></StudioField>
          <div className="studio-field"><span>Media references</span><div className="studio-media-picker">{media.filter((item) => !item.archived || value.media.includes(item.id)).map((item) => <label key={item.id}><input type="checkbox" checked={value.media.includes(item.id)} onChange={(event) => { setValue((current) => ({ ...current, media: event.target.checked ? [...current.media, item.id] : current.media.filter((id) => id !== item.id) })); setUnsaved(true); }} />{item.title}</label>)}</div></div>
        </fieldset>
        {error && <Feedback kind="error">{error}</Feedback>}
        {message && <Feedback kind="success">{message}</Feedback>}
        <div className="studio-actions">
          <button className="studio-primary" type="submit" disabled={busy || Boolean(value.archivedAt || value.deletedAt)}>{busy ? "Saving..." : "Save draft"}</button>
          <button type="button" disabled={busy} onClick={() => setPreview((current) => !current)}>{preview ? "Close preview" : "Preview"}</button>
          <button type="button" disabled={busy || Boolean(value.archivedAt || value.deletedAt)} onClick={() => setConfirm(true)}>Mark ready for review</button>
          {value.revision > 0 && !unsaved && <a className="studio-button" href={`/api/studio/export/${value.id}`}>Export saved entry</a>}
        </div>
      </form>
      {value.revision > 0 && <PublicationControls entry={value} disabled={busy || unsaved} onChanged={async (entry) => { setValue(entry); await onSaved(); }} />}
      {preview && <ContentPreview entry={value} media={media} />}
      <ConfirmDialog open={confirm} title="Ready for publication review?" description="Save this version as ready for review. Preview this revision, then use the separate publication confirmation to make it public." onClose={() => setConfirm(false)} onConfirm={() => { void save("ready"); }} />
    </section>
  );
}

export default function ContentWorkspace({ kind }: { kind: ContentKind }) {
  const collection = contentModule(kind)!;
  const drafts = useStudioData<{ entries: StudioDraft[] }>("/api/studio/content");
  const library = useStudioData<{ media: StudioMedia[]; warning: string | null }>("/api/studio/media");
  const [selected, setSelected] = useState<StudioDraft | null>(null);
  const [pending, setPending] = useState<StudioDraft | null>(null);
  const { unsaved, setUnsaved } = useStudioEditing();
  function select(entry: StudioDraft) {
    
    if (unsaved) setPending(entry);
    else setSelected(entry);
  }
  function create() {
    select({ id: crypto.randomUUID(), kind, title: "", slug: "", summary: "", body: "", details: {}, media: [], workflow: "draft", revision: 0, updatedAt: "" });
  }
  const entries = drafts.data?.entries.filter((entry) => entry.kind === kind) ?? [];
  return (
    <>
      <header className="studio-heading"><p className="studio-label">YOUR COLLECTIONS</p><h1>{collection.title}<em>.</em></h1><p>{collection.description}</p></header>
      <div className="studio-toolbar"><p>Private drafts and immutable public snapshots are stored separately in Supabase.</p><Link href={collection.publicPath} target="_blank">View current portfolio ↗</Link></div>
      {(drafts.error || library.error) && <Feedback kind="error" action={<button type="button" onClick={() => { void drafts.reload(); void library.reload(); }}>Try again</button>}>{drafts.error || library.error}</Feedback>}
      <div className="studio-content-layout">
        <aside className="studio-entry-sidebar"><button type="button" className="studio-primary" disabled={drafts.loading || Boolean(drafts.error)} onClick={create}>New entry</button>
          {drafts.loading ? <Feedback kind="loading">Loading drafts...</Feedback> : !entries.length ? <Feedback kind="empty">Your first draft starts here.</Feedback> : <ul className="studio-entry-list">{entries.map((entry) => <li key={entry.id}><button type="button" aria-pressed={selected?.id === entry.id} onClick={() => select(entry)}>{entry.title}<small>{entry.deletedAt ? "Trash" : entry.archivedAt ? "Archived" : entry.publishedRevision ? "Published + working draft" : entry.workflow === "ready" ? "Ready for review" : "Draft"}</small></button></li>)}</ul>}
        </aside>
        {selected ? <DraftEditor key={`${selected.id}:${selected.revision}:${selected.publishedRevision ?? "private"}:${selected.archivedAt ?? "active"}:${selected.deletedAt ?? "kept"}`} entry={selected} media={library.data?.media ?? []} onSaved={drafts.reload} /> : <div className="studio-editor-intro"><h2>Room for your next idea.</h2><p>Choose an entry to edit, or start a new draft.</p></div>}
      </div>
      <ConfirmDialog open={pending !== null} title="Open another entry?" description="Your unsaved changes will be discarded. Save this draft first to keep them." onClose={() => setPending(null)} onConfirm={() => { setUnsaved(false); setSelected(pending); setPending(null); }} />
    </>
  );
}
