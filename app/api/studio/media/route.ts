import { requireStudioContext, studioErrorResponse } from "@/lib/studio/auth.server";
import { studioMediaCatalog } from "@/lib/studio/media.server";

export async function GET() {
  try {
    const { client } = await requireStudioContext();
    return Response.json(await studioMediaCatalog(true, client), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return studioErrorResponse(error); }
}
