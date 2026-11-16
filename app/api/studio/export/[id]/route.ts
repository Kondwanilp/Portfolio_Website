import { NextRequest } from "next/server";
import { studioErrorResponse } from "@/lib/studio/auth.server";
import { StudioError } from "@/lib/studio/authorization";
import { studioStore } from "@/lib/studio/store.server";
import { studioMediaCatalog } from "@/lib/studio/media.server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const store = await studioStore();
    const { id } = await params;
    const entry = await store.get(id);
    if (!entry) throw new StudioError("This entry could not be found.", 404);
    const { media } = await studioMediaCatalog(true, store.client);
    if (entry.media.some((id) => !media.some((item) => item.id === id))) throw new StudioError("Some media is unavailable. Retry the export when the library is available.", 503);
    return Response.json({ version: 1, purpose: "publication-review", entry, media: media.filter((item) => entry.media.includes(item.id)) }, {
      headers: { "Cache-Control": "no-store", "Content-Disposition": `attachment; filename="${entry.slug}.json"` },
    });
  } catch (error) { return studioErrorResponse(error); }
}
