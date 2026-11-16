import { connection } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createHistoryCache, loadWeeklyHistory, SpotifyError } from "@/lib/spotify-history";

const getHistory = createHistoryCache(() => loadWeeklyHistory({
  clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
  async readToken(signal) {
    const { data, error } = await supabaseAdmin.from("spotify_tokens").select("refresh_token").eq("id", "owner").abortSignal(signal).single();
    if (error || !data?.refresh_token) throw new SpotifyError("Listening history is not currently available.");
    return data.refresh_token;
  },
  async saveToken(previous, replacement, signal) {
    const { data, error } = await supabaseAdmin.from("spotify_tokens")
      .update({ refresh_token: replacement, updated_at: new Date().toISOString() })
      .eq("id", "owner").eq("refresh_token", previous).select("id").abortSignal(signal);
    if (error || !data?.length) throw new SpotifyError("Listening history could not update its connection.");
  },
}));

export async function GET() {
  await connection();
  try {
    if (!process.env.SPOTIFY_CLIENT_ID) throw new SpotifyError("Spotify configuration is incomplete.", 503);
    const { history, stale, updatedAt } = await getHistory();
    const weekEnd = Date.parse(history.weekStartsAt) + 7 * 86400_000;
    const seconds = Math.max(0, Math.min(60, Math.floor((weekEnd - Date.now()) / 1000)));
    return Response.json({ ...history, stale, updatedAt }, {
      headers: { "Cache-Control": stale ? "no-store" : `public, max-age=0, s-maxage=${seconds}` },
    });
  } catch (error) {
    const failure = error instanceof SpotifyError ? error : new SpotifyError("Listening history is temporarily unavailable.");
    return Response.json({ error: failure.message }, {
      status: failure.status,
      headers: { "Cache-Control": "no-store", "Retry-After": String(failure.retryAfter) },
    });
  }
}
