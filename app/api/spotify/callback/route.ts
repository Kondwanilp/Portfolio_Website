
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
      // Configuration error is handled below.
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
    // Exchange the authorization code for Spotify tokens.
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
      console.error(
        "Spotify token exchange failed:",
        tokenResponse.status
      );

      return failureRedirect("token_exchange_failed");
    }

    const tokenData =
      (await tokenResponse.json()) as SpotifyTokenResponse;

    if (!tokenData.access_token) {
      return failureRedirect("missing_access_token");
    }

    // Use the new refresh token if Spotify provides one.
    let refreshToken = tokenData.refresh_token;

    // If Spotify does not return a new refresh token,
    // preserve the refresh token already stored in Supabase.
    if (!refreshToken) {
      const { data: existingToken, error: lookupError } =
        await supabaseAdmin
          .from("spotify_tokens")
          .select("refresh_token")
          .eq("id", "owner")
          .maybeSingle();

      if (lookupError) {
        console.error(
          "Could not retrieve existing Spotify token:",
          lookupError
        );

        return failureRedirect("token_storage_failed");
      }

      refreshToken = existingToken?.refresh_token;
    }

    if (!refreshToken) {
      return failureRedirect("missing_refresh_token");
    }

    // Save the owner's refresh token securely in Supabase.
    const { error: saveError } = await supabaseAdmin
      .from("spotify_tokens")
      .upsert(
        {
          id: "owner",
          refresh_token: refreshToken,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

    if (saveError) {
      console.error(
        "Could not save Spotify refresh token:",
        saveError
      );

      return failureRedirect("token_storage_failed");
    }

    // Authorization succeeded.
    const response = NextResponse.redirect(
      new URL("/?spotify=connected", appOrigin)
    );

    response.cookies.delete("spotify_auth_state");
    response.cookies.delete("spotify_code_verifier");
    response.cookies.delete("spotify_status");

    // No Spotify access or refresh tokens are stored in visitor cookies.
    return response;
  } catch (error) {
    console.error("Spotify callback error:", error);
    return failureRedirect("connection_error");
  }
}
