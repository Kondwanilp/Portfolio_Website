
import { randomBytes, createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Spotify owner authorization is only allowed locally.
  const hostname = request.nextUrl.hostname;

  if (
    process.env.NODE_ENV === "production" ||
    !["localhost", "127.0.0.1"].includes(hostname)
  ) {
    return NextResponse.json(
      { error: "Spotify authorization is only available locally." },
      { status: 404 }
    );
  }

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

  // Ensure the callback matches the local authorization session.
  if (
    !["localhost", "127.0.0.1"].includes(callbackUrl.hostname)
  ) {
    return NextResponse.json(
      { error: "Spotify redirect URI must be local for setup." },
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
