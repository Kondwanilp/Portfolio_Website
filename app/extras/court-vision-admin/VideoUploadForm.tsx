"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createVideoGateway, requireCourtOwner, videoFileExists } from "../../../lib/court-vision-repository";
import { forgetUpload, uploadCourtVideo, uploadIdentity } from "../../../lib/court-video-upload";
import { saveVideoDraft, validateVideoDetails, validateVideoFile } from "../../../lib/video-lifecycle";
import Feedback from "../../components/Feedback";

export default function VideoUploadForm({ ownerId, today, onSaved }: { ownerId: string; today: string; onSaved: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const controller = useRef<AbortController | null>(null);
  const running = useRef(false);
  useEffect(() => () => controller.current?.abort(), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (running.current) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const file = values.get("video") as File;
    setError("");
    setMessage("");
    try {
      validateVideoFile(file);
      validateVideoDetails({ title: String(values.get("title")), location: String(values.get("location")), played_on: String(values.get("played_on")) });
    } catch (error) { setError(error instanceof Error ? error.message : "Choose a valid video."); return; }
    running.current = true;
    controller.current = new AbortController();
    const signal = controller.current.signal;
    setBusy(true);
    setProgress(0);
    try {
      await requireCourtOwner();
      const identity = uploadIdentity(file, ownerId);
      setMessage("Preparing your upload...");
      // A completed object is reused after a failed metadata save or page reload.
      if (!await videoFileExists(identity.path, file.size)) await uploadCourtVideo(file, identity, signal, setProgress);
      signal.throwIfAborted();
      setMessage("Saving video details...");
      await saveVideoDraft(createVideoGateway(AbortSignal.any([signal, AbortSignal.timeout(20_000)])), {
        id: identity.id, storage_path: identity.path,
        title: String(values.get("title")).trim(), description: String(values.get("description")).trim() || null,
        played_on: String(values.get("played_on")), location: String(values.get("location")).trim(), is_published: false,
      });
      forgetUpload(identity);
      form.reset();
      setMessage("Upload complete! Your video is saved as a draft.");
      await onSaved();
    } catch (error) {
      setMessage("");
      setError(signal.aborted ? "Upload paused. Select the same file to resume." : error instanceof Error ? error.message : "Upload failed. Retry with the same file.");
    } finally { running.current = false; setBusy(false); }
  }
  return (
    <section className="cv-admin-section">
      <div className="cv-admin-section-heading"><div>
        <p className="cv-admin-eyebrow">01 / THE HIGHLIGHTS</p><h2>Upload a video.</h2>
        <p className="cv-admin-muted">Add a pickup clip. Videos are saved as drafts until you publish them.</p>
        <p className="cv-admin-muted">Drafts are hidden from the portfolio. Uploaded files can be opened by anyone with their link.</p>
      </div></div>
      <form className="cv-admin-form" onSubmit={submit} aria-busy={busy}>
        <fieldset className="cv-admin-fields" disabled={busy}>
          <label className="cv-admin-full">Video file<input name="video" type="file" accept="video/mp4,video/quicktime,.mp4,.mov" required /><small>MP4 or MOV · Maximum 45 MB. Select the same file to resume an interrupted upload.</small></label>
          <label>Video title<input name="title" placeholder="e.g. Friday night runs" required /></label>
          <label>Date played<input name="played_on" type="date" defaultValue={today} required /></label>
          <label>Location<input name="location" placeholder="e.g. GSU Recreation Center" required /></label>
          <label className="cv-admin-full">Description <span>(optional)</span><textarea name="description" rows={3} placeholder="A little context about this game..." /></label>
        </fieldset>
        {busy && <div className="cv-admin-full">
          <Feedback kind="loading">{message} {progress}%</Feedback>
          <progress aria-label="Video upload" max={100} value={progress} />
          <button type="button" onClick={() => controller.current?.abort()}>Pause upload</button>
        </div>}
        {error && <div className="cv-admin-full"><Feedback kind="error">{error}</Feedback></div>}
        {message && !busy && <div className="cv-admin-full"><Feedback kind="success">{message}</Feedback></div>}
        <button className="cv-admin-primary cv-admin-full" type="submit" disabled={busy}>{busy ? "Uploading video..." : "Upload video"}</button>
      </form>
    </section>
  );
}
