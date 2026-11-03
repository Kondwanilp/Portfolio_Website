
import { NextRequest, NextResponse } from "next/server";

type SpotifyTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
};

export async function GET(request: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  let appOrigin = request.nextUrl.origin;

  if (redirectUri) {
    try {
      appOrigin = new URL(redirectUri).origin;
    } catch {
      // The configuration error is handled below.
    }
  }

  const homeUrl = new URL("/", appOrigin);

  function failureRedirect(reason: string) {
    const destination = new URL(homeUrl);
    destination.searchParams.set("spotify_error", reason);

    const response = NextResponse.redirect(destination);

    response.cookies.set("spotify_status", reason, {
      httpOnly: false,
      secure: appOrigin.startsWith("https://"),
      sameSite: "lax",
      path: "/",
      maxAge: 60,
    });

    response.cookies.delete("spotify_auth_state");
    response.cookies.delete("spotify_code_verifier");

    return response;
  }

  const code = request.nextUrl.searchParams.get("code");
  const returnedState = request.nextUrl.searchParams.get("state");
  const spotifyError = request.nextUrl.searchParams.get("error");

  const savedState =
    request.cookies.get("spotify_auth_state")?.value;

  const codeVerifier =
    request.cookies.get("spotify_code_verifier")?.value;

  if (spotifyError) {
    return failureRedirect("authorization_denied");
  }

  if (!code || !returnedState || !savedState || !codeVerifier) {
    return failureRedirect("missing_authorization_data");
  }

  if (returnedState !== savedState) {
    return failureRedirect("state_mismatch");
  }

  if (!clientId || !redirectUri) {
    return failureRedirect("configuration_error");
  }

  try {
    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
        cache: "no-store",
      }
    );

    if (!tokenResponse.ok) {
      return failureRedirect("token_exchange_failed");
    }

    const tokenData =
      (await tokenResponse.json()) as SpotifyTokenResponse;

    if (!tokenData.access_token) {
      return failureRedirect("missing_access_token");
    }

    const response = NextResponse.redirect(
      new URL("/?spotify=connected", appOrigin)
    );

    const secure = appOrigin.startsWith("https://");

    response.cookies.set(
      "spotify_access_token",
      tokenData.access_token,
      {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: tokenData.expires_in ?? 3600,
      }
    );

    if (tokenData.refresh_token) {
      response.cookies.set(
        "spotify_refresh_token",
        tokenData.refresh_token,
        {
          httpOnly: true,
          secure,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        }
      );
    }

    response.cookies.delete("spotify_auth_state");
    response.cookies.delete("spotify_code_verifier");
    response.cookies.delete("spotify_status");

    return response;
  } catch {
    return failureRedirect("connection_error");
  }
}
