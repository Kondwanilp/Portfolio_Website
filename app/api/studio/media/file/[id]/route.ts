import { NextRequest } from "next/server";
import { requireStudioContext, studioErrorResponse } from "@/lib/studio/auth.server";
import { StudioError } from "@/lib/studio/authorization";
import { STUDIO_BUCKET } from "@/lib/studio/uploads";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { client } = await requireStudioContext();
    const { id } = await params;
    const { data, error } = await client.from("studio_media").select("storage_path").eq("id", id).eq("source", "upload").single();
    if (error || !data) throw new StudioError("Media not found.", 404);
    const signed = await client.storage.from(STUDIO_BUCKET).createSignedUrl(data.storage_path, 60);
    if (signed.error) throw new StudioError("This file is temporarily unavailable.", 503);
    return new Response(null, { status: 307, headers: { Location: signed.data.signedUrl, "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } });
  } catch (error) { return studioErrorResponse(error); }
}
