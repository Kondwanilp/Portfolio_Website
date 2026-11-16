export const STUDIO_BUCKET = "studio-media";
export const uploadTypes: Record<string, { extension: string; type: "image" | "video" | "document" }> = {
  "image/jpeg": { extension: "jpg", type: "image" },
  "image/png": { extension: "png", type: "image" },
  "image/webp": { extension: "webp", type: "image" },
  "application/pdf": { extension: "pdf", type: "document" },
  "video/mp4": { extension: "mp4", type: "video" },
  "video/webm": { extension: "webm", type: "video" },
};
export function validateUpload(input: unknown) {
  if (!input || typeof input !== "object") throw new Error("Choose a file.");
  const value = input as Record<string, unknown>;
  if (typeof value.mime !== "string" || !uploadTypes[value.mime]) throw new Error("Choose a JPEG, PNG, WebP, PDF, MP4, or WebM file.");
  if (!Number.isSafeInteger(value.size) || Number(value.size) < 1 || Number(value.size) > 50 * 1024 * 1024) throw new Error("Files must be between 1 byte and 50 MB. Larger basketball videos use Court Vision.");
  if (typeof value.title !== "string" || !value.title.trim() || value.title.length > 200) throw new Error("Add a title of at most 200 characters.");
  return { mime: value.mime, size: Number(value.size), title: value.title.trim(), ...uploadTypes[value.mime] };
}
