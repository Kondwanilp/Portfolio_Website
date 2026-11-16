"use client";

import { useRef, useState, type FormEvent } from "react";
import { supabase } from "../../../lib/supabase/client";
import { formatCourtDate, type HoopSession } from "../../../lib/court-vision";
import { requireCourtOwner } from "../../../lib/court-vision-repository";
import Feedback from "../../components/Feedback";

export default function SessionEditor({ sessions, today, onSaved }: { sessions: HoopSession[]; today: string; onSaved: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const running = useRef(false);
  const pending = useRef<{ id: string; played_on: string; location: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (running.current) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const location = String(values.get("location")).trim();
    if (!location) { setError("Please enter a location."); return; }
    running.current = true;
    setBusy(true); setError(""); setMessage("");
    try {
      await requireCourtOwner();
      const playedOn = String(values.get("played_on"));
      if (pending.current && (pending.current.played_on !== playedOn || pending.current.location !== location)) {
        throw new Error("The previous save is still pending. Retry with its original date and location, then add another session.");
      }
      const session = pending.current ?? { id: crypto.randomUUID(), played_on: playedOn, location };
      pending.current = session;
      const { error } = await supabase.from("hoop_sessions").insert(session).abortSignal(AbortSignal.timeout(15000));
      if (error) {
        const saved = await supabase.from("hoop_sessions").select("id, played_on, location").eq("id", session.id).abortSignal(AbortSignal.timeout(15000)).maybeSingle();
        if (saved.error || saved.data?.played_on !== playedOn || saved.data?.location !== location) {
          throw new Error("Could not confirm this session was saved. Retry with the same details to finish saving it.");
        }
      }
      pending.current = null;
      form.reset(); setMessage("Pickup session added.");
      await onSaved();
    } catch (error) { setError(error instanceof Error ? error.message : "Could not save this session."); }
    finally { running.current = false; setBusy(false); }
  }
  return (
    <section className="cv-admin-section">
      <div className="cv-admin-section-heading"><div><p className="cv-admin-eyebrow">03 / THE RUNS</p><h2>Pickup sessions.</h2><p className="cv-admin-muted">Keep a record of when and where you played.</p></div></div>
      <form className="cv-admin-form cv-admin-session-form" onSubmit={submit} aria-busy={busy}>
        <label>Date<input name="played_on" type="date" defaultValue={today} required disabled={busy} /></label>
        <label>Location<input name="location" placeholder="e.g. GSU Recreation Center" required disabled={busy} /></label>
        <button className="cv-admin-primary" type="submit" disabled={busy}>{busy ? "Saving..." : "＋ Add session"}</button>
      </form>
      {error && <Feedback kind="error">{error}</Feedback>}{message && <Feedback kind="success">{message}</Feedback>}
      {!sessions.length ? <Feedback kind="empty">No pickup sessions have been logged yet.</Feedback> : <div className="cv-admin-session-list">{sessions.map((session) => <div className="cv-admin-session" key={session.id}><span>{formatCourtDate(session.played_on)}</span><strong>{session.location}</strong></div>)}</div>}
    </section>
  );
}
