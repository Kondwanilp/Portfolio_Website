import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const options = { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(15000) }) } };
const admin = createClient(url, process.env.SUPABASE_SECRET_KEY, options);
const anonymous = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, options);

const { data: bucket, error: bucketError } = await admin.storage.getBucket("hoops_bucket");
if (bucketError) throw new Error(`Bucket inspection failed (${bucketError.status ?? "network"}).`);
console.log("Court Vision bucket", { public: bucket.public, fileSizeLimit: bucket.file_size_limit, allowedMimeTypes: bucket.allowed_mime_types });

for (const [label, client] of [["anonymous", anonymous], ["privileged", admin]]) {
  for (const [table, filter] of [["court_videos", false], ["court_videos", true], ["hoop_sessions", null], ["spotify_tokens", null]]) {
    let query = client.from(table).select("id", { count: "exact", head: true });
    if (filter !== null) query = query.eq("is_published", filter);
    const { count, error, status } = await query;
    console.log("Read visibility", { role: label, table, published: filter, status, count, errorCode: error?.code });
  }
}

const schemaResponse = await fetch(`${url}/rest/v1/`, {
  headers: { apikey: process.env.SUPABASE_SECRET_KEY, Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}` },
  signal: AbortSignal.timeout(15000),
});
if (schemaResponse.ok) {
  const schema = await schemaResponse.json();
  for (const name of ["court_videos", "hoop_sessions"]) console.log("Table contract", name, schema.definitions?.[name]);
}

const puzzleResponse = await fetch("https://lichess.org/api/puzzle/daily", { signal: AbortSignal.timeout(15000) });
if (!puzzleResponse.ok) throw new Error(`Lichess returned ${puzzleResponse.status}.`);
const puzzle = await puzzleResponse.json();
console.log("Lichess contract", { puzzleKeys: Object.keys(puzzle.puzzle ?? {}), hasFen: Boolean(puzzle.puzzle?.fen), hasPgn: Boolean(puzzle.game?.pgn), initialPly: puzzle.puzzle?.initialPly });
const { normalizeDailyPuzzle } = await import("../lib/chess-puzzle.ts");
const normalized = normalizeDailyPuzzle(puzzle);
console.log("Lichess validated", { id: normalized.id, solutionMoves: normalized.solution.length, fenValid: Boolean(normalized.fen) });
