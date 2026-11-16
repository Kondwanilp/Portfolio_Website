import { NextRequest, NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/studio/authorization";
import { requireStudioOwner, STUDIO_COOKIE, studioErrorResponse, studioRequestOrigin, verifyStudioToken } from "@/lib/studio/auth.server";

export async function GET() {
  try {
    const user = await requireStudioOwner();
    return Response.json({ ownerId: user.id }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return studioErrorResponse(error); }
}

export async function POST(request: NextRequest) {
  let sameOrigin = false;
  try {
    assertSameOrigin(request.headers.get("origin"), studioRequestOrigin(request));
    sameOrigin = true;
    const token = request.headers.get("authorization")?.match(/^Bearer (\S+)$/)?.[1];
    const user = await verifyStudioToken(token);
    const response = NextResponse.json({ ownerId: user.id }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(STUDIO_COOKIE, token!, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 300 });
    return response;
  } catch (error) {
    const response = studioErrorResponse(error);
    if (sameOrigin && (response.status === 401 || response.status === 403)) {
      response.cookies.set(STUDIO_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
    }
    return response;
  }
}

export async function DELETE(request: NextRequest) {
  try {
    assertSameOrigin(request.headers.get("origin"), studioRequestOrigin(request));
    const response = NextResponse.json({ signedOut: true }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(STUDIO_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
    return response;
  } catch (error) { return studioErrorResponse(error); }
}
