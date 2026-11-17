import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { publishedEntries } from "@/lib/studio/publications.server";
import SiteNavigation from "@/app/components/SiteNavigation";

export async function generateMetadata({ params }: { params: Promise<{ kind: string; slug: string }> }) {
  const { kind, slug } = await params;
  const entry = (await publishedEntries()).find((entry) => entry.kind === kind && entry.slug === slug);
  return { title: entry ? entry.title : "Entry unavailable", description: entry?.summary };
}
async function PublishedEntry({ params }: { params: Promise<{ kind: string; slug: string }> }) {
  const { kind, slug } = await params;
  const entry = (await publishedEntries()).find((entry) => entry.kind === kind && entry.slug === slug);
  if (!entry) notFound();
  return <main id="main-content" className="published-page"><SiteNavigation /><Link href="/journal">Back to the journal</Link><article><p className="eyebrow">{entry.kind}</p><h1>{entry.title}</h1><p className="published-summary">{entry.summary}</p><dl>{Object.entries(entry.details).filter(([, value]) => value).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>{entry.body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}{entry.media.map((media) => media.type === "image" ? <Image key={media.id} src={media.url} alt={entry.details.alt || media.alt || media.title} width={1200} height={800} unoptimized={media.id.startsWith("upload:")} style={{ width: "100%", height: "auto" }} /> : media.type === "video" ? <video key={media.id} src={media.url} controls playsInline preload="none" aria-label={media.title} /> : <p key={media.id}><a href={media.url} target="_blank" rel="noopener noreferrer">{media.title} (PDF)</a></p>)}</article></main>;
}

export default function Page({ params }: { params: Promise<{ kind: string; slug: string }> }) {
  return <Suspense fallback={<main id="main-content" className="published-page" aria-busy="true"><p role="status">Loading this entry...</p></main>}><PublishedEntry params={params} /></Suspense>;
}
