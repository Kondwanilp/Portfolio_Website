-- REVIEW REQUIRED. Generated locally for Project Renaissance Increment 3.
-- This proposal has not been applied or linked to a hosted project.
-- Review existing schema/grants and test RLS with owner/non-owner identities first.
-- Existing Court Vision tables, storage buckets, and policies are untouched.

create table public.studio_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  kind text not null check (kind in ('research', 'experience', 'gallery', 'notes', 'extras')),
  title text not null check (length(trim(title)) between 1 and 200),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  summary text not null default '' check (length(summary) <= 1000),
  body text not null default '' check (length(body) <= 50000),
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  workflow text not null default 'draft' check (workflow in ('draft', 'ready')),
  revision bigint not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_entry_owner check (owner_id = 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid),
  unique (kind, slug)
);

create table public.studio_media (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  source text not null check (source in ('portfolio', 'court-vision', 'upload')),
  source_reference text not null unique,
  url text not null check ((left(url, 1) = '/' and left(url, 2) <> '//') or url ~ '^https://'),
  title text not null,
  alt_text text not null default '',
  media_type text not null check (media_type in ('image', 'video', 'document')),
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  storage_bucket text,
  storage_path text,
  created_at timestamptz not null default now(),
  constraint studio_media_owner check (owner_id = 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid)
);

create table public.studio_entry_media (
  entry_id uuid not null references public.studio_entries(id),
  media_id uuid not null references public.studio_media(id),
  owner_id uuid not null default auth.uid() references auth.users(id),
  position integer not null default 0 check (position >= 0),
  primary key (entry_id, media_id),
  constraint studio_reference_owner check (owner_id = 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid)
);

-- Public snapshots are stored separately from private working drafts.
create table public.studio_publications (
  entry_id uuid primary key references public.studio_entries(id),
  owner_id uuid not null references auth.users(id),
  kind text not null,
  slug text not null,
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  revision bigint not null check (revision > 0),
  published_at timestamptz not null default now(),
  constraint studio_publication_owner check (owner_id = 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid),
  unique (kind, slug)
);

alter table public.studio_entries enable row level security;
alter table public.studio_media enable row level security;
alter table public.studio_entry_media enable row level security;
alter table public.studio_publications enable row level security;

revoke all on public.studio_entries, public.studio_media, public.studio_entry_media, public.studio_publications from anon, authenticated;
grant select, insert, update, delete on public.studio_entries, public.studio_media, public.studio_entry_media, public.studio_publications to authenticated;
grant select on public.studio_publications to anon;

create policy studio_entries_owner on public.studio_entries for all to authenticated
  using ((select auth.uid()) = owner_id and owner_id = 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid)
  with check ((select auth.uid()) = owner_id and owner_id = 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid);
create policy studio_media_owner on public.studio_media for all to authenticated
  using ((select auth.uid()) = owner_id and owner_id = 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid)
  with check ((select auth.uid()) = owner_id and owner_id = 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid);
create policy studio_references_owner on public.studio_entry_media for all to authenticated
  using ((select auth.uid()) = owner_id and owner_id = 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid)
  with check ((select auth.uid()) = owner_id and owner_id = 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid);
create policy studio_publications_read on public.studio_publications for select to anon, authenticated using (true);
create policy studio_publications_owner on public.studio_publications for all to authenticated
  using ((select auth.uid()) = owner_id and owner_id = 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid)
  with check ((select auth.uid()) = owner_id and owner_id = 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid);

create index studio_entries_updated on public.studio_entries (owner_id, updated_at desc);
create index studio_media_owner_index on public.studio_media (owner_id);
create index studio_references_media_index on public.studio_entry_media (media_id);

-- The future application adapter must update drafts with a revision predicate.
-- This invoker function locks that revision and atomically creates a public snapshot.
create function public.studio_publish_entry(p_entry_id uuid, p_expected_revision bigint)
returns public.studio_publications
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  source public.studio_entries%rowtype;
  publication public.studio_publications%rowtype;
  media_snapshot jsonb;
begin
  if (select auth.uid()) is distinct from 'a78f637f-4bf2-4927-886e-2421af084f4a'::uuid then
    raise exception 'Owner authorization required' using errcode = '42501';
  end if;
  select * into source from public.studio_entries
    where id = p_entry_id and owner_id = (select auth.uid()) for update;
  if not found or source.revision <> p_expected_revision then
    raise exception 'Draft revision changed' using errcode = '40001';
  end if;
  if source.workflow <> 'ready' or length(trim(source.summary)) = 0 or length(trim(source.body)) = 0 then
    raise exception 'Complete and review the draft before publishing';
  end if;
  if exists (
    select 1 from public.studio_entry_media em join public.studio_media m on m.id = em.media_id
    where em.entry_id = p_entry_id and m.visibility <> 'public'
  ) then
    raise exception 'Attached media must be approved for public delivery';
  end if;
  if source.kind = 'gallery' and (
    length(trim(coalesce(source.details->>'alt', ''))) = 0 or
    not exists (select 1 from public.studio_entry_media where entry_id = p_entry_id)
  ) then
    raise exception 'Gallery publication requires media and an accessible description';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id', m.id, 'url', m.url, 'alt', m.alt_text, 'type', m.media_type) order by em.position), '[]'::jsonb)
    into media_snapshot from public.studio_entry_media em join public.studio_media m on m.id = em.media_id
    where em.entry_id = p_entry_id;
  insert into public.studio_publications (entry_id, owner_id, kind, slug, content, revision)
    values (source.id, source.owner_id, source.kind, source.slug,
      jsonb_build_object('id', source.id, 'kind', source.kind, 'title', source.title, 'slug', source.slug,
        'summary', source.summary, 'body', source.body, 'details', source.details, 'media', media_snapshot), source.revision)
    on conflict (entry_id) do update set kind = excluded.kind, slug = excluded.slug,
      content = excluded.content, revision = excluded.revision, published_at = now()
    returning * into publication;
  return publication;
end;
$$;
revoke all on function public.studio_publish_entry(uuid, bigint) from public, anon;
grant execute on function public.studio_publish_entry(uuid, bigint) to authenticated;

-- Unpublication removes the public snapshot through an owner-authorized delete.
-- Application integration, seed/import mapping, storage privacy, and live policy
-- tests require review before activating the Supabase adapter or applying this file.
