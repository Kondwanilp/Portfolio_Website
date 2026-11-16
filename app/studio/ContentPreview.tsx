"use client";

import Image from "next/image";
import type { StudioDraft } from "../../lib/studio/content";
import type { StudioMedia } from "../../lib/studio/media.server";

export default function ContentPreview({ entry, media }: { entry: StudioDraft; media: StudioMedia[] }) {
  return (
    <article className="studio-preview">
      <p className="studio-label">PRIVATE PREVIEW · {entry.workflow === "ready" ? "READY FOR REVIEW" : "DRAFT"}</p>
      <h2>{entry.title || "Untitled entry"}</h2>
      <p className="studio-preview-summary">{entry.summary}</p>
      <dl>{Object.entries(entry.details).filter(([, value]) => value).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
      {entry.body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p className="studio-preview-body" key={index}>{paragraph}</p>)}
      {media.filter((item) => entry.media.includes(item.id)).map((item) => item.type === "image" ? <Image key={item.id} src={item.url} alt={entry.details.alt || item.title} unoptimized={item.source === "upload"} width={900} height={600} sizes="(max-width: 760px) 90vw, 50vw" style={{ height: "auto", objectFit: "contain" }} /> : item.type === "document" ? <p key={item.id}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title} (PDF)</a></p> : <video key={item.id} src={item.url} aria-label={item.title} controls preload="none" />)}
    </article>
  );
}
