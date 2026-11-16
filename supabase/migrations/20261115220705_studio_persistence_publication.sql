-- REVIEW ONLY. Apply after the Increment 3 migration in an isolated database first.
-- No existing Court Vision tables, objects, policies, or portfolio assets are changed.
alter table public.studio_entries add column document jsonb not null default '{}'::jsonb;
alter table public.studio_entries add column archived_at timestamptz;
alter table public.studio_entries add column deleted_at timestamptz;
alter table public.studio_entries add column seed_key text unique;

create table public.studio_revisions (
  entry_id uuid not null references public.studio_entries(id),
  revision bigint not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  primary key(entry_id, revision)
);
alter table public.studio_revisions enable row level security;
revoke all on public.studio_revisions from anon, authenticated;
grant select on public.studio_revisions to authenticated;
create policy studio_history_owner on public.studio_revisions for select to authenticated
  using ((select auth.uid()) = 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid);

-- Preserve rows if the review-only Increment 3 schema has since been populated.
update public.studio_entries e set document=jsonb_build_object('id',e.id,'kind',e.kind,'title',e.title,'slug',e.slug,
  'summary',e.summary,'body',e.body,'details',e.details,'workflow',e.workflow,'revision',e.revision,'updatedAt',e.updated_at,
  'media',coalesce((select jsonb_agg(m.source_reference order by em.position) from public.studio_entry_media em join public.studio_media m on m.id=em.media_id where em.entry_id=e.id),'[]'::jsonb));
insert into public.studio_revisions(entry_id,revision,snapshot) select id,revision,document from public.studio_entries;

-- History records are immutable to API roles, including the owner.
create schema studio_internal;
revoke all on schema studio_internal from public,anon,authenticated;
create or replace function studio_internal.studio_record_revision() returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
begin
  if (select auth.uid()) is distinct from 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid then raise exception 'Owner required' using errcode='42501'; end if;
  insert into public.studio_revisions(entry_id,revision,snapshot) values(new.id,new.revision,new.document);
  return new;
end $$;
create function public.studio_prepare_revision() returns trigger language plpgsql security invoker
set search_path = public, pg_temp as $$
begin
  if TG_OP = 'UPDATE' then
    if new.id <> old.id or new.kind <> old.kind or new.owner_id <> old.owner_id then raise exception 'Entry identity is immutable'; end if;
    new.revision := old.revision + 1;
  else new.revision := 1; end if;
  new.updated_at := now();
  new.document := jsonb_build_object('id',new.id,'kind',new.kind,'title',new.title,'slug',new.slug,
    'summary',new.summary,'body',new.body,'details',new.details,'workflow',new.workflow,
    'media',coalesce(new.document->'media','[]'::jsonb),'revision',new.revision,'updatedAt',new.updated_at);
  return new;
end $$;
create trigger studio_prepare before insert or update on public.studio_entries for each row execute function public.studio_prepare_revision();
create trigger studio_history after insert or update on public.studio_entries for each row execute function studio_internal.studio_record_revision();
revoke all on function studio_internal.studio_record_revision(), public.studio_prepare_revision() from public, anon, authenticated;

create function public.studio_save_draft(p_document jsonb, p_expected_revision bigint) returns jsonb
language plpgsql security invoker set search_path = public, pg_temp as $$
declare result jsonb; current_entry public.studio_entries%rowtype;
begin
  if (select auth.uid()) is distinct from 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid then raise exception 'Owner required' using errcode='42501'; end if;
  if jsonb_typeof(p_document->'media') is distinct from 'array' or jsonb_array_length(p_document->'media') > 20 then raise exception 'Invalid media'; end if;
  perform 1 from public.studio_media where source_reference in (select jsonb_array_elements_text(p_document->'media')) for share;
  if exists(select 1 from jsonb_array_elements_text(p_document->'media') r where not exists(select 1 from public.studio_media m where m.source_reference=r and m.archived_at is null)) then raise exception 'Unknown or archived media'; end if;
  if p_expected_revision = 0 then
    insert into public.studio_entries(id,kind,title,slug,summary,body,details,workflow,document)
    values((p_document->>'id')::uuid,p_document->>'kind',p_document->>'title',p_document->>'slug',p_document->>'summary',p_document->>'body',p_document->'details',p_document->>'workflow',p_document)
    returning document into result;
  else
    select * into current_entry from public.studio_entries where id=(p_document->>'id')::uuid for update;
    if not found or current_entry.revision <> p_expected_revision then raise exception 'Revision conflict' using errcode='40001'; end if;
    if current_entry.archived_at is not null or current_entry.deleted_at is not null then raise exception 'Restore this entry before editing'; end if;
    if current_entry.kind <> p_document->>'kind' then raise exception 'Collection is immutable'; end if;
    update public.studio_entries set title=p_document->>'title',slug=p_document->>'slug',summary=p_document->>'summary',body=p_document->>'body',details=p_document->'details',workflow=p_document->>'workflow',document=p_document
    where id=current_entry.id returning document into result;
  end if;
  return result;
