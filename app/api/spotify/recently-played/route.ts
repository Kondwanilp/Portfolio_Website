
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type SpotifyRefreshResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
};

type SpotifyApiTrack = {
  id?: string;
  name?: string;
  artists?: Array<{ name?: string }>;
  album?: {
    name?: string;
    images?: Array<{ url?: string }>;
    external_urls?: {
      spotify?: string;
    };
  };
  external_urls?: {
    spotify?: string;
  };
  duration_ms?: number;
};

type SpotifyRecentlyPlayedItem = {
  played_at?: string;
  track?: SpotifyApiTrack;
};

type SpotifyRecentlyPlayedResponse = {
  items?: SpotifyRecentlyPlayedItem[];
};

export async function GET() {
  try {
    const cookieStore = await cookies();

    let accessToken = cookieStore.get(
      "spotify_access_token"
    )?.value;

    const refreshToken = cookieStore.get(
      "spotify_refresh_token"
    )?.value;

    const clientId = process.env.SPOTIFY_CLIENT_ID;

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        {
          error:
            "Spotify is not connected. Please reconnect.",
        },
        { status: 401 }
      );
    }

    const fetchRecentlyPlayed = (token: string) =>
      fetch(
        "https://api.spotify.com/v1/me/player/recently-played?limit=10",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

    let spotifyResponse: Response | null = null;

    let newAccessToken: string | undefined;
    let newRefreshToken: string | undefined;
    let expiresIn = 3600;

    // First try the existing access token.
    if (accessToken) {
      spotifyResponse = await fetchRecentlyPlayed(accessToken);
    }

    // Refresh when the access token is missing or expired.
    if (!accessToken || spotifyResponse?.status === 401) {
      if (!refreshToken) {
        return NextResponse.json(
          {
            error:
              "Your Spotify session has expired. Please reconnect.",
          },
          { status: 401 }
        );
      }

      if (!clientId) {
        return NextResponse.json(
          {
            error: "Spotify client ID is missing.",
          },
          { status: 500 }
        );
      }

      const refreshResponse = await fetch(
        "https://accounts.spotify.com/api/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: clientId,
          }),
          cache: "no-store",
        }
      );

      if (!refreshResponse.ok) {
        const response = NextResponse.json(
          {
            error:
              "Spotify could not refresh your session. Please reconnect.",
          },
          { status: 401 }
        );

        response.cookies.delete("spotify_access_token");
        response.cookies.delete("spotify_refresh_token");

        return response;
      }

      const refreshed =
        (await refreshResponse.json()) as SpotifyRefreshResponse;

      if (!refreshed.access_token) {
        return NextResponse.json(
          {
            error:
              "Spotify did not return a refreshed access token.",
          },
          { status: 401 }
        );
      }

      newAccessToken = refreshed.access_token;
      newRefreshToken = refreshed.refresh_token;
      expiresIn = refreshed.expires_in ?? 3600;

      accessToken = newAccessToken;

      // Retry the listening history request.
      spotifyResponse = await fetchRecentlyPlayed(accessToken);
    }

    if (!spotifyResponse) {
      return NextResponse.json(
        { error: "Unable to retrieve Spotify listening history." },
        { status: 500 }
      );
    }

    if (!spotifyResponse.ok) {
      const status = spotifyResponse.status;

      const message =
        status === 401
          ? "Your Spotify session has expired. Please reconnect."
          : status === 403
            ? "Spotify has not granted listening-history access."
            : status === 429
              ? "Spotify rate limit reached. Try again shortly."
              : "Could not retrieve your Spotify listening history.";

      return NextResponse.json(
        { error: message },
        { status }
      );
    }

    const data =
      (await spotifyResponse.json()) as SpotifyRecentlyPlayedResponse;

    const items = Array.isArray(data.items) ? data.items : [];

    const tracks = items.flatMap((item) => {
      const track = item.track;

      if (!track?.id) {
        return [];
      }

      return [
        {
          playedAt: item.played_at ?? null,
          id: track.id,
          name: track.name ?? "Unknown track",
          artists: (track.artists ?? [])
            .map((artist) => artist.name ?? "")
            .filter(Boolean),
          album: track.album?.name ?? "",
          albumArtwork: track.album?.images?.[0]?.url ?? null,
          spotifyUrl: track.external_urls?.spotify ?? null,
          albumUrl: track.album?.external_urls?.spotify ?? null,
          duration: track.duration_ms ?? null,
        },
      ];
    });

    const response = NextResponse.json(
      {
        total: tracks.length,
        tracks,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    // Save refreshed tokens.
    if (newAccessToken) {
      response.cookies.set(
        "spotify_access_token",
        newAccessToken,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: expiresIn,
        }
      );
    }

    if (newRefreshToken) {
      response.cookies.set(
        "spotify_refresh_token",
        newRefreshToken,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        }
      );
    }

    return response;
  } catch (error) {
    console.error("Spotify recently-played error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong connecting to Spotify.",
      },
      { status: 500 }
    );
  }
}
