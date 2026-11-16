import { PORTFOLIO_OWNER_ID } from "../owner.ts";

export class StudioError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function authorizeStudioOwner(token: string | undefined, verify: (token: string) => Promise<{ id: string } | null>) {
  if (!token || token.length > 8192) throw new StudioError("Sign in to open The Studio.", 401);
  let user: { id: string } | null;
  try { user = await verify(token); }
  catch { throw new StudioError("Your session could not be verified. Please retry.", 503); }
  if (!user) throw new StudioError("Your session has expired. Please sign in again.", 401);
  if (user.id !== PORTFOLIO_OWNER_ID) throw new StudioError("This account does not have Studio access.", 403);
  return user;
}

export function assertSameOrigin(origin: string | null, expected: string) {
  if (origin !== expected) throw new StudioError("This request must come from The Studio.", 403);
}

export function studioRequestOrigin(request: { headers: Headers; url: string }) {
  const url = new URL(request.url);
  const host = request.headers.get("host") ?? url.host;
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
  const protocol = forwardedProtocol === "https" || forwardedProtocol === "http" ? `${forwardedProtocol}:` : url.protocol;
  return `${protocol}//${host}`;
}