end $$;

-- Replaces the earlier draft-only proposal. Publication snapshots never change when a draft is saved.
create or replace function public.studio_publish_entry(p_entry_id uuid,p_expected_revision bigint) returns public.studio_publications
language plpgsql security invoker set search_path=public,pg_temp as $$
declare source public.studio_entries%rowtype; result public.studio_publications%rowtype; assets jsonb;
begin
  if (select auth.uid()) is distinct from 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid then raise exception 'Owner required' using errcode='42501'; end if;
  select * into source from public.studio_entries where id=p_entry_id for update;
  if not found or source.revision <> p_expected_revision then raise exception 'Revision conflict' using errcode='40001'; end if;
  if source.archived_at is not null or source.deleted_at is not null or source.workflow <> 'ready' or trim(source.summary)='' or trim(source.body)='' then raise exception 'Complete and review this entry'; end if;
  if source.kind='gallery' and (jsonb_array_length(source.document->'media')=0 or trim(coalesce(source.details->>'alt',''))='') then raise exception 'Accessible gallery media required'; end if;
  if exists(select 1 from jsonb_array_elements_text(source.document->'media') r where not exists(select 1 from public.studio_media m where m.source_reference=r and m.visibility='public' and m.archived_at is null)) then raise exception 'Media approval required'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',m.source_reference,'url',m.url,'type',m.media_type,'title',m.title,'alt',m.alt_text) order by r.ordinality),'[]'::jsonb)
  into assets from jsonb_array_elements_text(source.document->'media') with ordinality r(ref,ordinality) join public.studio_media m on m.source_reference=r.ref;
  insert into public.studio_publications(entry_id,owner_id,kind,slug,content,revision)
  values(source.id,source.owner_id,source.kind,source.slug,source.document || jsonb_build_object('media',assets),source.revision)
  on conflict(entry_id) do update set kind=excluded.kind,slug=excluded.slug,content=excluded.content,revision=excluded.revision,published_at=now() returning * into result;
  return result;
end $$;

create function public.studio_transition(p_entry_id uuid,p_expected_revision bigint,p_action text,p_restore_revision bigint default null) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare source public.studio_entries%rowtype; previous jsonb;
begin
  if (select auth.uid()) is distinct from 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid then raise exception 'Owner required' using errcode='42501'; end if;
  select * into source from public.studio_entries where id=p_entry_id for update;
  if not found or source.revision <> p_expected_revision then raise exception 'Revision conflict' using errcode='40001'; end if;
  if p_action='publish' then return to_jsonb(public.studio_publish_entry(p_entry_id,p_expected_revision));
  elsif p_action='unpublish' then
    delete from public.studio_publications where entry_id=p_entry_id;
    -- Advance the draft token so a stale publish request cannot undo unpublication.
    update public.studio_entries set workflow='draft' where id=p_entry_id;
  elsif p_action in ('archive','delete') then
    delete from public.studio_publications where entry_id=p_entry_id;
    update public.studio_entries set archived_at=now(),deleted_at=case when p_action='delete' then now() else deleted_at end where id=p_entry_id;
  elsif p_action='reactivate' then update public.studio_entries set archived_at=null,deleted_at=null,workflow='draft' where id=p_entry_id;
  elsif p_action='restore' then
    select snapshot into previous from public.studio_revisions where entry_id=p_entry_id and revision=p_restore_revision;
    if not found then raise exception 'Revision not found'; end if;
    update public.studio_entries set title=previous->>'title',slug=previous->>'slug',summary=previous->>'summary',body=previous->>'body',details=previous->'details',document=previous,workflow='draft',archived_at=null,deleted_at=null where id=p_entry_id;
  else raise exception 'Unknown operation'; end if;
  return jsonb_build_object('ok',true);
