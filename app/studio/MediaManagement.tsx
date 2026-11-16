"use client";
import { useState } from "react";
import type { StudioMedia } from "@/lib/studio/media.server";
import { studioRequest } from "./useStudioData";
import Feedback from "../components/Feedback";
import ConfirmDialog from "./ConfirmDialog";

export default function MediaManagement({ item, onChanged }: { item: StudioMedia; onChanged: () => Promise<void> }) {
  const [title, setTitle] = useState(item.title);
  const [busy, setBusy] = useState(false);
  const [action, setAction] = useState("");
  const [error, setError] = useState("");
  async function change(operation: string) {
    if (busy) return;
    setBusy(true); setError(""); setAction("");
    try {
      await studioRequest(`/api/studio/media/${item.id.slice(7)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: operation, title }) });
      await onChanged();
    } catch (error) { setError(error instanceof Error ? error.message : "Could not update this media."); }
    finally { setBusy(false); }
  }
  return <div><label className="studio-field">Media title<input value={title} maxLength={200} onChange={(event) => setTitle(event.target.value)} /></label><div className="studio-actions"><button type="button" disabled={busy || !title.trim() || title === item.title} onClick={() => { void change("rename"); }}>Save title</button><button type="button" disabled={busy} onClick={() => setAction(item.archived ? "recover" : "archive")}>{item.archived ? "Recover media" : "Move unused media to trash"}</button></div>{item.archived && <p>In media trash. The private original is retained.</p>}{error && <Feedback kind="error">{error}</Feedback>}<ConfirmDialog open={Boolean(action)} title="Change media availability?" description="Media in drafts, revision history, or publications is protected from removal. Unused files can move to trash and be recovered later." onClose={() => setAction("")} onConfirm={() => { void change(action); }} /></div>;
}
