import { NextRequest } from "next/server";
import { publicStudioClient } from "@/lib/studio/publications.server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { STUDIO_BUCKET } from "@/lib/studio/uploads";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response(null, { status: 404 });
  // This uncached anonymous read is the publication authorization boundary.
  const publication = await publicStudioClient().from("studio_publications").select("entry_id").contains("content", { media: [{ id: `upload:${id}` }] }).limit(1);
  if (publication.error) return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  if (!publication.data.length) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  const asset = await supabaseAdmin.from("studio_media").select("storage_path").eq("id", id).eq("source", "upload").eq("storage_bucket", STUDIO_BUCKET).single();
  if (asset.error || !asset.data) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  const signed = await supabaseAdmin.storage.from(STUDIO_BUCKET).createSignedUrl(asset.data.storage_path, 60);
  if (signed.error) return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  return new Response(null, { status: 307, headers: { Location: signed.data.signedUrl, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}
