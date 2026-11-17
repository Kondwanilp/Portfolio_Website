export const contentModules = [
  { id: "research", title: "Research", description: "Projects, methods, collaborators, and research presentations.", publicPath: "/research", fields: [
    { key: "institution", label: "Institution" }, { key: "mentor", label: "Mentor or collaborators" }, { key: "methods", label: "Methods and techniques" },
  ] },
  { id: "experience", title: "Professional experience", description: "Professional roles, leadership, and community work.", publicPath: "/#experience", fields: [
    { key: "organization", label: "Organization" }, { key: "role", label: "Role" }, { key: "dates", label: "Dates" },
  ] },
  { id: "gallery", title: "Gallery", description: "Photographs, captions, and the stories behind them.", publicPath: "/#gallery", fields: [
    { key: "alt", label: "Image description for accessibility" }, { key: "location", label: "Location" }, { key: "date", label: "Date" },
  ] },
  { id: "notes", title: "Personal notes", description: "Observations, ideas, and writing in progress.", publicPath: "/", fields: [
    { key: "topic", label: "Topic" },
  ] },
  { id: "extras", title: "Extras", description: "Stories and discoveries beyond the laboratory.", publicPath: "/extras", fields: [
    { key: "channel", label: "Channel", options: ["listening", "chess", "basketball", "wordplay", "archives"] },
  ] },
] as const;

export type ContentKind = typeof contentModules[number]["id"];
export type StudioDraft = {
  id: string;
  kind: ContentKind;
  title: string;
  slug: string;
  summary: string;
  body: string;
  details: Record<string, string>;
  media: string[];
  workflow: "draft" | "ready";
  revision: number;
  updatedAt: string;
  archivedAt?: string | null;
  deletedAt?: string | null;
  publishedRevision?: number | null;
};

export function contentModule(kind: string) {
  return contentModules.find((collection) => collection.id === kind);
}

export function parseDraft(input: unknown): Omit<StudioDraft, "revision" | "updatedAt"> {
  if (!input || typeof input !== "object") throw new Error("Choose a valid content entry.");
  const value = input as Record<string, unknown>;
  const collection = contentModule(String(value.kind));
  if (!collection || typeof value.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.id)) throw new Error("This content identifier is invalid.");
  function text(key: string, limit: number, required = false) {
    const result = value[key];
    if (typeof result !== "string" || result.length > limit || (required && !result.trim())) throw new Error(`Check the ${key} field.`);
    return result.trim();
  }
  const title = text("title", 200, true);
  const slug = text("slug", 120, true);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Use lowercase letters, numbers, and hyphens in the slug.");
  const summary = text("summary", 1000);
  const body = text("body", 50000);
  const details: Record<string, string> = {};
  const supplied = value.details as Record<string, unknown> | undefined;
  if (!supplied || typeof supplied !== "object" || Array.isArray(supplied)) throw new Error("Check the content details.");
  for (const field of collection.fields) {
    const entry = supplied[field.key] ?? "";
    if (typeof entry !== "string" || entry.length > 2000) throw new Error(`Check ${field.label.toLowerCase()}.`);
    if ("options" in field && entry && !(field.options as readonly string[]).includes(entry)) throw new Error("Choose an existing Extras channel.");
    details[field.key] = entry.trim();
  }
  if (!Array.isArray(value.media) || value.media.length > 20 || !value.media.every((item) => typeof item === "string" && item.length <= 300 && /^(asset:|video:|upload:)/.test(item))) throw new Error("Choose media from the library.");
  if (value.workflow !== "draft" && value.workflow !== "ready") throw new Error("Choose a valid workflow state.");
  if (value.workflow === "ready") {
    if (!summary || !body) throw new Error("Add a summary and body before marking this entry ready.");
    if (collection.id === "gallery" && (!value.media.length || !details.alt)) throw new Error("Gallery entries need media and an accessible image description.");
  }
  return { id: value.id, kind: collection.id, title, slug, summary, body, details, media: [...new Set(value.media)], workflow: value.workflow };
}
