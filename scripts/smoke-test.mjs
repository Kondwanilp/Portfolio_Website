import assert from "node:assert/strict";

const base = process.env.PORTFOLIO_TEST_URL ?? "http://127.0.0.1:3101";
const channels = ["chess", "basketball", "wordplay", "archives"];
for (const path of ["/", "/research", "/extras", "/extras/court-vision-admin", ...channels.map((id) => `/extras/${id}`)]) {
  const response = await fetch(base + path, { signal: AbortSignal.timeout(20000) });
  const html = await response.text();
  assert.equal(response.status, 200, path);
  assert.ok(html.includes('id="main-content"'), path);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff", path);
  if (path === "/extras") for (const id of channels) assert.ok(html.includes(`href="/extras/${id}"`));
  if (path === "/extras/court-vision-admin") assert.match(html, /name="robots" content="noindex, nofollow"/);
  console.log("Page", path, response.status);
}
for (const path of ["/api/spotify/login", "/api/spotify/callback"]) {
  const response = await fetch(base + path);
  assert.equal(response.status, 404, path);
}
const missing = await fetch(base + "/extras/missing-channel");
const missingHtml = await missing.text();
assert.ok(missing.status === 404 || missingHtml.includes('name="robots" content="noindex"'), "Unknown channel must be excluded from indexing.");
console.log("Unknown channel", missing.status);

const histories = await Promise.all(Array.from({ length: 5 }, async () => {
  const response = await fetch(base + "/api/spotify/recently-played", { signal: AbortSignal.timeout(25000) });
  const data = await response.json();
  assert.equal(response.status, 200, "Spotify history must load");
  assert.ok(Array.isArray(data.tracks));
  assert.ok(data.tracks.length <= 5);
  assert.match(response.headers.get("cache-control"), /s-maxage=/);
  return data;
}));
assert.equal(new Set(histories.map(({ updatedAt }) => updatedAt)).size, 1, "Concurrent requests must share a cached result.");
console.log("Spotify", { tracks: histories[0].tracks.length, stale: histories[0].stale, concurrentResponses: histories.length });

for (const path of ["/stockfish/stockfish-19-lite-single.js", "/stockfish/stockfish-19-lite-single.wasm"]) {
  const response = await fetch(base + path, { method: "HEAD" });
  assert.equal(response.status, 200);
  console.log("Engine asset", path, response.status);
}

for (const path of ["/studio", "/studio/research", "/studio/experience", "/studio/gallery", "/studio/notes", "/studio/extras", "/studio/court-vision", "/studio/media"]) {
  const response = await fetch(base + path);
  const html = await response.text();
  assert.equal(response.status, 200, path);
  assert.ok(html.includes("Your private workspace for the portfolio"), "Signed-out Studio routes must show the access gate.");
  assert.ok(html.includes("noindex"));
  console.log("Studio gate", path, response.status);
}
for (const path of ["/api/studio/session", "/api/studio/content", "/api/studio/media", "/api/studio/export/a1234567-1234-4123-a123-123456789012"]) {
  const response = await fetch(base + path);
  assert.equal(response.status, 401, path);
  assert.equal(response.headers.get("cache-control"), "no-store");
  console.log("Protected API", path, response.status);
}
const deniedWrite = await fetch(base + "/api/studio/content", { method: "PUT", headers: { Origin: base, "Content-Type": "application/json" }, body: "{}" });
assert.equal(deniedWrite.status, 401);
const foreignOrigin = await fetch(base + "/api/studio/session", { method: "POST", headers: { Origin: "https://attacker.example", Authorization: "Bearer forged" } });
assert.equal(foreignOrigin.status, 403);
assert.equal(foreignOrigin.headers.get("set-cookie"), null, "Cross-origin failure must not change an existing session");
const forgedToken = await fetch(base + "/api/studio/session", { method: "POST", headers: { Origin: base, Authorization: "Bearer forged" } });
assert.equal(forgedToken.status, 401);
assert.match(forgedToken.headers.get("set-cookie") ?? "", /Max-Age=0/i, "A rejected same-origin exchange must clear any older owner cookie");
console.log("Studio authorization", { missingSession: deniedWrite.status, foreignOrigin: foreignOrigin.status, forgedToken: forgedToken.status });

for (const [path, method] of [
  ["/api/studio/content/00000000-0000-4000-8000-000000000002", "GET"],
  ["/api/studio/content/00000000-0000-4000-8000-000000000002", "POST"],
  ["/api/studio/media/upload", "POST"],
  ["/api/studio/media/upload", "PUT"],
  ["/api/studio/media/00000000-0000-4000-8000-000000000002", "PATCH"],
  ["/api/studio/media/file/00000000-0000-4000-8000-000000000002", "GET"],
]) {
  const response = await fetch(base + path, { method, headers: { Origin: base } });
  assert.equal(response.status, 401, `${method} ${path}`);
  assert.match(response.headers.get("cache-control"), /no-store/);
  console.log("Studio persistence boundary", method, path, response.status);
}
const journal = await fetch(base + "/journal");
assert.equal(journal.status, 200);
assert.match(await journal.text(), /From the Studio/);
const missingEntry = await fetch(base + "/journal/notes/nonexistent-entry");
const missingEntryHtml = await missingEntry.text();
assert.ok(missingEntry.status === 404 || missingEntryHtml.includes('name="robots" content="noindex"'));
console.log("Journal and missing publication", journal.status, missingEntry.status);

const unpublishedMedia = await fetch(base + "/api/published-media/00000000-0000-4000-8000-000000000099", { redirect: "manual" });
assert.ok([404, 503].includes(unpublishedMedia.status), "An unavailable or unpublished object must fail closed");
assert.equal(unpublishedMedia.headers.get("location"), null, "No private signed URL may be issued");
console.log("Unpublished media privacy", unpublishedMedia.status, "no redirect");

const signOut = await fetch(base + "/api/studio/session", { method: "DELETE", headers: { Origin: base } });
assert.equal(signOut.status, 200);
const clearedCookie = signOut.headers.get("set-cookie") ?? "";
for (const attribute of [/Max-Age=0/i, /HttpOnly/i, /SameSite=strict/i, /Secure/i]) assert.match(clearedCookie, attribute);
const foreignSignOut = await fetch(base + "/api/studio/session", { method: "DELETE", headers: { Origin: "https://invalid.example" } });
assert.equal(foreignSignOut.status, 403);
console.log("Session closure", signOut.status, "secure cookie cleared", foreignSignOut.status);
