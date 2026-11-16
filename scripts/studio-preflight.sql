-- READ ONLY. Run in the confirmed project's SQL editor, or through a read-only connector.
-- No credentials, token rows, user emails, file contents, or application content are selected.
begin transaction read only;

select current_database(), current_user, version();
select exists(select 1 from auth.users where id='a78f637f-4bf2-4927-886e-2421af084f4a'::uuid) as configured_owner_exists;

select n.nspname as schema_name,c.relname as object_name,c.relkind,c.relrowsecurity
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname in ('public','studio_internal','storage')
and (c.relname like 'studio_%' or c.relname in ('court_videos','hoop_sessions','spotify_tokens','objects','buckets'))
order by 1,2;

select table_schema,table_name,column_name,data_type,is_nullable
from information_schema.columns
where table_schema='public' and (table_name like 'studio_%' or table_name in ('court_videos','hoop_sessions'))
order by table_name,ordinal_position;

select schemaname,tablename,policyname,roles,cmd,qual,with_check
from pg_policies where schemaname in ('public','storage') order by schemaname,tablename,policyname;

select table_schema,table_name,grantee,privilege_type
from information_schema.role_table_grants
where table_schema='public' and table_name like 'studio_%' order by table_name,grantee,privilege_type;

select n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) as arguments,p.prosecdef,p.proconfig,p.proacl
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname in ('public','studio_internal') and p.proname like 'studio_%' order by 1,2;

select id,name,public,file_size_limit,allowed_mime_types from storage.buckets
where id in ('hoops_bucket','studio-media') order by id;

select to_regclass('supabase_migrations.schema_migrations') as migration_ledger;
-- If a ledger exists, inspect its version/name list separately; do not edit or repair it.
rollback;
