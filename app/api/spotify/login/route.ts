
import { randomBytes, createHash } from "node:crypto";
import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Spotify environment variables are missing." },
      { status: 500 }
    );
  }

  let callbackUrl: URL;

  try {
    callbackUrl = new URL(redirectUri);
  } catch {
    return NextResponse.json(
      { error: "Spotify redirect URI is invalid." },
      { status: 500 }
    );
  }

  const codeVerifier = randomBytes(64).toString("base64url");

  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const state = randomBytes(16).toString("hex");

  const scope = "user-read-recently-played";

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  const authorizeUrl = new URL(
    "https://accounts.spotify.com/authorize"
  );

  authorizeUrl.search = params.toString();

  const response = NextResponse.redirect(authorizeUrl);

  const cookieOptions = {
    httpOnly: true,
    secure: callbackUrl.protocol === "https:",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };

  response.cookies.set(
    "spotify_code_verifier",
    codeVerifier,
    cookieOptions
  );

  response.cookies.set(
    "spotify_auth_state",
    state,
    cookieOptions
  );

  return response;
}
