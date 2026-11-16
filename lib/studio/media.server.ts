import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { supabaseAdmin } from "../supabase/admin";
import { COURT_VIDEO_BUCKET } from "../court-vision";
import { requireStudioContext } from "./auth.server";
import { databaseFailure } from "./repository";
import { StudioError } from "./authorization";
import { assertUploadMetadata } from "./upload-verification";
import { STUDIO_BUCKET } from "./uploads";

export type StudioMedia = {
  id: string;
  title: string;
  url: string;
  type: "image" | "video" | "document";
  source: "portfolio" | "court-vision" | "upload";
  size?: number;
  published?: boolean;
  archived?: boolean;
};

export async function studioMediaCatalog(includeUploads = true, suppliedClient?: SupabaseClient) {
  const publicRoot = path.join(process.cwd(), "public");
  async function images(directory: string): Promise<StudioMedia[]> {
    const files = await readdir(directory, { withFileTypes: true });
    const lists = await Promise.all(files.map(async (entry) => {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) return images(absolute);
      if (!/\.(jpe?g|png|webp)$/i.test(entry.name)) return [];
      const relative = path.relative(publicRoot, absolute).split(path.sep).join("/");
      return [{ id: `asset:${relative}`, title: entry.name, url: `/${relative.split("/").map(encodeURIComponent).join("/")}`, type: "image" as const, source: "portfolio" as const, size: (await stat(absolute)).size }];
    }));
    return lists.flat();
  }
  const assets = await images(publicRoot);
  const { data, error } = await supabaseAdmin.from("court_videos").select("id, title, storage_path, is_published").abortSignal(AbortSignal.timeout(10000));
  const videos: StudioMedia[] = (data ?? []).map((video) => ({
    id: `video:${video.id}`, title: video.title,
    url: supabaseAdmin.storage.from(COURT_VIDEO_BUCKET).getPublicUrl(video.storage_path).data.publicUrl,
    type: "video", source: "court-vision", published: video.is_published,
  }));
  const uploads: StudioMedia[] = [];
  let uploadWarning = "";
  if (includeUploads) {
    const client = suppliedClient ?? (await requireStudioContext()).client;
    const result = await client.from("studio_media").select("source_reference,title,media_type,archived_at").eq("source", "upload");
    if (result.error) uploadWarning = "Studio uploads await database setup or are temporarily unavailable.";
    else for (const item of result.data) uploads.push({ id: item.source_reference, title: item.title, type: item.media_type, archived: Boolean(item.archived_at), source: "upload", url: `/api/studio/media/file/${item.source_reference.slice(7)}` });
  }
  return { media: [...assets, ...videos, ...uploads], videoCounts: error ? null : { total: data.length, published: data.filter((video) => video.is_published).length }, warning: [error ? "Court Vision media is temporarily unavailable." : "", uploadWarning].filter(Boolean).join(" ") || null };
}

/** Existing assets are registered by reference. Files and Court Vision records stay untouched. */
export async function registerCatalogMedia(ids: string[], publishing = false, suppliedClient?: SupabaseClient) {
  if (!ids.length) return;
  const client = suppliedClient ?? (await requireStudioContext()).client;
  const { media } = await studioMediaCatalog(true, client);
  const rows = ids.map((id) => {
    const item = media.find((asset) => asset.id === id);
    if (!item || item.archived) throw new StudioError("Some attached media is unavailable or archived. Refresh the media library.", 409);
    if (publishing && item.source === "court-vision" && !item.published) throw new StudioError("Publish this video in Court Vision before attaching it to a public entry.", 409);
    return { source_reference: item.id, title: item.title, media_type: item.type, source: item.source, url: item.url, visibility: publishing ? "public" : "private" };
  });
  // Upload metadata contains the private storage path and must never be replaced by catalog DTOs.
  const legacy = rows.filter((row) => row.source !== "upload");
  if (legacy.length) {
    const { error } = await client.from("studio_media").upsert(legacy, { onConflict: "source_reference" });
    if (error) databaseFailure(error);
  }
  const uploadedIds = ids.filter((id) => id.startsWith("upload:"));
  if (publishing && uploadedIds.length) {
    const assets = await client.from("studio_media").select("source_reference,storage_path,storage_bucket")
      .in("source_reference", uploadedIds).eq("source", "upload").is("archived_at", null);
    if (assets.error) databaseFailure(assets.error);
    if (!assets.data || assets.data.length !== uploadedIds.length) throw new StudioError("An attached upload is unavailable. Refresh the media library.", 409);
    await Promise.all(assets.data.map(async (asset) => {
      if (asset.storage_bucket !== STUDIO_BUCKET) throw new StudioError("This file is outside the Studio media bucket.", 409);
      const object = await client.storage.from(STUDIO_BUCKET).info(asset.storage_path);
      if (object.error) throw new StudioError("An attached file could not be verified. Retry before publishing.", 409);
      assertUploadMetadata(object.data);
    }));
    const { error } = await client.from("studio_media").update({ visibility: "public" }).in("source_reference", uploadedIds);
    if (error) databaseFailure(error);
  }
}
