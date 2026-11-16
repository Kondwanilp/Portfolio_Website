"use client";

import { useRef, useState } from "react";
import { supabase } from "../../../lib/supabase/client";
import { COURT_VIDEO_BUCKET, formatCourtDate, type CourtVideo } from "../../../lib/court-vision";
import { createVideoGateway, publishCourtVideo, requireCourtOwner } from "../../../lib/court-vision-repository";
import { deleteCourtVideo } from "../../../lib/video-lifecycle";
import Feedback from "../../components/Feedback";

export default function VideoLibrary({ videos, onChanged }: { videos: CourtVideo[]; onChanged: () => Promise<void> }) {
  const [busy, setBusy] = useState<string[]>([]);
  const locks = useRef(new Set<string>());
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function perform(video: CourtVideo, action: "publish" | "delete") {
    if (locks.current.has(video.id)) return;
    if (action === "delete" && !window.confirm(`Delete "${video.title}" permanently? This cannot be undone.`)) return;
    locks.current.add(video.id);
    setBusy([...locks.current]);
    setError(""); setMessage("");
    try {
      const mutate = async () => {
        if (action === "delete") {
          await requireCourtOwner();
          await deleteCourtVideo(createVideoGateway(), video.id);
        } else await publishCourtVideo(video);
      };
      if (navigator.locks) await navigator.locks.request(`court-video:${video.id}`, mutate);
      else await mutate();
      setMessage(action === "delete" ? "Video deleted." : video.is_published ? "Video unpublished." : "Video published.");
    } catch (error) { setError(error instanceof Error ? error.message : "Could not update this video. Please retry."); }
    finally {
      await onChanged();
      locks.current.delete(video.id);
      setBusy([...locks.current]);
    }
  }
  return (
    <section className="cv-admin-section">
      <div className="cv-admin-section-heading"><div><p className="cv-admin-eyebrow">02 / YOUR LIBRARY</p><h2>Video manager.</h2><p className="cv-admin-muted">Review drafts and control which videos visitors can see.</p></div></div>
      {error && <Feedback kind="error">{error}</Feedback>}
      {message && <Feedback kind="success">{message}</Feedback>}
      {!videos.length ? <Feedback kind="empty" title="No videos yet.">Your first highlight is waiting to be uploaded.</Feedback> : <div className="cv-admin-video-list">
        {videos.map((video) => <article className="cv-admin-video" key={video.id} aria-busy={busy.includes(video.id)}>
          <video src={supabase.storage.from(COURT_VIDEO_BUCKET).getPublicUrl(video.storage_path).data.publicUrl} aria-label={video.title} controls playsInline preload="none" />
          <div className="cv-admin-video-info">
            <div className="cv-admin-video-heading"><div><h3>{video.title}</h3><p>{formatCourtDate(video.played_on)} · {video.location}</p></div><span className={`cv-admin-status ${video.is_published ? "is-published" : "is-draft"}`}>{video.is_published ? "PUBLISHED" : "DRAFT"}</span></div>
            {video.description && <p className="cv-admin-video-description">{video.description}</p>}
            <div className="cv-admin-video-actions">
              <button type="button" disabled={busy.includes(video.id)} onClick={() => { void perform(video, "publish"); }}>{video.is_published ? "Unpublish" : "Publish"}</button>
              <button type="button" className="is-delete" disabled={busy.includes(video.id)} onClick={() => { void perform(video, "delete"); }}>Delete</button>
            </div>
          </div>
        </article>)}
      </div>}
    </section>
  );
}
