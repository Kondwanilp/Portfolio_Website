import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { PORTFOLIO_OWNER_ID } from "../lib/owner.ts";
import { authorizeStudioOwner, assertSameOrigin, studioRequestOrigin, StudioError } from "../lib/studio/authorization.ts";
import { parseDraft, contentModules } from "../lib/studio/content.ts";
import { createDraftStore } from "../lib/studio/draft-store.ts";

async function removeTestDirectory(directory: string) {
  assert.equal(path.dirname(path.resolve(directory)), path.resolve(tmpdir()));
  assert.match(path.basename(directory), /^studio-(test|concurrent|validation)-/);
  await rm(directory, { recursive: true, force: true });
}

const entry = { id: "a1234567-1234-4123-a123-123456789012", kind: "notes", title: "A laboratory note", slug: "laboratory-note", summary: "Some observations.", body: "One paragraph.\n\nAnother paragraph.", details: { topic: "Biology" }, media: [], workflow: "draft" };

test("Studio allows only a server-verified owner identity", async () => {
  const user = await authorizeStudioOwner("verified-token", async (token) => { assert.equal(token, "verified-token"); return { id: PORTFOLIO_OWNER_ID }; });
  assert.equal(user.id, PORTFOLIO_OWNER_ID);
  await assert.rejects(authorizeStudioOwner("valid-user-token", async () => ({ id: "another-user" })), (error: unknown) => error instanceof StudioError && error.status === 403);
});
test("missing, invalid and expired Studio sessions fail closed", async () => {
  let calls = 0;
  await assert.rejects(authorizeStudioOwner(undefined, async () => { calls++; return { id: PORTFOLIO_OWNER_ID }; }), (error: unknown) => error instanceof StudioError && error.status === 401);
  assert.equal(calls, 0);
  await assert.rejects(authorizeStudioOwner("expired", async () => null), (error: unknown) => error instanceof StudioError && error.status === 401);
  await assert.rejects(authorizeStudioOwner("token", async () => { throw new Error("offline"); }), (error: unknown) => error instanceof StudioError && error.status === 503);
});
test("Studio mutations reject absent and foreign origins", () => {
  assert.doesNotThrow(() => assertSameOrigin("https://portfolio.example", "https://portfolio.example"));
  for (const origin of [null, "https://attacker.example", "null"]) assert.throws(() => assertSameOrigin(origin, "https://portfolio.example"));
});

test("origin validation uses the external request host across loopback normalization and HTTPS proxies", () => {
  const local = { url: "http://localhost:3101/api/studio/session", headers: new Headers({ host: "127.0.0.1:3101" }) };
  assert.equal(studioRequestOrigin(local), "http://127.0.0.1:3101");
  const proxied = { url: "http://internal:3000/api/studio/session", headers: new Headers({ host: "portfolio.example", "x-forwarded-proto": "https" }) };
  assertSameOrigin("https://portfolio.example", studioRequestOrigin(proxied));
  assert.throws(() => assertSameOrigin("https://attacker.example", studioRequestOrigin(proxied)));
});
test("all content modules share validated draft and readiness rules", () => {
  for (const collection of contentModules) {
    const result = parseDraft({ ...entry, kind: collection.id, details: {} });
    assert.equal(result.kind, collection.id);
  }
  assert.throws(() => parseDraft({ ...entry, workflow: "ready", body: "" }));
  assert.throws(() => parseDraft({ ...entry, kind: "gallery", workflow: "ready", details: { alt: "A microscope" } }));
  assert.throws(() => parseDraft({ ...entry, kind: "extras", details: { channel: "not-a-channel" } }));
  assert.throws(() => parseDraft({ ...entry, slug: "../escape" }));
  assert.throws(() => parseDraft({ ...entry, id: "../private" }));
  assert.throws(() => parseDraft({ ...entry, media: ["javascript:alert(1)"] }));
});
test("a draft saves atomically, increments revisions, and rejects stale editors", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "studio-test-"));
  try {
    const store = createDraftStore(root);
    const saved = await store.save(entry, 0);
    assert.equal(saved.revision, 1);
    const updated = await store.save({ ...entry, title: "Updated note" }, 1);
    assert.equal(updated.revision, 2);
    await assert.rejects(store.save(entry, 1), (error: unknown) => error instanceof StudioError && error.status === 409);
    assert.equal((await store.get(entry.id))?.title, "Updated note");
    assert.equal((await store.list()).length, 1);
    assert.deepEqual((await readdir(root)).filter((name) => /\.tmp$|\.lock$/.test(name)), []);
  } finally { await removeTestDirectory(root); }
});
test("simultaneous draft creation preserves one revision and one record", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "studio-concurrent-"));
  try {
    const store = createDraftStore(root);
    const results = await Promise.allSettled([store.save(entry, 0), store.save({ ...entry, title: "Other editor" }, 0)]);
    assert.equal(results.filter(({ status }) => status === "fulfilled").length, 1);
    assert.equal((await store.get(entry.id))?.revision, 1);
    assert.equal((await store.list()).length, 1);
    assert.deepEqual((await readdir(root)).filter((name) => /\.tmp$|\.lock$/.test(name)), []);
  } finally { await removeTestDirectory(root); }
});
test("drafts cannot move between collections and invalid inputs leave storage intact", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "studio-validation-"));
  try {
    const store = createDraftStore(root);
    await store.save(entry, 0);
    await assert.rejects(store.save({ ...entry, kind: "research", details: {} }, 1));
    await assert.rejects(store.save({ ...entry, title: "" }, 1));
    assert.equal((await store.get(entry.id))?.kind, "notes");
    assert.equal((await store.get(entry.id))?.revision, 1);
  } finally { await removeTestDirectory(root); }
});
