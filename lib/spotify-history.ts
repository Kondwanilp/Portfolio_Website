export type SpotifyPlay = {
  played_at?: string;
  track?: {
    id?: string; name?: string; artists?: { name?: string }[];
    album?: { name?: string; images?: { url?: string }[]; external_urls?: { spotify?: string } };
    external_urls?: { spotify?: string }; duration_ms?: number;
  };
};

export function weekStart(now: number) {
  const date = new Date(now);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString();
}

export function rankWeeklyPlays(plays: SpotifyPlay[], startsAt: string, now: number) {
  const seen = new Set<string>();
  const current = plays.filter(({ played_at, track }) => {
    const timestamp = Date.parse(played_at ?? "");
    const key = `${track?.id}:${played_at}`;
    if (!track?.id || !Number.isFinite(timestamp) || timestamp < Date.parse(startsAt) || timestamp > now || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const tracks = new Map<string, {
    id: string; name: string; artists: string[]; album: string;
    albumArtwork: string | null; spotifyUrl: string | null; albumUrl: string | null;
    duration: number | null; playedAt: string; playCount: number;
  }>();
  for (const { track, played_at } of current) {
    if (!track?.id || !played_at) continue;
    const existing = tracks.get(track.id);
    if (existing) {
      existing.playCount++;
      if (played_at > existing.playedAt) existing.playedAt = played_at;
      continue;
    }
    tracks.set(track.id, {
      id: track.id, name: track.name ?? "Unknown track",
      artists: (track.artists ?? []).map(({ name }) => name ?? "").filter(Boolean),
      album: track.album?.name ?? "", albumArtwork: track.album?.images?.[0]?.url ?? null,
      spotifyUrl: track.external_urls?.spotify ?? null, albumUrl: track.album?.external_urls?.spotify ?? null,
      duration: track.duration_ms ?? null, playedAt: played_at, playCount: 1,
    });
  }
  return {
    tracks: [...tracks.values()].sort((a, b) => b.playCount - a.playCount || Date.parse(b.playedAt) - Date.parse(a.playedAt)).slice(0, 5),
    total: current.length, totalPlays: current.length, weekStartsAt: startsAt,
  };
}
export type WeeklyHistory = ReturnType<typeof rankWeeklyPlays>;

export class SpotifyError extends Error {
  status: number;
  retryAfter: number;
  constructor(message: string, status = 503, retryAfter = 30) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export function retryAfterSeconds(header: string | null, now: number) {
  if (!header) return 30;
  const numeric = Number(header);
  const seconds = Number.isFinite(numeric) ? numeric : (Date.parse(header) - now) / 1000;
  return Number.isFinite(seconds) ? Math.max(1, Math.ceil(seconds)) : 30;
}

type HistoryDependencies = {
  clientId: string;
  readToken: (signal: AbortSignal) => Promise<string>;
  saveToken: (previous: string, replacement: string, signal: AbortSignal) => Promise<void>;
  fetcher?: typeof fetch;
  now?: () => number;
  timeoutMs?: number;
};

export async function loadWeeklyHistory(deps: HistoryDependencies): Promise<WeeklyHistory> {
  const fetcher = deps.fetcher ?? fetch;
  const now = deps.now ?? Date.now;
  const signal = AbortSignal.timeout(deps.timeoutMs ?? 20_000);
  const startsAt = weekStart(now());
  async function request(url: string | URL, options: RequestInit) {
    const response = await fetcher(url, { ...options, signal, cache: "no-store" });
    if (response.status === 429) throw new SpotifyError("Spotify is temporarily rate limiting requests.", 429, retryAfterSeconds(response.headers.get("retry-after"), now()));
    if (!response.ok) throw new SpotifyError("Listening history is temporarily unavailable.", 502);
    return response;
  }
  try {
    const refreshToken = await deps.readToken(signal);
    const tokenResponse = await request("https://accounts.spotify.com/api/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: deps.clientId, grant_type: "refresh_token", refresh_token: refreshToken }),
    });
    const tokens = await tokenResponse.json() as { access_token?: string; refresh_token?: string };
    if (!tokens.access_token) throw new SpotifyError("Spotify did not return an access token.", 502);
    if (tokens.refresh_token && tokens.refresh_token !== refreshToken) await deps.saveToken(refreshToken, tokens.refresh_token, signal);
    const plays: SpotifyPlay[] = [];
    let cursor = now() + 1;
    for (let page = 0; page < 10; page++) {
      const url = new URL("https://api.spotify.com/v1/me/player/recently-played");
      url.searchParams.set("limit", "50");
      url.searchParams.set("before", String(cursor));
      const response = await request(url, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
      const data = await response.json() as { items?: SpotifyPlay[] };
      if (!Array.isArray(data.items)) throw new SpotifyError("Spotify returned incomplete listening history.", 502);
      plays.push(...data.items);
      const times = data.items.map(({ played_at }) => Date.parse(played_at ?? "")).filter(Number.isFinite);
      if (!times.length) break;
      const oldest = Math.min(...times);
      if (data.items.length < 50 || oldest <= Date.parse(startsAt) || oldest >= cursor) break;
      cursor = oldest;
    }
    return rankWeeklyPlays(plays, startsAt, now());
  } catch (error) {
    if (signal.aborted) throw new SpotifyError("Listening history took too long to respond.", 504);
    if (error instanceof SpotifyError) throw error;
    throw new SpotifyError("Listening history is temporarily unavailable.");
  }
}

/** Bounded, process-local cache containing only public track summaries. */
export function createHistoryCache(load: () => Promise<WeeklyHistory>, now = Date.now) {
  type State = {
    week: string; value?: WeeklyHistory; savedAt: number; retryAt: number; error?: SpotifyError;
    pending?: Promise<{ history: WeeklyHistory; stale: boolean; updatedAt: string }>;
  };
  let state: State = { week: "", savedAt: 0, retryAt: 0 };
  return async function getHistory() {
    const week = weekStart(now());
    if (state.week !== week) state = { week, savedAt: 0, retryAt: 0 };
    const current = state;
    const result = (stale: boolean) => ({ history: current.value!, stale, updatedAt: new Date(current.savedAt).toISOString() });
    if (current.value && now() - current.savedAt < 60_000) return result(false);
    if (current.pending) return current.pending;
    if (now() < current.retryAt) {
      if (current.value && now() - current.savedAt < 900_000) return result(true);
      throw new SpotifyError(current.error?.message ?? "Listening history is temporarily unavailable.", current.error?.status, Math.ceil((current.retryAt - now()) / 1000));
    }
    current.pending = (async () => {
      try {
        const value = await load();
        if (value.weekStartsAt !== week) throw new SpotifyError("Listening history is updating for the new week.");
        current.value = value;
        current.savedAt = now();
        current.retryAt = 0;
        return result(false);
      } catch (error) {
        const failure = error instanceof SpotifyError ? error : new SpotifyError("Listening history is temporarily unavailable.");
        current.error = failure;
        current.retryAt = now() + failure.retryAfter * 1000;
        if (current.value && now() - current.savedAt < 900_000) return result(true);
        throw failure;
      } finally { current.pending = undefined; }
    })();
    return current.pending;
  };
}
