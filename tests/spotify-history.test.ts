import assert from "node:assert/strict";
import test from "node:test";
import { createHistoryCache, loadWeeklyHistory, rankWeeklyPlays, retryAfterSeconds, SpotifyError, weekStart } from "../lib/spotify-history.ts";

const monday = Date.parse("2026-11-09T00:00:00Z");
const friday = monday + 4 * 86400000;
const summary = () => rankWeeklyPlays([], weekStart(friday), friday);

test("weekly ranking deduplicates overlapping pages, excludes old/future plays, and breaks ties by recency", () => {
  const play = (id: string, at: number) => ({ track: { id, name: id }, played_at: new Date(at).toISOString() });
  const result = rankWeeklyPlays([play("a", monday), play("a", monday), play("a", monday + 100), play("b", monday + 500), play("b", monday + 600), play("old", monday - 1), play("future", friday + 1)], weekStart(friday), friday);
  assert.equal(result.totalPlays, 4);
  assert.deepEqual(result.tracks.map(({ id }) => id), ["b", "a"]);
  assert.equal(weekStart(Date.parse("2026-11-15T23:59:59Z")), "2026-11-09T00:00:00.000Z");
});
test("concurrent callers share one refresh and cache a successful result", async () => {
  let calls = 0;
  const cache = createHistoryCache(async () => { calls++; await Promise.resolve(); return summary(); }, () => friday);
  const results = await Promise.all([cache(), cache(), cache()]);
  await cache();
  assert.equal(calls, 1);
  assert.ok(results.every((result) => !result.stale));
});
test("provider failures serve bounded stale data and respect Retry-After", async () => {
  let now = friday;
  let calls = 0;
  const cache = createHistoryCache(async () => { calls++; if (calls > 1) throw new SpotifyError("rate limited", 429, 120); return summary(); }, () => now);
  await cache(); now += 61000;
  assert.equal((await cache()).stale, true);
  now += 60000; await cache();
  assert.equal(calls, 2);
  now = friday + 901000;
  await assert.rejects(cache(), (error: unknown) => error instanceof SpotifyError && error.status === 429);
});
test("a week rollover never serves the previous week's cached summary", async () => {
  let now = friday;
  let offline = false;
  const cache = createHistoryCache(async () => { if (offline) throw new Error("offline"); return summary(); }, () => now);
  await cache(); now = monday + 7 * 86400000; offline = true;
  await assert.rejects(cache());
});
test("cold rate limiting is cached with a decreasing retry interval", async () => {
  let now = friday;
  let calls = 0;
  const cache = createHistoryCache(async () => { calls++; throw new SpotifyError("rate limited", 429, 60); }, () => now);
  await assert.rejects(cache()); now += 20000;
  await assert.rejects(cache(), (error: unknown) => error instanceof SpotifyError && error.retryAfter === 40);
  assert.equal(calls, 1);
});
test("parses numeric and HTTP-date Retry-After values", () => {
  assert.equal(retryAfterSeconds("75", friday), 75);
  assert.equal(retryAfterSeconds(new Date(friday + 45000).toUTCString(), friday), 45);
  assert.equal(retryAfterSeconds("invalid", friday), 30);
});
test("refresh-token rotation is persisted before reading history and pagination failures are surfaced", async () => {
  const calls: string[] = [];
  const fetcher: typeof fetch = async (input) => {
    const url = String(input); calls.push(url.includes("api/token") ? "refresh" : "history");
    if (url.includes("api/token")) return Response.json({ access_token: "access", refresh_token: "replacement" });
    return Response.json({ items: [{ track: { id: "track" }, played_at: new Date(monday).toISOString() }] });
  };
  const result = await loadWeeklyHistory({ clientId: "client", readToken: async () => "previous", saveToken: async (old, next) => { assert.equal(old, "previous"); assert.equal(next, "replacement"); calls.push("save"); }, fetcher, now: () => friday });
  assert.deepEqual(calls, ["refresh", "save", "history"]);
  assert.equal(result.totalPlays, 1);
});
test("rate limits on the token endpoint preserve provider retry timing", async () => {
  await assert.rejects(loadWeeklyHistory({ clientId: "client", readToken: async () => "token", saveToken: async () => {}, fetcher: async () => new Response(null, { status: 429, headers: { "Retry-After": "90" } }), now: () => friday }), (error: unknown) => error instanceof SpotifyError && error.status === 429 && error.retryAfter === 90);
});
test("pagination errors do not produce a misleading partial weekly chart", async () => {
  let request = 0;
  const fetcher: typeof fetch = async () => {
    request++;
    if (request === 1) return Response.json({ access_token: "access" });
    if (request === 2) return Response.json({ items: Array.from({ length: 50 }, (_, index) => ({ track: { id: String(index) }, played_at: new Date(friday - index * 1000).toISOString() })) });
    return new Response(null, { status: 500 });
  };
  await assert.rejects(loadWeeklyHistory({ clientId: "client", readToken: async () => "token", saveToken: async () => {}, fetcher, now: () => friday }), (error: unknown) => error instanceof SpotifyError && error.status === 502);
});
test("one deadline bounds provider requests", async () => {
  const fetcher: typeof fetch = async (_, init) => new Promise((_, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
  });
  // The timer keeps the process alive while AbortSignal's unreferenced timer expires.
  const keepAlive = setInterval(() => {}, 1000);
  try {
    await assert.rejects(loadWeeklyHistory({ clientId: "client", readToken: async () => "token", saveToken: async () => {}, fetcher, timeoutMs: 20 }), (error: unknown) => error instanceof SpotifyError && error.status === 504);
  } finally { clearInterval(keepAlive); }
});
