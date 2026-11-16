import "server-only";
import { boundedFetch } from "./transport";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authorizeStudioOwner, StudioError } from "./authorization";
export { studioRequestOrigin } from "./authorization";

export const STUDIO_COOKIE = "portfolio_studio_session";

export async function verifyStudioToken(token: string | undefined) {
  return authorizeStudioOwner(token, async (accessToken) => {
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: boundedFetch(10000) },
    });
    const { data, error } = await client.auth.getUser(accessToken);
    if (error) {
      if (error.name === "AuthRetryableFetchError" || (error.status && error.status >= 500)) throw new Error("Auth unavailable");
      return null;
    }
    return data.user;
  });
}

export async function requireStudioOwner() {
  const token = (await cookies()).get(STUDIO_COOKIE)?.value;
  return verifyStudioToken(token);
}

export function studioErrorResponse(error: unknown) {
  const failure = error instanceof StudioError ? error : new StudioError("The Studio could not complete this request. Please retry.", 503);
  return NextResponse.json({ error: failure.message }, { status: failure.status, headers: { "Cache-Control": "no-store" } });
}

/** Forward the verified owner's JWT so database queries also pass through RLS. */
export async function requireStudioContext() {
  const token = (await cookies()).get(STUDIO_COOKIE)?.value;
  const user = await verifyStudioToken(token);
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: boundedFetch(15000),
    },
  });
  return { user, client };
}
