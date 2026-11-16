import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { PORTFOLIO_OWNER_ID } from "../lib/owner.ts";
import { createStudioRepository } from "../lib/studio/repository.ts";

// Every write in this script is confined to the dedicated local staging endpoint.
const url = process.env.RENAISSANCE_STAGING_URL ?? "http://127.0.0.1:55421";
assert.equal(new URL(url).origin, "http://127.0.0.1:55421", "Use the dedicated loopback staging API");
const publishableKey = process.env.RENAISSANCE_STAGING_PUBLISHABLE_KEY;
const secretKey = process.env.RENAISSANCE_STAGING_SECRET_KEY;
if (!publishableKey || !secretKey) throw new Error("Configure local staging keys privately. Production .env.local is not loaded by this script.");
const options = { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) }) } };
const admin = createClient(url, secretKey, options);
const owner = createClient(url, publishableKey, options);
const stranger = createClient(url, publishableKey, options);
const anonymous = createClient(url, publishableKey, options);

async function main() {
  const ownerPassword = process.env.RENAISSANCE_STAGING_OWNER_PASSWORD;
  assert.ok(ownerPassword, "Configure a private, repeatable local fixture password");
  const existing = await admin.auth.admin.getUserById(PORTFOLIO_OWNER_ID);
  if (existing.data.user) {
    assert.equal(existing.data.user.email, "renaissance-owner@example.test");
    assert.ok(process.env.RENAISSANCE_STAGING_OWNER_PASSWORD, "Supply the existing local fixture password privately for a repeat run");
  } else {
    const created = await admin.auth.admin.createUser({ id: PORTFOLIO_OWNER_ID, email: "renaissance-owner@example.test", password: ownerPassword, email_confirm: true });
    assert.equal(created.error, null);
    assert.equal(created.data.user.id, PORTFOLIO_OWNER_ID);
  }
  const signedIn = await owner.auth.signInWithPassword({ email: "renaissance-owner@example.test", password: ownerPassword });
  assert.equal(signedIn.error, null);
  const oldToken = signedIn.data.session.access_token;
  const oldExpiry = signedIn.data.session.expires_at;
  assert.equal((await owner.auth.getUser()).data.user.id, PORTFOLIO_OWNER_ID);
  assert.equal((await owner.auth.refreshSession()).error, null);
  const strangerEmail = `renaissance-${randomUUID()}@example.test`;
  const strangerPassword = randomBytes(24).toString("base64url");
  assert.equal((await admin.auth.admin.createUser({ email: strangerEmail, password: strangerPassword, email_confirm: true })).error, null);
  assert.equal((await stranger.auth.signInWithPassword({ email: strangerEmail, password: strangerPassword })).error, null);

  const repository = createStudioRepository(owner);
  const identifier = randomUUID();
  const draft = { id: identifier, kind: "notes", title: "Local staging acceptance", slug: `staging-${identifier}`, summary: "Disposable staging content", body: "Private first version", details: { topic: "Staging" }, media: [], workflow: "ready" };
  const first = await repository.save(draft, 0);
  assert.equal(first.revision, 1);
  assert.equal((await stranger.from("studio_entries").select("id").eq("id", identifier)).data.length, 0);
  assert.ok((await anonymous.from("studio_entries").select("id")).error);
  assert.ok((await stranger.rpc("studio_save_draft", { p_document: { ...draft, id: randomUUID() }, p_expected_revision: 0 })).error);

  const mediaId = randomUUID();
  const objectPath = `${PORTFOLIO_OWNER_ID}/${mediaId}.png`;
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aS1sAAAAASUVORK5CYII=", "base64");
  assert.equal((await owner.storage.from("studio-media").upload(objectPath, png, { contentType: "image/png", upsert: false })).error, null);
  assert.equal((await owner.storage.from("studio-media").info(objectPath)).data.size, png.length);
  assert.ok((await anonymous.storage.from("studio-media").download(objectPath)).error);
  assert.ok((await stranger.storage.from("studio-media").download(objectPath)).error);
  const signed = await owner.storage.from("studio-media").createSignedUrl(objectPath, 60);
  assert.equal(signed.error, null);
  assert.equal((await fetch(signed.data.signedUrl)).status, 200);
  const reference = `upload:${mediaId}`;
  assert.equal((await owner.from("studio_media").insert({ id: mediaId, source: "upload", source_reference: reference, title: "Local test pixel", media_type: "image", url: `/api/published-media/${mediaId}`, storage_bucket: "studio-media", storage_path: objectPath })).error, null);
  const attached = await repository.save({ ...draft, media: [reference] }, first.revision);
  await assert.rejects(repository.transition(identifier, attached.revision, "publish"));
  assert.equal((await owner.from("studio_media").update({ visibility: "public" }).eq("id", mediaId)).error, null);
  await repository.transition(identifier, attached.revision, "publish");
  const snapshot = await anonymous.from("studio_publications").select("content").eq("entry_id", identifier).single();
  assert.equal(snapshot.data.content.body, draft.body);
  const changed = await repository.save({ ...draft, media: [reference], body: "Second private version", workflow: "draft" }, attached.revision);
  assert.equal((await anonymous.from("studio_publications").select("content").eq("entry_id", identifier).single()).data.content.body, draft.body);
  await repository.transition(identifier, changed.revision, "restore", first.revision);
  const recovered = await repository.get(identifier);
  assert.equal(recovered.body, draft.body);
  assert.ok(recovered.revision > changed.revision);
  await repository.transition(identifier, recovered.revision, "unpublish");
  assert.equal((await anonymous.from("studio_publications").select("entry_id").eq("entry_id", identifier)).data.length, 0);
  await assert.rejects(repository.transition(identifier, recovered.revision, "publish"));
  const unpublished = await repository.get(identifier);
  await repository.transition(identifier, unpublished.revision, "archive");
  const archived = await repository.get(identifier);
  assert.ok(archived.archivedAt);
  await repository.transition(identifier, archived.revision, "reactivate");
  assert.equal((await repository.get(identifier)).archivedAt, null);

  let applicationChecked = false;
  if (process.env.RENAISSANCE_STAGING_APP_URL) {
    const app = process.env.RENAISSANCE_STAGING_APP_URL;
    assert.equal(new URL(app).origin, "http://127.0.0.1:3102");
    const refreshed = await owner.auth.refreshSession();
    assert.equal(refreshed.error, null);
    const exchange = await fetch(`${app}/api/studio/session`, { method: "POST", headers: { Origin: app, Authorization: `Bearer ${refreshed.data.session.access_token}` } });
    assert.equal(exchange.status, 200);
    let cookie = exchange.headers.get("set-cookie").split(";")[0];
    async function request(route, method = "GET", body) {
      const session = await owner.auth.refreshSession();
      assert.equal(session.error, null);
      const renewed = await fetch(`${app}/api/studio/session`, { method: "POST", headers: { Origin: app, Authorization: `Bearer ${session.data.session.access_token}` } });
      assert.equal(renewed.status, 200);
      cookie = renewed.headers.get("set-cookie").split(";")[0];
      const response = await fetch(app + route, { method, headers: { Origin: app, Cookie: cookie, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined, redirect: "manual" });
      assert.equal(response.status, 200);
      return response.json();
    }
    const appId = randomUUID();
    const appDraft = { ...draft, id: appId, slug: `app-staging-${appId}`, body: "Application publication acceptance", media: [] };
    const saved = await request("/api/studio/content", "PUT", { entry: appDraft, revision: 0 });
    assert.equal(saved.entry.revision, 1);
    const upload = await request("/api/studio/media/upload", "POST", { title: "Application test pixel", mime: "image/png", size: png.length });
    assert.equal((await owner.storage.from("studio-media").uploadToSignedUrl(upload.path, upload.token, png, { contentType: "image/png", upsert: false })).error, null);
    await request("/api/studio/media/upload", "PUT", { id: upload.id, title: "Application test pixel", mime: "image/png", size: png.length });
    assert.equal((await fetch(`${app}/api/studio/media/file/${upload.id}`, { redirect: "manual" })).status, 401);
    assert.equal((await fetch(`${app}/api/published-media/${upload.id}`, { redirect: "manual" })).status, 404);
    const ready = await request("/api/studio/content", "PUT", { entry: { ...appDraft, media: [`upload:${upload.id}`] }, revision: 1 });
    await request(`/api/studio/content/${appId}`, "POST", { action: "publish", revision: ready.entry.revision, confirm: true });
    assert.equal((await fetch(`${app}/api/published-media/${upload.id}`, { redirect: "manual" })).status, 307);
    const page = await fetch(`${app}/journal/notes/${appDraft.slug}`);
    assert.ok((await page.text()).includes(appDraft.body));
    await request(`/api/studio/content/${appId}`, "POST", { action: "unpublish", revision: ready.entry.revision });
    assert.equal((await fetch(`${app}/api/published-media/${upload.id}`, { redirect: "manual" })).status, 404);
    await request("/api/studio/session", "DELETE");
    applicationChecked = true;
  }

  if (process.argv.includes("--check-expiry")) {
    const remaining = oldExpiry * 1000 - Date.now() + 2000;
    assert.ok(remaining < 90000, "Use the prepared 60-second local JWT expiry");
    if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
    assert.ok((await anonymous.auth.getUser(oldToken)).error);
  }
  assert.equal((await owner.auth.signOut({ scope: "local" })).error, null);
  assert.equal((await owner.auth.getSession()).data.session, null);
  console.log(JSON.stringify({ stagingAcceptance: "passed", realAuth: true, realStorage: true, authorization: true, publicationIsolation: true, revisionRecovery: true, archiveRecovery: true, applicationChecked, fixturesRetained: true, expiryChecked: process.argv.includes("--check-expiry") }));
}

try { await main(); }
catch { console.error("Staging acceptance failed. Provider responses and credentials are suppressed. Inspect the local services privately."); process.exitCode = 1; }
