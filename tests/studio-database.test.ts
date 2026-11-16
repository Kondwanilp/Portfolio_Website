import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const owner = "a78f637f-4bf2-4927-886e-2421af084f4a";
const stranger = "00000000-0000-4000-8000-000000000001";
const id = "00000000-0000-4000-8000-000000000002";
test("PostgreSQL migrations enforce RLS, revisions, publication isolation, recovery and private storage", { timeout: 120000 }, async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
      alter default privileges in schema public grant execute on functions to anon,authenticated,service_role;
      create schema auth; create schema storage;
      create table auth.users(id uuid primary key);
      insert into auth.users values('${owner}'),('${stranger}');
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth,public,storage to anon,authenticated;
      grant execute on function auth.uid() to anon,authenticated;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
      alter table storage.objects enable row level security;
      grant select,insert,update,delete on storage.objects to anon,authenticated;
      create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;
      create table public.court_videos(id uuid primary key,title text,is_published boolean);
      insert into public.court_videos values(gen_random_uuid(),'Existing Court Vision clip',true);
      alter table public.court_videos enable row level security;
      create policy legacy_video_read on public.court_videos for select to anon using(is_published);
      create table public.hoop_sessions(id uuid primary key,location text);
      insert into public.hoop_sessions values(gen_random_uuid(),'Existing pickup session');
      insert into storage.buckets(id,name,public) values('hoops_bucket','hoops_bucket',true);
    `);
    for (const name of ["20261115213550_studio_cms_review.sql", "20261115220705_studio_persistence_publication.sql"]) await db.exec(await readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), "utf8"));
    await db.exec(await readFile(new URL("../scripts/studio-preflight.sql", import.meta.url), "utf8"));
    const privileges = await db.query<{ anon_truncate: boolean; authenticated_truncate: boolean; anon_publish: boolean; anon_history_write: boolean }>("select has_table_privilege('anon','studio_entries','TRUNCATE') anon_truncate, has_table_privilege('authenticated','studio_entries','TRUNCATE') authenticated_truncate, has_function_privilege('anon','studio_publish_entry(uuid,bigint)','EXECUTE') anon_publish, has_table_privilege('anon','studio_revisions','INSERT') anon_history_write");
    assert.deepEqual(privileges.rows[0], { anon_truncate: false, authenticated_truncate: false, anon_publish: false, anon_history_write: false });
    assert.equal((await db.query("select * from court_videos where title='Existing Court Vision clip'")).rows.length, 1);
    assert.equal((await db.query("select * from hoop_sessions where location='Existing pickup session'")).rows.length, 1);
    assert.equal((await db.query("select * from storage.buckets where id='hoops_bucket' and public=true")).rows.length, 1);
    assert.equal((await db.query("select * from pg_policies where tablename='court_videos' and policyname='legacy_video_read'")).rows.length, 1);
    async function identity(role: "anon" | "authenticated", user = "") {
      await db.exec(`reset role; set role ${role};`);
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user]);
    }
    const document = { id, kind: "notes", title: "A first note", slug: "first-note", summary: "Public summary", body: "Reviewed body", details: { topic: "Research" }, media: [], workflow: "ready" };
    async function save(value: object, revision: number) {
      return (await db.query<{ result: { revision: number; body: string } }>("select public.studio_save_draft($1::jsonb,$2::bigint) result", [JSON.stringify(value), revision])).rows[0].result;
    }
    async function transition(action: string, revision: number, restore: number | null = null) {
      return db.query("select public.studio_transition($1::uuid,$2::bigint,$3::text,$4::bigint)", [id, revision, action, restore]);
    }
    await identity("anon");
    await assert.rejects(db.query("select * from studio_entries"), /permission denied/);
    await assert.rejects(save(document, 0), /permission denied/);
    assert.equal((await db.query("select * from studio_publications")).rows.length, 0);
    await identity("authenticated", stranger);
    assert.equal((await db.query("select * from studio_entries")).rows.length, 0);
    await assert.rejects(save(document, 0), /Owner required/);
    await identity("authenticated", owner);
    assert.equal((await save(document, 0)).revision, 1);
    await assert.rejects(save(document, 0), /duplicate key/);
    await transition("publish", 1);
    const changed = { ...document, body: "A newer private body", workflow: "draft" };
    assert.equal((await save(changed, 1)).revision, 2);
    await assert.rejects(save(changed, 1), /Revision conflict/);
    await assert.rejects(transition("publish", 2), /Complete and review/);
    await identity("anon");
    const published = await db.query<{ content: { body: string } }>("select content from studio_publications");
    assert.equal(published.rows[0].content.body, "Reviewed body");
    await assert.rejects(db.query("select * from studio_revisions"), /permission denied/);
    await identity("authenticated", stranger);
    assert.equal((await db.query("select * from studio_revisions")).rows.length, 0);
    await assert.rejects(transition("unpublish", 2), /Owner required/);
    await assert.rejects(db.query("insert into studio_entries(id,kind,title,slug) values($1,'notes','Attack','attack')", [crypto.randomUUID()]), /row-level security|check constraint/);
    await identity("authenticated", owner);
    await transition("restore", 2, 1);
    const restored = await db.query<{ document: { revision: number; workflow: string; body: string } }>("select document from studio_entries");
    assert.deepEqual({ revision: restored.rows[0].document.revision, workflow: restored.rows[0].document.workflow, body: restored.rows[0].document.body }, { revision: 3, workflow: "draft", body: "Reviewed body" });
    assert.equal((await db.query("select * from studio_revisions")).rows.length, 3);
    await assert.rejects(db.exec("delete from studio_revisions"), /permission denied/);
    await transition("delete", 3);
    assert.equal((await db.query("select * from studio_publications")).rows.length, 0);
    await transition("reactivate", 4);
    assert.equal((await db.query("select * from studio_entries where deleted_at is null and archived_at is null")).rows.length, 1);
    await assert.rejects(db.exec("delete from studio_entries"), /permission denied/);
    await db.query("insert into storage.objects(bucket_id,name) values('studio-media',$1)", [`${owner}/private.jpg`]);
    await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values('studio-media',$1)", [`${stranger}/wrong.jpg`]), /row-level security/);
    await db.exec("delete from storage.objects");
    assert.equal((await db.query("select * from storage.objects")).rows.length, 1, "Private originals cannot be deleted through the API role");
    await identity("authenticated", stranger);
    assert.equal((await db.query("select * from storage.objects")).rows.length, 0);
    await identity("anon");
    assert.equal((await db.query("select * from storage.objects")).rows.length, 0);
    await identity("authenticated", owner);
    // Private uploaded assets cannot enter a publication without explicit media approval.
    const mediaId = crypto.randomUUID();
    const ref = `upload:${mediaId}`;
    await db.query("insert into studio_media(id,source,source_reference,url,title,media_type) values($1,'upload',$2,$3,'Private image','image')", [mediaId, ref, `/api/published-media/${mediaId}`]);
    await save({ ...document, media: [ref] }, 5);
    await assert.rejects(transition("publish", 6), /Media approval required/);
    await db.query("update studio_media set visibility='public' where id=$1", [mediaId]);
    await transition("publish", 6);
    await assert.rejects(db.query("select studio_manage_media($1,'archive','')", [mediaId]), /Referenced media/);
    const seed = { ...document, id: crypto.randomUUID(), slug: "imported-note", workflow: "draft" };
    const checksum = "a".repeat(64);
    const imported = await db.query<{ result: { revision: number; workflow: string } }>("select studio_seed_draft('source#note',$1,$2::jsonb) result", [checksum, JSON.stringify(seed)]);
    assert.equal(imported.rows[0].result.workflow, "draft");
    const repeated = await db.query<{ result: { revision: number } }>("select studio_seed_draft('source#note',$1,$2::jsonb) result", [checksum, JSON.stringify({ ...seed, body: "Must not overwrite" })]);
    assert.equal(repeated.rows[0].result.revision, imported.rows[0].result.revision);
    await assert.rejects(db.query("select studio_seed_draft('source#note',$1,$2::jsonb)", ["b".repeat(64), JSON.stringify(seed)]), /source changed/);
    assert.equal((await db.query("select * from studio_entries where seed_key='source#note'")).rows.length, 1);
    await transition("unpublish", 6);
    assert.equal((await db.query("select * from studio_publications")).rows.length, 0);
    // Revision references protect originals even after unpublication.
    await assert.rejects(db.query("select studio_manage_media($1,'archive','')", [mediaId]), /Referenced media/);
    await assert.rejects(transition("publish", 6), /Revision conflict/);
    await save({ ...document, media: [ref] }, 7);
    await db.query("update studio_media set archived_at=now() where id=$1", [mediaId]);
    await assert.rejects(transition("publish", 8), /Media approval/);
    assert.equal((await db.query("select * from studio_publications")).rows.length, 0);
    await db.query("update studio_media set archived_at=null where id=$1", [mediaId]);
    await assert.rejects(transition("publish", 6), /Revision conflict/);
    await transition("archive", 8);
    await assert.rejects(save({ ...document, media: [ref] }, 9), /Restore this entry/);
    await assert.rejects(transition("publish", 9), /Complete and review/);
    await transition("reactivate", 9);
    const missingMedia = { ...document, id: crypto.randomUUID(), slug: "invalid-media", media: undefined };
    await assert.rejects(save(missingMedia, 0), /Invalid media/);
  } finally { await db.close(); }
});
