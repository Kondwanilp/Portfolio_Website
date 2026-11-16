import { NextRequest } from "next/server";
import { requireStudioContext, studioErrorResponse, studioRequestOrigin } from "@/lib/studio/auth.server";
import { assertSameOrigin, StudioError } from "@/lib/studio/authorization";
import { STUDIO_BUCKET, validateUpload } from "@/lib/studio/uploads";
import { databaseFailure } from "@/lib/studio/repository";
import { assertUploadMetadata } from "@/lib/studio/upload-verification";

export async function POST(request: NextRequest) {
  try {
    const { user, client } = await requireStudioContext();
    assertSameOrigin(request.headers.get("origin"), studioRequestOrigin(request));
    const raw = await request.text();
    if (raw.length > 2000) throw new StudioError("Upload metadata is too large.", 413);
    let file;
    try { file = validateUpload(JSON.parse(raw)); } catch (error) { throw new StudioError(error instanceof Error ? error.message : "Check this file."); }
    const id = crypto.randomUUID();
    const path = `${user.id}/${id}.${file.extension}`;
    const signed = await client.storage.from(STUDIO_BUCKET).createSignedUploadUrl(path, { upsert: false });
    if (signed.error) throw new StudioError("Private upload storage is unavailable. Database setup may be awaiting approval.", 503);
    // Register only after the browser has successfully uploaded and the server has inspected it.
    return Response.json({ id, path, token: signed.data.token }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return studioErrorResponse(error); }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, client } = await requireStudioContext();
    assertSameOrigin(request.headers.get("origin"), studioRequestOrigin(request));
    const raw = await request.text();
    if (raw.length > 2000) throw new StudioError("Upload metadata is too large.", 413);
    let value;
    try { value = JSON.parse(raw); } catch { throw new StudioError("Invalid upload metadata."); }
    let file;
    try { file = validateUpload(value); } catch (error) { throw new StudioError(error instanceof Error ? error.message : "Check this file."); }
    if (typeof value.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value.id)) throw new StudioError("Invalid upload identifier.");
    const path = `${user.id}/${value.id}.${file.extension}`;
    const info = await client.storage.from(STUDIO_BUCKET).info(path);
    if (info.error) throw new StudioError("Uploaded file verification failed. Check the file and retry.", 409);
    assertUploadMetadata(info.data, file);
    const { error } = await client.from("studio_media").upsert({ id: value.id, source_reference: `upload:${value.id}`, source: "upload", title: file.title, media_type: file.type, url: `/api/published-media/${value.id}`, storage_bucket: STUDIO_BUCKET, storage_path: path }, { onConflict: "id", ignoreDuplicates: true });
    if (error) databaseFailure(error);
    return Response.json({ id: value.id }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return studioErrorResponse(error); }
}
