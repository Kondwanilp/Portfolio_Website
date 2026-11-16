import { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { studioStore } from "@/lib/studio/store.server";
import { studioErrorResponse, studioRequestOrigin } from "@/lib/studio/auth.server";
import { assertSameOrigin, StudioError } from "@/lib/studio/authorization";
import { registerCatalogMedia } from "@/lib/studio/media.server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const store = await studioStore();
    const { id } = await params;
    return Response.json({ revisions: await store.history(id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return studioErrorResponse(error); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const store = await studioStore();
    assertSameOrigin(request.headers.get("origin"), studioRequestOrigin(request));
    const raw = await request.text();
    if (raw.length > 2000) throw new StudioError("This action request is too large.", 413);
    let value;
    try { value = JSON.parse(raw); } catch { throw new StudioError("Choose a valid action."); }
    if (!value || !["publish", "unpublish", "archive", "delete", "reactivate", "restore"].includes(value.action) || !Number.isSafeInteger(value.revision) || value.revision < 1) throw new StudioError("Choose a valid action and saved revision.");
    if (value.action === "publish" && value.confirm !== true) throw new StudioError("Confirm publication before continuing.");
    if (value.action === "restore" && (!Number.isSafeInteger(value.restoreRevision) || value.restoreRevision < 1)) throw new StudioError("Choose a saved revision to recover.");
    const { id } = await params;
    const entry = await store.get(id);
    if (!entry) throw new StudioError("Entry not found.", 404);
    if (entry.revision !== value.revision) throw new StudioError("This entry changed. Reload before continuing.", 409);
    if (value.action === "publish") await registerCatalogMedia(entry.media, true, store.client);
    await store.transition(id, value.revision, value.action, value.restoreRevision ?? null);
    revalidateTag("studio-publications", { expire: 0 });
    for (const path of ["/", "/research", "/extras", "/journal"]) revalidatePath(path);
    revalidatePath(`/journal/${entry.kind}/${entry.slug}`);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return studioErrorResponse(error); }
}
