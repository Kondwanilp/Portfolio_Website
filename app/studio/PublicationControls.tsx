"use client";
import { useState } from "react";
import type { StudioDraft } from "@/lib/studio/content";
import type { StudioRevision } from "@/lib/studio/repository";
import Feedback from "../components/Feedback";
import ConfirmDialog from "./ConfirmDialog";
import { studioRequest, useStudioData } from "./useStudioData";

const explanations: Record<string, string> = {
  publish: "Publish this saved revision and its attached media to the public portfolio? Draft changes made afterward stay private until you publish again.",
  unpublish: "Remove the public snapshot? Previously issued media links can remain valid for up to 60 seconds. Your draft and history are preserved.",
  archive: "Unpublish and archive this entry? You can reactivate it later.",
  delete: "Move this entry to trash and remove its public snapshot? Its revisions remain recoverable.",
  reactivate: "Recover this entry as a private draft? Publication requires a separate confirmation.",
  restore: "Recover the selected revision as a new private draft revision? The current public snapshot remains unchanged.",
};
export default function PublicationControls({ entry, disabled, onChanged }: { entry: StudioDraft; disabled: boolean; onChanged: (entry: StudioDraft) => Promise<void> }) {
  const history = useStudioData<{ revisions: StudioRevision[] }>(`/api/studio/content/${entry.id}`);
  const [action, setAction] = useState("");
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function perform() {
    if (busy || disabled) return;
    setBusy(true); setError(""); setMessage(""); setAction("");
    try {
      await studioRequest(`/api/studio/content/${entry.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, revision: entry.revision, restoreRevision: revision, confirm: true }) });
      const result = await studioRequest<{ entries: StudioDraft[] }>("/api/studio/content");
      const refreshed = result.entries.find((item) => item.id === entry.id);
      if (!refreshed) throw new Error("Reload this collection to view the result.");
      await onChanged(refreshed); await history.reload();
      setMessage("Your change is saved. Public views have been refreshed.");
    } catch (error) { setError(error instanceof Error ? error.message : "Could not complete this action. Reload before retrying."); }
    finally { setBusy(false); }
  }
  const inactive = Boolean(entry.archivedAt || entry.deletedAt);
  return <section className="studio-publication" aria-label="Publication and recovery"><h3>Publication & recovery</h3>
    <p>{entry.deletedAt ? "In trash" : entry.archivedAt ? "Archived" : "Private working draft"} · Saved revision {entry.revision}{entry.publishedRevision ? ` · Public revision ${entry.publishedRevision}` : " · Unpublished"}</p>
    <div className="studio-actions">
      {!inactive && <button type="button" disabled={disabled || busy || entry.workflow !== "ready"} onClick={() => setAction("publish")}>Publish saved revision</button>}
      {entry.publishedRevision && <button type="button" disabled={disabled || busy} onClick={() => setAction("unpublish")}>Unpublish</button>}
      {!inactive && <button type="button" disabled={disabled || busy} onClick={() => setAction("archive")}>Archive</button>}
      {!entry.deletedAt && <button type="button" disabled={disabled || busy} onClick={() => setAction("delete")}>Move to trash</button>}
      {inactive && <button type="button" disabled={disabled || busy} onClick={() => setAction("reactivate")}>Recover as draft</button>}
    </div>
    <label className="studio-field">Revision history<select value={revision} onChange={(event) => setRevision(Number(event.target.value))}><option value={0}>Choose a saved revision</option>{history.data?.revisions.map((item) => <option value={item.revision} key={item.revision}>Revision {item.revision} · {new Date(item.created_at).toLocaleString()}</option>)}</select></label>
    <button type="button" disabled={!revision || disabled || busy} onClick={() => setAction("restore")}>Recover selected revision</button>
    {history.error && <Feedback kind="error" action={<button type="button" onClick={() => { void history.reload(); }}>Reload history</button>}>{history.error}</Feedback>}
    {error && <Feedback kind="error">{error} Reload the entry before retrying if the result is uncertain.</Feedback>}
    {message && <Feedback kind="success">{message}</Feedback>}
    <ConfirmDialog open={Boolean(action)} title="Confirm content change" description={explanations[action] || ""} onClose={() => setAction("")} onConfirm={() => { void perform(); }} />
  </section>;
}
