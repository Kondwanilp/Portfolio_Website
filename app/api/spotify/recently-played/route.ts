
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type SpotifyRefreshResponse = {
  access_token?: string;
  refresh_token?: string;
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

type WeeklyTrack = {
  id: string;
  name: string;
  artists: string[];
  album: string;
  albumArtwork: string | null;
  spotifyUrl: string | null;
  albumUrl: string | null;
  duration: number | null;
  playedAt: string;
  playCount: number;
};

// Current week begins Monday at 00:00 UTC.
function getWeekStart() {
  const now = new Date();
  const start = new Date(now);

  start.setUTCHours(0, 0, 0, 0);

  const daysSinceMonday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);

  return start;
}

export async function GET() {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;

    if (!clientId) {
      return NextResponse.json(
        { error: "Spotify configuration is incomplete." },
        { status: 500 }
      );
    }

    // Retrieve the owner's refresh token from Supabase.
    const { data: tokenRecord, error: tokenError } =
      await supabaseAdmin
        .from("spotify_tokens")
        .select("refresh_token")
        .eq("id", "owner")
        .single();

    if (tokenError || !tokenRecord?.refresh_token) {
      console.error("Spotify token lookup failed:", tokenError);

      return NextResponse.json(
        { error: "Listening history is not currently available." },
        { status: 503 }
      );
    }

    // Refresh the Spotify access token.
    const refreshResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: tokenRecord.refresh_token,
          client_id: clientId,
        }),
        cache: "no-store",
      }
    );

    if (!refreshResponse.ok) {
      console.error(
        "Spotify token refresh failed:",
        refreshResponse.status
      );

      return NextResponse.json(
        { error: "Listening history is temporarily unavailable." },
        { status: 503 }
      );
    }

    const refreshed =
      (await refreshResponse.json()) as SpotifyRefreshResponse;

    if (!refreshed.access_token) {
      return NextResponse.json(
        { error: "Spotify did not return an access token." },
        { status: 502 }
      );
    }

    // Save a rotated refresh token when Spotify provides one.
    if (refreshed.refresh_token) {
      const { error: updateError } = await supabaseAdmin
        .from("spotify_tokens")
        .update({
          refresh_token: refreshed.refresh_token,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "owner");

      if (updateError) {
        console.error("Spotify token update failed:", updateError);
      }
    }

    const weekStart = getWeekStart();
    const weekStartMs = weekStart.getTime();

    const allPlays: SpotifyRecentlyPlayedItem[] = [];

    // First page: plays since the beginning of this week.
    const firstUrl = new URL(
      "https://api.spotify.com/v1/me/player/recently-played"
    );

    firstUrl.searchParams.set("limit", "50");
    firstUrl.searchParams.set("after", String(weekStartMs));

    const firstResponse = await fetch(firstUrl, {
      headers: {
        Authorization: `Bearer ${refreshed.access_token}`,
      },
      cache: "no-store",
    });

    if (!firstResponse.ok) {
      console.error(
        "Spotify listening history request failed:",
        firstResponse.status
      );

      return NextResponse.json(
        {
          error:
            firstResponse.status === 429
              ? "Spotify is temporarily rate limiting requests."
              : "Could not retrieve listening history.",
        },
        { status: firstResponse.status === 429 ? 429 : 502 }
      );
    }

    const firstPage =
      (await firstResponse.json()) as SpotifyRecentlyPlayedResponse;

    const firstItems = Array.isArray(firstPage.items)
      ? firstPage.items
      : [];

    allPlays.push(...firstItems);

    // Continue paging backwards when Spotify returns a full page.
    // Stop when we reach the beginning of the week or the safety limit.
    let oldestTimestamp = firstItems.reduce<number | null>(
      (oldest, item) => {
        const timestamp = item.played_at
          ? Date.parse(item.played_at)
          : NaN;

        if (!Number.isFinite(timestamp)) return oldest;

        return oldest === null
          ? timestamp
          : Math.min(oldest, timestamp);
      },
      null
    );

    const MAX_PAGES = 10;

    for (
      let pageNumber = 1;
      pageNumber < MAX_PAGES &&
      firstItems.length === 50 &&
      oldestTimestamp !== null &&
      oldestTimestamp > weekStartMs;
      pageNumber++
    ) {
      const pageUrl = new URL(
        "https://api.spotify.com/v1/me/player/recently-played"
      );

      pageUrl.searchParams.set("limit", "50");
      pageUrl.searchParams.set(
        "before",
        String(oldestTimestamp - 1)
      );

      const pageResponse = await fetch(pageUrl, {
        headers: {
          Authorization: `Bearer ${refreshed.access_token}`,
        },
        cache: "no-store",
      });

      if (!pageResponse.ok) {
        console.error(
          "Spotify history pagination failed:",
          pageResponse.status
        );
        break;
      }

      const page =
        (await pageResponse.json()) as SpotifyRecentlyPlayedResponse;

      const items = Array.isArray(page.items) ? page.items : [];

      if (items.length === 0) break;

      allPlays.push(...items);

      const timestamps = items
        .map((item) =>
          item.played_at ? Date.parse(item.played_at) : NaN
        )
        .filter(Number.isFinite);

      if (timestamps.length === 0) break;

      oldestTimestamp = Math.min(...timestamps);

      if (oldestTimestamp < weekStartMs) break;

      if (items.length < 50) break;
    }

    // Count plays for each unique track.
    const trackMap = new Map<string, WeeklyTrack>();

    for (const item of allPlays) {
      const track = item.track;
      const playedAt = item.played_at;

      if (!track?.id || !playedAt) continue;

      const timestamp = Date.parse(playedAt);

      if (!Number.isFinite(timestamp) || timestamp < weekStartMs) {
        continue;
      }

      const existing = trackMap.get(track.id);

      if (existing) {
        existing.playCount += 1;

        if (timestamp > Date.parse(existing.playedAt)) {
          existing.playedAt = playedAt;
        }

        continue;
      }

      trackMap.set(track.id, {
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
        playedAt,
        playCount: 1,
      });
    }

    // Most-played first. Break ties using the most recent play.
    const rankedTracks = Array.from(trackMap.values()).sort(
      (a, b) =>
        b.playCount - a.playCount ||
        Date.parse(b.playedAt) - Date.parse(a.playedAt)
    );

    const weeklyTracks = rankedTracks.slice(0, 5);

    return NextResponse.json(
      {
        tracks: weeklyTracks,
        total: allPlays.length,
        totalPlays: allPlays.filter((item) => {
          const timestamp = item.played_at
            ? Date.parse(item.played_at)
            : NaN;

          return (
            Number.isFinite(timestamp) &&
            timestamp >= weekStartMs
          );
        }).length,
        weekStartsAt: weekStart.toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Spotify weekly listening error:", error);

    return NextResponse.json(
      { error: "Something went wrong retrieving listening history." },
      { status: 500 }
    );
  }
}
