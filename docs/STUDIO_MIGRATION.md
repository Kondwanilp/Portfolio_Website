# Studio persistence activation review

Status: prepared locally, **not applied**. This document is a review procedure, not permission to change the hosted database.

Increment 4.1 adds [beginner connection and backup instructions](STUDIO_ACTIVATION_GUIDE.md), a [verification report](STUDIO_VERIFICATION.md), and a [read-only preflight](../scripts/studio-preflight.sql). The current second migration strengthens archived-media validation and invalidates stale publish tokens after unpublication; review this version before approval.

## Proposed migrations

Apply in this order only after explicit approval and successful staging verification:

1. [Studio schema](../supabase/migrations/20261115213550_studio_cms_review.sql)
2. [Persistence and publication](../supabase/migrations/20261115220705_studio_persistence_publication.sql)

The first establishes private collections and public snapshots. The second adds a database document adapter, revision history, atomic compare-and-swap saves, publication/recovery functions, seed provenance, and a new private `studio-media` bucket limited to 50 MiB and six explicit MIME types. It preserves any populated Increment 3 rows, their associated media references, and an initial history snapshot. Existing Court Vision tables, objects, bucket settings, sessions, Spotify records, and policies are untouched.

## Preflight requirements

- Obtain authorized read-only catalog access. The current connector lists no accessible projects and denies `pg_policies` inspection. Existing live policies therefore remain unverified.
- Back up the database, relevant bucket metadata, `.studio/drafts`, and the source-controlled portfolio. Confirm a restoration procedure and migration ledger.
- Confirm the configured owner UUID exists in `auth.users` and matches the intended account. No user metadata supplies authorization.
- Inspect existing tables, functions, schemas, bucket names, grants, role memberships, policies, triggers, and migration versions for collisions. In particular, `studio_internal`, `studio_*`, and `studio-media` must match the reviewed state. The bucket insert deliberately fails on a name collision.
- Test both complete files in a disposable Supabase project with real Storage and Auth services. PGlite tests PostgreSQL behavior with test-only Auth/Storage scaffolding; it cannot verify hosted API configuration, upload signing, JWT expiry behavior, or Storage internals.
- Review the existing public Court Vision bucket's privacy separately. The new private bucket does not change or repair legacy public-object URLs.

## Content preservation and seeding

Run `node scripts/prepare-studio-seed.mjs --write` locally. It creates the ignored `.studio/seed-review.json`, with no network calls or database writes. It preserves exact JSX source fragments and checksums for three research sections, experience, and gallery, plus any existing local draft JSON files. Dynamic expressions are explicitly flagged. Source text extraction is an editorial aid: it does not reproduce rich layout, decode every HTML entity, or replace content review. Existing media files remain in place.

The generated seed IDs depend on stable source keys. Before importing, review titles, summaries, details, body formatting, accessible descriptions, dynamic content, and media mappings. Register each media reference in `studio_media`, using the existing path or Court Vision ID; never duplicate an existing file. The complete original source remains the reference for any comparison.

After schema approval, an authenticated owner can submit reviewed entries to `studio_seed_draft(seed_key, checksum, document)` using the owner JWT and publishable key. The function always imports privately. Repeating a matching source key returns its existing entry without overwriting edits; a changed checksum fails for review. Concurrent collisions fail safely. Ordinary local drafts retain their IDs and are imported through `studio_save_draft` with expected revision zero; existing IDs/slugs conflict rather than overwrite. No importer runs on request, startup, or build.

Public source pages continue to display the original content. CMS publications appear as additions on the homepage, research page, Extras, and `/journal`. Imported legacy sections must remain drafts until a separate per-section cutover has removed the corresponding legacy presentation and passed a content diff. This avoids publishing duplicate legacy content. The current increment does not silently replace those sections.

## Authorization and recovery model

Every Studio endpoint verifies the access token with Supabase Auth and compares the returned user ID to the owner. Database requests forward that JWT, with the publishable key, through RLS. Unauthorized and expired sessions cannot use CMS APIs directly. Studio cookie mutations are serialized so a queued renewal cannot overwrite sign-out. The browser's Supabase session handles token refresh; Studio cookies last five minutes and renew every two minutes.

Entry saves lock and compare the expected revision inside a transaction. Triggers build the canonical document and append immutable snapshots, including direct authorized SQL/API edits. Only the internal history trigger uses definer rights, in a non-exposed schema, with fixed search path and an owner check. API roles have no history write permission. Recovery creates a new draft revision and leaves the current publication intact. History UI lists the most recent 100 revisions; older records remain in the database.

Publication locks and validates the saved revision, readiness, accessible gallery description, and approved media, then atomically writes a separate snapshot. Saving afterward never alters public content. Archive and trash remove the public snapshot in the same transaction; reactivation produces a private draft. Hard entry/media deletion is unavailable to the application role. Media referenced by drafts, history, or public snapshots cannot move to trash through the management function. Retention/purge requires a separate approved procedure.

Public portfolio queries use the publishable key and read only `studio_publications`. After publication, unpublication, archive, deletion, or recovery, route handlers expire the shared publication cache tag immediately and revalidate affected page paths. The next read refreshes data. If a request response is lost, reload the collection before repeating an uncertain action.

## Private media and operations

The uploader obtains an owner-authorized signed upload capability for a fresh owner-prefixed path. File transfer goes directly to Storage; finalization verifies actual object metadata before registration. Retries reuse the same object path and finalization is idempotent. Metadata failures keep the editor/file selection available for retry. Upload tokens remain in memory. Selecting the file again requests a fresh capability if it expired.

Studio previews use owner-protected file redirects. Anonymous media delivery first checks an active public snapshot using the anonymous client, then uses server-only credentials to sign that exact registered private object. The signing endpoint grants no draft access. Redirect responses are uncached. Already issued URLs remain valid for up to 60 seconds after unpublication, and previously downloaded files cannot be recalled. Uploaded images bypass the Next.js image cache to preserve this authorization model. Existing local assets continue using image optimization.

An interrupted upload before finalization may leave an unregistered private object. Keep it private and reconcile its owner/path against `studio_media` before any cleanup. Automatic object deletion and background orphan cleanup are intentionally absent until retention and recovery rules are approved. Media trash retains private originals and supports recovery. Renaming an asset does not rewrite historical publication snapshots.

The proposed bucket policies grant owner reads and inserts only. They grant no update/delete access to private originals. Hosted preflight must check for broader existing Storage policies that could affect the new bucket.

## Approval and post-approval verification

Approval must explicitly cover applying the two reviewed migration files to the named Supabase project. No production application or schema deployment is included by implication.

After approval, verify migration results, RLS and function grants, owner/non-owner/anonymous requests, real signed uploads and retries, owner refresh/expiry/sign-out, all publication transitions and rollback behavior, cache invalidation, preview privacy, and desktop/mobile administration. Import only the reviewed seed package as drafts and compare checksums/content before considering publication. Retain the original sources and backups until the cutover is verified.
