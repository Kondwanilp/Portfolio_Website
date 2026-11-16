"use client";

import Link from "next/link";
import type { StudioDraft } from "../../lib/studio/content";
import { contentModules } from "../../lib/studio/content";
import Feedback from "../components/Feedback";
import { useStudioData } from "./useStudioData";

export default function StudioOverview() {
  const drafts = useStudioData<{ entries: StudioDraft[] }>("/api/studio/content");
  const library = useStudioData<{ media: unknown[]; videoCounts: { total: number; published: number } | null; warning: string | null }>("/api/studio/media");
  return (
    <>
      <header className="studio-heading"><p className="studio-label">YOUR PRIVATE WORKSPACE</p><h1>A little space<br />to <em>make things.</em></h1><p>Research, stories, and everything in between. Keep your portfolio growing at your own pace.</p></header>
      <p className="studio-storage-note">Drafts stay private in Supabase. Publication creates a separate public snapshot after your confirmation.</p>
      {(drafts.error || library.error) && <Feedback kind="error" action={<button type="button" onClick={() => { void drafts.reload(); void library.reload(); }}>Try again</button>}>{drafts.error || library.error}</Feedback>}
      <section className="studio-summary" aria-label="Workspace summary">
        <div><span>STORED ENTRIES</span><strong>{drafts.data ? drafts.data.entries.length : "—"}</strong></div>
        <div><span>READY FOR REVIEW</span><strong>{drafts.data ? drafts.data.entries.filter(({ workflow }) => workflow === "ready").length : "—"}</strong></div>
        <div><span>COURT VISION VIDEOS</span><strong>{library.data?.videoCounts?.total ?? "—"}</strong></div>
      </section>
      {library.data?.warning && <Feedback kind="error">{library.data.warning}</Feedback>}
      <section aria-labelledby="studio-collections-title"><div className="studio-section-heading"><h2 id="studio-collections-title">Your collections.</h2><Link href="/studio/media">Open media library ↗</Link></div>
        <div className="studio-collection-grid">{contentModules.map((module) => <Link className="studio-collection" key={module.id} href={`/studio/${module.id}`}><h3>{module.title}<span aria-hidden="true">↗</span></h3><p>{module.description}</p></Link>)}<Link className="studio-collection" href="/studio/court-vision"><h3>Court Vision<span aria-hidden="true">↗</span></h3><p>Upload highlights, manage publication, and log pickup sessions.</p></Link></div>
      </section>
      <section><div className="studio-section-heading"><h2>Recently edited.</h2></div>
        {drafts.loading ? <Feedback kind="loading">Loading your drafts...</Feedback> : !drafts.data?.entries.length ? <Feedback kind="empty">Your saved drafts will appear here. Open a collection to start writing.</Feedback> : <ul className="studio-entry-list">{drafts.data.entries.slice(0, 5).map((entry) => <li key={entry.id}><Link href={`/studio/${entry.kind}`}>{entry.title}</Link><span>{entry.workflow === "ready" ? "Ready for review" : "Draft"}</span></li>)}</ul>}
      </section>
    </>
  );
}
