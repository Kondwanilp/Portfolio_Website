import Link from "next/link";
import { publishedEntries } from "@/lib/studio/publications.server";
import type { ContentKind } from "@/lib/studio/content";

export default async function PublishedCollection({ kind, showEmpty = false }: { kind?: ContentKind; showEmpty?: boolean }) {
  const entries = (await publishedEntries()).filter((entry) => !kind || entry.kind === kind);
  if (!entries.length) return showEmpty ? <section className="journal-empty"><h2>A little room for what comes next.</h2><p>New entries will appear here when they are published.</p></section> : null;
  return <section className="published-collection" aria-label="From the Studio"><p className="eyebrow">FROM THE STUDIO</p><h2>Recent additions.</h2><div>{entries.map((entry) => <article key={entry.id}><p>{entry.kind}</p><h3><Link href={`/journal/${entry.kind}/${entry.slug}`}>{entry.title}</Link></h3><p>{entry.summary}</p></article>)}</div></section>;
}
