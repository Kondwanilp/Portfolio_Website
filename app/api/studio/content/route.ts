import { NextRequest } from "next/server";
import { assertSameOrigin, StudioError } from "@/lib/studio/authorization";
import { studioErrorResponse, studioRequestOrigin } from "@/lib/studio/auth.server";
import { studioStore } from "@/lib/studio/store.server";
import { parseDraft } from "@/lib/studio/content";
import { registerCatalogMedia } from "@/lib/studio/media.server";

export async function GET() {
  try {
    const store = await studioStore();
    return Response.json({ entries: await store.list() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return studioErrorResponse(error); }
}

export async function PUT(request: NextRequest) {
  try {
    const store = await studioStore();
    assertSameOrigin(request.headers.get("origin"), studioRequestOrigin(request));
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 100000) throw new StudioError("This entry exceeds the draft size limit.", 413);
    let value;
    try { value = JSON.parse(raw); } catch { throw new StudioError("The draft request is invalid."); }
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new StudioError("The draft request is invalid.");
    let entry;
    try { entry = parseDraft(value.entry); } catch (error) { throw new StudioError(error instanceof Error ? error.message : "Check this draft."); }
    await registerCatalogMedia(entry.media, false, store.client);
    const saved = await store.save(entry, value.revision);
    return Response.json({ entry: saved }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return studioErrorResponse(error); }
}
