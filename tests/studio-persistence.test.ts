import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";
import { createStudioRepository } from "../lib/studio/repository.ts";
import { validateUpload } from "../lib/studio/uploads.ts";
import { extractSeed, seedIdentity } from "../scripts/prepare-studio-seed.mjs";
import { studioSessionRequest } from "../app/studio/session-bridge.ts";
import { assertUploadMetadata } from "../lib/studio/upload-verification.ts";
import { boundedFetch } from "../lib/studio/transport.ts";
import { finishStudioUpload } from "../lib/studio/upload-lifecycle.ts";

test("upload retry reconciles duplicate-object responses and preserves completed transfers on metadata failure", async () => {
  const duplicate = { uploaded: false };
  let verified = 0;
  await finishStudioUpload(duplicate, async () => ({ error: { statusCode: "400", error: "Duplicate" } }), async () => { verified++; });
  assert.equal(verified, 1);
  const ticket = { uploaded: false };
  let transfers = 0;
  const transfer = async () => { transfers++; return { error: null }; };
  await assert.rejects(finishStudioUpload(ticket, transfer, async () => { throw new Error("Metadata unavailable"); }), /Metadata unavailable/);
  await finishStudioUpload(ticket, transfer, async () => undefined);
  assert.equal(transfers, 1);
  await assert.rejects(finishStudioUpload({ uploaded: false }, async () => { throw new Error("Network error"); }, async () => { throw new Error("Object missing"); }), /Object missing/);
});

test("a cancelled renewal cannot run after sign-out, and a failed queue item does not block retry", async () => {
  const original = globalThis.fetch;
  const methods: string[] = [];
  globalThis.fetch = async (_input, init) => { methods.push(init?.method ?? "GET"); return Response.json({ ok: true }); };
  try {
    const cancelled = studioSessionRequest({ method: "POST" }, () => false);
    const signOut = studioSessionRequest({ method: "DELETE" });
    await assert.rejects(cancelled, { name: "AbortError" });
    await signOut;
    assert.deepEqual(methods, ["DELETE"]);
  } finally { globalThis.fetch = original; }
});

test("provider transport retains caller cancellation and bounds hanging requests", async () => {
  const caller = new AbortController();
  caller.abort();
  const transport: typeof fetch = async (_input, init) => {
    assert.equal(init?.cache, "no-store");
    init?.signal?.throwIfAborted();
    return Response.json({ ok: true });
  };
  await assert.rejects(boundedFetch(1000, transport)("https://example.test", { signal: caller.signal }), { name: "AbortError" });
  const keepAlive = setTimeout(() => undefined, 1000);
  try {
    const hanging: typeof fetch = (_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
    });
    await assert.rejects(boundedFetch(5, hanging)("https://example.test"), { name: "TimeoutError" });
  } finally { clearTimeout(keepAlive); }
});

test("upload finalization/publication rejects missing, mismatched, oversized and active-content objects", () => {
  assert.throws(() => assertUploadMetadata(null), /unavailable/);
  assert.throws(() => assertUploadMetadata({ size: 100, contentType: "text/html" }), /unsupported/);
  assert.throws(() => assertUploadMetadata({ size: 52428801, contentType: "image/png" }), /unsupported/);
  assert.throws(() => assertUploadMetadata({ size: 100, contentType: "image/png" }, { size: 101, mime: "image/png" }), /verification failed/);
  assert.doesNotThrow(() => assertUploadMetadata({ size: 100, contentType: "image/png" }, { size: 100, mime: "image/png" }));
});

