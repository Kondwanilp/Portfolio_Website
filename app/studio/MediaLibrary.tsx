"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { StudioMedia } from "../../lib/studio/media.server";
import Feedback from "../components/Feedback";
import MediaUpload from "./MediaUpload";
import MediaManagement from "./MediaManagement";
import { useStudioData } from "./useStudioData";

export default function MediaLibrary() {
  const { data, error, loading, reload } = useStudioData<{ media: StudioMedia[]; warning: string | null }>("/api/studio/media");
  const [query, setQuery] = useState("");
  const media = data?.media.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())) ?? [];
  return (
    <>
      <header className="studio-heading"><p className="studio-label">THE COLLECTION</p><h1>Media <em>library.</em></h1><p>Portfolio photographs, research posters, and Court Vision clips in one place.</p></header>
      <div className="studio-toolbar"><label>Find media<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search filenames and titles" /></label><Link href="/studio/court-vision">Upload a Court Vision video ↗</Link></div>
      <MediaUpload onUploaded={reload} />
      {loading && <Feedback kind="loading">Loading your media...</Feedback>}
      {error && <Feedback kind="error" action={<button type="button" onClick={() => { void reload(); }}>Try again</button>}>{error}</Feedback>}
      {data?.warning && <Feedback kind="error">{data.warning}</Feedback>}
      {!loading && !error && !media.length && <Feedback kind="empty">No media matches this search.</Feedback>}
      <div className="studio-media-grid">{media.map((item) => <article className="studio-media-card" key={item.id}>
        {item.type === "image" ? <Image src={item.url} alt={item.title} unoptimized={item.source === "upload"} width={400} height={260} sizes="(max-width: 760px) 90vw, 40vw" style={{ objectFit: "contain" }} /> : item.type === "document" ? <p>PDF document</p> : <video src={item.url} aria-label={item.title} controls preload="none" playsInline />}
        <div><p className="studio-label">{item.source === "portfolio" ? "PORTFOLIO" : "COURT VISION"}</p><h2>{item.title}</h2><a href={item.url} target="_blank" rel="noopener noreferrer">Open original ↗</a>{item.source === "upload" && <MediaManagement item={item} onChanged={reload} />}</div>
      </article>)}</div>
    </>
  );
}