end $$;
revoke all on function public.studio_save_draft(jsonb,bigint),public.studio_transition(uuid,bigint,text,bigint) from public,anon;
grant execute on function public.studio_save_draft(jsonb,bigint),public.studio_transition(uuid,bigint,text,bigint) to authenticated;
-- Recovery is always possible. Hard deletion requires a separate reviewed maintenance procedure.
revoke delete on public.studio_entries from authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('studio-media','studio-media',false,52428800,array['image/jpeg','image/png','image/webp','application/pdf','video/mp4','video/webm']);
create policy studio_storage_owner_read on storage.objects for select to authenticated
using(bucket_id='studio-media' and (select auth.uid())='a78f637f-4bf2-4927-886e-2421af084f4a'::uuid and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy studio_storage_owner_insert on storage.objects for insert to authenticated
with check(bucket_id='studio-media' and (select auth.uid())='a78f637f-4bf2-4927-886e-2421af084f4a'::uuid and (storage.foldername(name))[1]=(select auth.uid())::text);
-- No UPDATE or DELETE policy is granted for private originals. New uploads use fresh immutable paths.
-- Public delivery is mediated by /api/published-media after checking a current publication.
-- No anonymous bucket or draft access is granted.

alter table public.studio_media add column archived_at timestamptz;
create function public.studio_manage_media(p_id uuid,p_action text,p_title text default '') returns void
language plpgsql security invoker set search_path=public,pg_temp as $$
declare ref text;
begin
  if (select auth.uid()) is distinct from 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid then raise exception 'Owner required' using errcode='42501'; end if;
  select source_reference into ref from public.studio_media where id=p_id and source='upload' for update;
  if not found then raise exception 'Managed upload not found'; end if;
  if p_action='rename' and length(trim(p_title)) between 1 and 200 then update public.studio_media set title=trim(p_title) where id=p_id;
  elsif p_action='recover' then update public.studio_media set archived_at=null where id=p_id;
  elsif p_action='archive' then
    if exists(select 1 from public.studio_entries where document->'media' ? ref) or
      exists(select 1 from public.studio_revisions where snapshot->'media' ? ref) or
      exists(select 1 from public.studio_publications where content @> jsonb_build_object('media',jsonb_build_array(jsonb_build_object('id',ref)))) then raise exception 'Referenced media must be retained for recovery'; end if;
    update public.studio_media set archived_at=now() where id=p_id;
  else raise exception 'Invalid media action'; end if;
end $$;
revoke all on function public.studio_manage_media(uuid,text,text) from public,anon;
grant execute on function public.studio_manage_media(uuid,text,text) to authenticated;
revoke delete on public.studio_media from authenticated;

-- Seed imports are private, deterministic, and never overwrite an existing seed.
alter table public.studio_entries add column seed_checksum text;
create function public.studio_seed_draft(p_seed_key text,p_checksum text,p_document jsonb) returns jsonb
language plpgsql security invoker set search_path=public,pg_temp as $$
declare existing public.studio_entries%rowtype; result jsonb;
begin
  if (select auth.uid()) is distinct from 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid then raise exception 'Owner required' using errcode='42501'; end if;
  if length(p_seed_key) not between 1 and 200 or p_checksum !~ '^[0-9a-f]{64}$' then raise exception 'Invalid seed provenance'; end if;
  select * into existing from public.studio_entries where seed_key=p_seed_key for update;
  if found then
    if existing.seed_checksum <> p_checksum then raise exception 'Seed source changed; review the content difference'; end if;
    return existing.document;
  end if;
  result := public.studio_save_draft(p_document || '{"workflow":"draft"}'::jsonb,0);
  update public.studio_entries set seed_key=p_seed_key,seed_checksum=p_checksum where id=(result->>'id')::uuid returning document into result;
  return result;
end $$;
revoke all on function public.studio_seed_draft(text,text,jsonb) from public,anon;
grant execute on function public.studio_seed_draft(text,text,jsonb) to authenticated;
