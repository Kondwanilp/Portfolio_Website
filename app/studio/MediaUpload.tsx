"use client";
import { useRef, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import { STUDIO_BUCKET, validateUpload, uploadTypes } from "@/lib/studio/uploads";
import { studioRequest } from "./useStudioData";
import Feedback from "../components/Feedback";
import StudioField from "./StudioField";
import { finishStudioUpload } from "@/lib/studio/upload-lifecycle";

export default function MediaUpload({ onUploaded }: { onUploaded: () => Promise<void> }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const ticket = useRef<{ id: string; path: string; token: string; uploaded?: boolean } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const running = useRef(false);
  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!file || running.current) return;
    running.current = true; setBusy(true); setError(""); setMessage("");
    try {
      const metadata = validateUpload({ title, mime: file.type, size: file.size });
      if (!ticket.current) ticket.current = await studioRequest("/api/studio/media/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(metadata) });
      const current = ticket.current!;
      await finishStudioUpload(current,
        () => supabase.storage.from(STUDIO_BUCKET).uploadToSignedUrl(current.path, current.token, file, { contentType: file.type, upsert: false }),
        () => studioRequest("/api/studio/media/upload", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...metadata, id: current.id }) }),
      );
      ticket.current = null; setFile(null); setTitle("");
      if (input.current) input.current.value = "";
      setMessage("Media saved privately. Attach it to an entry to preview or publish.");
      await onUploaded();
    } catch (error) { setError(error instanceof Error ? error.message : "Could not upload this file. Please retry."); }
    finally { running.current = false; setBusy(false); }
  }
  return <form className="studio-media-upload" onSubmit={(event) => { void upload(event); }}><h2>Add to your media library.</h2><p>Private JPEG, PNG, WebP, PDF, MP4, and WebM files up to 50 MB. Use Court Vision for larger basketball videos.</p><fieldset disabled={busy}><StudioField label="File"><input ref={input} type="file" accept={Object.keys(uploadTypes).join(",")} required onChange={(event) => { const selected = event.target.files?.[0] ?? null; ticket.current = null; setFile(selected); setTitle(selected?.name.slice(0, 200) ?? ""); }} /></StudioField><StudioField label="Title"><input value={title} maxLength={200} required onChange={(event) => setTitle(event.target.value)} /></StudioField><button type="submit" className="studio-primary" disabled={!file}>{busy ? "Uploading..." : error ? "Retry upload" : "Upload privately"}</button></fieldset>{error && <Feedback kind="error">{error}</Feedback>}{message && <Feedback kind="success">{message}</Feedback>}</form>;
}