test("sign-out waits for an in-flight cookie renewal before clearing the session", async () => {
  const original = globalThis.fetch;
  const operations: string[] = [];
  let finishRenewal!: (response: Response) => void;
  globalThis.fetch = async (_input, init) => {
    operations.push(init?.method ?? "GET");
    if (init?.method === "POST") return new Promise<Response>((resolve) => { finishRenewal = resolve; });
    return Response.json({ signedOut: true });
  };
  try {
    const renewal = studioSessionRequest({ method: "POST" });
    const signOut = studioSessionRequest({ method: "DELETE" });
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(operations, ["POST"]);
    finishRenewal(Response.json({ ownerId: "verified-owner" }));
    await Promise.all([renewal, signOut]);
    assert.deepEqual(operations, ["POST", "DELETE"]);
  } finally { globalThis.fetch = original; }
});

test("repository sends owner JWT through the SDK, preserves CAS and maps migration failures safely", async () => {
  const requests: { url: string; init?: RequestInit }[] = [];
  const entry = { id: crypto.randomUUID(), kind: "notes" as const, title: "A note", slug: "a-note", summary: "", body: "private", details: {}, media: [], workflow: "draft" as const };
  let missing = false;
  const client = createClient("https://studio.example.test", "publishable-test-key", { auth: { persistSession: false }, global: {
    headers: { Authorization: "Bearer verified-owner-jwt" },
    fetch: async (input, init) => {
      requests.push({ url: String(input), init });
      if (missing) return Response.json({ code: "PGRST205", message: "Internal relation details" }, { status: 404 });
      if (String(input).includes("/rpc/studio_save_draft")) return Response.json({ ...entry, revision: 1, updatedAt: "2026-11-15T00:00:00Z" });
      return Response.json([{ document: { ...entry, revision: 1 }, archived_at: null, deleted_at: null, studio_publications: [{ revision: 1 }] }]);
    },
  } });
  const repository = createStudioRepository(client);
  assert.equal((await repository.save(entry, 0)).revision, 1);
  assert.equal((await repository.list())[0].publishedRevision, 1);
  assert.equal((await repository.get(entry.id))?.id, entry.id);
  assert.equal(new URL(requests[2].url).searchParams.get("id"), `eq.${entry.id}`);
  assert.equal(new Headers(requests[0].init?.headers).get("authorization"), "Bearer verified-owner-jwt");
  assert.equal(JSON.parse(String(requests[0].init?.body)).p_expected_revision, 0);
  await assert.rejects(repository.save(entry, -1), /valid saved revision/);
  missing = true;
  await assert.rejects(repository.list(), (error: unknown) => error instanceof Error && /migration approval/.test(error.message) && !error.message.includes("Internal relation"));
});

test("media validation rejects active content and enforces size and filename-independent types", () => {
  assert.throws(() => validateUpload({ title: "Script", mime: "image/svg+xml", size: 100 }), /Choose a JPEG/);
  assert.throws(() => validateUpload({ title: "Oversized", mime: "image/png", size: 52428801 }), /50 MB/);
  assert.throws(() => validateUpload({ title: "Empty", mime: "image/png", size: 0 }), /50 MB/);
  assert.equal(validateUpload({ title: " Photo ", mime: "image/jpeg", size: 100 }).extension, "jpg");
});

test("seed preparation preserves exact source, stable identity and flags dynamic content for review", () => {
  const source = '<section id="project"><h2>Original title</h2><p>Personal research text.</p><Image src="/research/photo.jpg" alt="Photo" />{dynamicText}</section>';
  const a = extractSeed(source, "page.tsx", "project", "research", "Project");
  const b = extractSeed(source, "page.tsx", "project", "research", "Project");
  assert.equal(a.entry.id, b.entry.id);
  assert.equal(a.entry.id, seedIdentity("page.tsx#project"));
  assert.equal(a.sourceFragment, source);
  assert.match(a.entry.body, /Personal research text/);
  assert.deepEqual(a.entry.media, ["asset:research/photo.jpg"]);
  assert.deepEqual(a.unresolvedExpressions, ["{dynamicText}"]);
  assert.equal(a.entry.workflow, "draft");
  assert.notEqual(a.checksum, extractSeed(source.replace("Personal", "Updated"), "page.tsx", "project", "research", "Project").checksum);
});
