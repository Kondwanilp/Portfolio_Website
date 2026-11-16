import assert from "node:assert/strict";
import test from "node:test";
import { changeVideoPublication, deleteCourtVideo, saveVideoDraft, validateVideoFile, type VideoGateway, type VideoDraft } from "../lib/video-lifecycle.ts";

const draft: VideoDraft = { id: "upload", storage_path: "court-videos/upload.mp4", title: "Friday runs", location: "GSU", played_on: "2026-11-15", description: null, is_published: false };
function gateway(overrides: Partial<VideoGateway> = {}): VideoGateway {
  return { find: async () => null, insert: async () => {}, setPublished: async () => {}, removeFile: async () => {}, deleteDraft: async () => {}, ...overrides };
}

test("reconciles an insert whose response was lost without a duplicate upload", async () => {
  let inserted = false;
  await saveVideoDraft(gateway({ find: async () => inserted ? draft : null, insert: async () => { inserted = true; throw new Error("connection lost"); } }), draft);
  assert.equal(inserted, true);
});
test("retrying a completed draft does not overwrite its publication state", async () => {
  let writes = 0;
  await saveVideoDraft(gateway({ find: async () => ({ ...draft, is_published: true }), insert: async () => { writes++; } }), draft);
  assert.equal(writes, 0);
});
test("failed metadata save retains the object for recovery", async () => {
  let removals = 0;
  await assert.rejects(saveVideoDraft(gateway({ insert: async () => { throw new Error("offline"); }, removeFile: async () => { removals++; } }), draft), /file is retained/);
  assert.equal(removals, 0);
});
test("deletion unpublishes before removing the file and row", async () => {
  const calls: string[] = [];
  await deleteCourtVideo(gateway({ find: async () => ({ ...draft, is_published: true }), setPublished: async () => { calls.push("unpublish"); }, removeFile: async () => { calls.push("file"); }, deleteDraft: async () => { calls.push("row"); } }), draft.id);
  assert.deepEqual(calls, ["unpublish", "file", "row"]);
});
test("a storage failure retains a draft row and retries can finish deletion", async () => {
  let published = true;
  let deleted = false;
  let fail = true;
  const store = gateway({
    find: async () => deleted ? null : ({ ...draft, is_published: published }),
    setPublished: async (_, next) => { published = next; },
    removeFile: async () => { if (fail) throw new Error("storage offline"); },
    deleteDraft: async () => { deleted = true; },
  });
  await assert.rejects(deleteCourtVideo(store, draft.id));
  assert.equal(published, false);
  assert.equal(deleted, false);
  fail = false;
  await deleteCourtVideo(store, draft.id);
  await deleteCourtVideo(store, draft.id);
  assert.equal(deleted, true);
});
test("refuses to reuse an upload identity for another object", async () => {
  await assert.rejects(saveVideoDraft(gateway({ find: async () => ({ ...draft, storage_path: "other.mp4" }) }), draft), /different file/);
});
test("validates MIME, extension, empty files and maximum size", () => {
  assert.equal(validateVideoFile({ name: "clip.MOV", type: "", size: 500 }).contentType, "video/quicktime");
  for (const file of [{ name: "clip.exe", type: "video/mp4", size: 1 }, { name: "clip.mp4", type: "text/html", size: 1 }, { name: "clip.mp4", type: "video/mp4", size: 0 }, { name: "clip.mp4", type: "video/mp4", size: 46 * 1024 * 1024 }]) assert.throws(() => validateVideoFile(file));
});

test("publication refuses incomplete uploads without changing the row", async () => {
  let writes = 0;
  await assert.rejects(changeVideoPublication(gateway({ find: async () => draft, setPublished: async () => { writes++; } }), draft, async () => false), /incomplete/);
  assert.equal(writes, 0);
});
test("publication detects stale state from another editor", async () => {
  await assert.rejects(changeVideoPublication(gateway({ find: async () => ({ ...draft, is_published: true }) }), draft, async () => true), /video changed/);
});
test("a published clip with a missing file can still be unpublished", async () => {
  let result = true;
  const video = { ...draft, is_published: true };
  await changeVideoPublication(gateway({ find: async () => video, setPublished: async (_, value) => { result = value; } }), video, async () => { throw new Error("The file check should be unnecessary for unpublishing."); });
  assert.equal(result, false);
});
