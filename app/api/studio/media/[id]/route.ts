import { NextRequest } from "next/server";
import { requireStudioContext, studioErrorResponse, studioRequestOrigin } from "@/lib/studio/auth.server";
import { assertSameOrigin, StudioError } from "@/lib/studio/authorization";
import { databaseFailure } from "@/lib/studio/repository";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { client } = await requireStudioContext();
    assertSameOrigin(request.headers.get("origin"), studioRequestOrigin(request));
    const raw = await request.text();
    if (raw.length > 2000) throw new StudioError("This request is too large.", 413);
    let value;
    try { value = JSON.parse(raw); } catch { throw new StudioError("Check this media request."); }
    if (!value || !["rename", "archive", "recover"].includes(value.action) || (value.action === "rename" && (typeof value.title !== "string" || !value.title.trim() || value.title.length > 200))) throw new StudioError("Choose a valid action and media title.");
    const { id } = await params;
    const { error } = await client.rpc("studio_manage_media", { p_id: id, p_action: value.action, p_title: value.title ?? "" });
    if (error) databaseFailure(error);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return studioErrorResponse(error); }
}
