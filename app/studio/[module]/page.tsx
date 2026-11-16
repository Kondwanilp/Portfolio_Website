import { notFound } from "next/navigation";
import { contentModule, contentModules } from "../../../lib/studio/content";
import ContentWorkspace from "../ContentWorkspace";

export function generateStaticParams() {
  return contentModules.map(({ id }) => ({ module: id }));
}

export default async function StudioModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const entry = contentModule(module);
  if (!entry) notFound();
  return <ContentWorkspace key={entry.id} kind={entry.id} />;
}
