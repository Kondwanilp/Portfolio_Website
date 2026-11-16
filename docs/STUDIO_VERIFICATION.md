# Increment 4.1 verification report

The owner edits private content through `/studio`, which verifies Supabase identity on each API request, forwards the owner JWT through RLS, stores revisions, and publishes a separate snapshot for anonymous portfolio readers. This report distinguishes local verification from hosted activation checks.

## Findings and corrections

| Finding | Correction | Evidence/limit |
| --- | --- | --- |
| A rejected account exchange could retain an older owner cookie. | Same-origin exchanges returning 401/403 clear that cookie. Origin failures do not modify cookies. Provider outages do not discard an otherwise valid session. | HTTP regression checks cover rejected exchange and cross-origin cookie behavior. A real owner-to-non-owner browser switch remains pending. |
| A renewal awaiting browser session lookup could resume after sign-out. | Recheck cancellation after session lookup and again at queue dispatch. Stop renewals during sign-out; resume verification if sign-out fails. Check session-deletion failures. | Queue tests cover cancellation, ordering, and retry after rejection. Real token rotation remains pending hosted/browser access. |
| Unpublishing did not invalidate the draft revision token. | The proposed transition now advances the revision and returns it to draft, preventing a stale publish request from undoing unpublication. | Isolated PostgreSQL regression rejects the old publish token. SQL remains unapplied. |
| Retry reconciliation recognized only HTTP 409, although duplicate-object errors can differ. | Finalize against authenticated server inspection after any transfer result. Keep the ticket and completed transfer on metadata failure. | Tests cover HTTP 400 Duplicate, failed metadata retry without re-upload, and missing objects. No real Storage upload is claimed. |
| Publication trusted registered upload metadata even if the object disappeared. | Verify object presence, permitted type and size before approval. Inspect all referenced uploads before bulk approval. | Validation tests reject missing, mismatched, oversized and active-content metadata. Real Storage info/signing awaits staging. MIME metadata validation is not malware scanning or byte-format validation. |
| Archived media and absent media-array input were insufficiently rejected. | Catalog validation rejects archived assets. Proposed SQL rejects archived publication references and missing media arrays. Draft saves lock referenced media against concurrent archive changes. | PostgreSQL and validation regressions; hosted policy composition remains unverified. |
| Fetching one entry scanned a capped collection response. | Use an indexed ID filter and `maybeSingle`, independent of the list result cap. | SDK request test verifies the exact ID filter and actual returned entry. Collection pagination remains a separate follow-up. |
| Provider fetch wrappers replaced caller cancellation; privileged media delivery lacked a shared deadline. | Combine caller signals with deadlines and use bounded no-store fetch for verified/public/privileged server clients. | Tests cover cancelled callers and hanging requests. Auth uses 10 seconds; Studio data and privileged requests use 15 seconds. |
| Saving media repeated catalog/auth work and publication inspected uploads serially. | Register/validate once on save, reuse verified request context, batch metadata queries/updates, and inspect uploads concurrently. | Type checks and integration suite pass. No browser performance measurements are claimed. |

## Architecture and security review

- Authorization uses `getUser(accessToken)` and the fixed owner ID, never editable user metadata. Cookie sessions are HttpOnly, Secure in production, SameSite Strict, and short-lived. Browser refresh tokens remain with the existing Supabase Auth implementation. Direct Studio APIs verify independently of layout rendering.
- JWT-scoped CMS queries use the publishable key and RLS. Anonymous portfolio reads are confined to publication snapshots. A different authenticated account cannot read drafts/history or mutate entries in the database tests.
- Escaped React text rendering prevents draft bodies from becoming executable HTML. New uploads allow only the documented image/PDF/video types; SVG and HTML are rejected. Private uploaded images bypass public image-optimizer caching.
- Public media redirects first require an active anonymous-readable publication. They never sign an unreferenced private object. Issued signed URLs have a nominal 60-second expiry; previously downloaded content cannot be recalled. Legacy source assets and the public Court Vision bucket remain public.
- Revisions are immutable to API roles. The history-writing definer trigger lives in an unexposed schema, checks the owner, and has fixed search path and revoked direct execute privileges. Other CMS RPCs are invoker-security with explicit owner checks.
- Local filesystem draft writes are absent from production routes. Static asset discovery reads files. The seed tool performs explicit offline review-file writes only.
- Sign-out removes browser/Studio credentials; it is not a guarantee that a copied access token is revoked immediately. Supabase access tokens can remain usable until expiry. Stronger revocation/session-ID checks would require a separately reviewed hosted design. No claim of immediate token revocation is made.

## Migration compatibility review

Both proposed files were reviewed in order. They create Studio-specific objects and the new private `studio-media` bucket. They contain no changes to `court_videos`, `hoop_sessions`, `spotify_tokens`, `hoops_bucket`, or legacy policies. Tests install legacy Court Vision/session/bucket/policy fixtures first, run both files, then verify those fixtures survive.

The read-only preflight script also executes successfully against the isolated PostgreSQL fixture. Existing Increment 3 rows are backfilled before history triggers begin. The first migration establishes legacy relation tables; the second uses canonical document media references after backfill. The legacy relation table is retained for compatibility and is not the new editor's authoritative attachment list.

Hosted conflicts cannot be ruled out: project listing is empty and catalog/security-advisor requests are denied. Before activation, inspect object/constraint/function/schema/bucket names, the migration ledger, the configured owner, default grants and role memberships, exposed schemas, and every existing Storage policy. Permissive PostgreSQL policies can combine with OR; a broad legacy policy could widen the new bucket's access. The isolated fixture cannot prove absence of such a policy in production.

The second migration was corrected in place because both migration files remain review-only and have not been applied by this project work. The current files, rather than an earlier review copy, require approval. If an environment already applied either version, create a forward migration for it instead of editing/replaying history.

## Hosted and browser blockers

Supabase access was restored and the hosted read-only preflight completed on 2026-11-16 UTC. The current findings appear in the latest preflight section of RENAISSANCE.md. The earlier catalog-access blocker is resolved. Real CMS Auth/Storage workflows await schema activation in an isolated environment. The last browser inventory reported `The browser access host is unavailable`, so interactive desktop/mobile verification remains pending.

Follow [the activation guide](STUDIO_ACTIVATION_GUIDE.md) to confirm/reconnect the project and prepare backups. Actual backups, object downloads, restore rehearsal, real Auth/Storage staging tests, and live migration activation remain undone. Do not treat a successful local test as approval to migrate or deploy.

## Manual desktop and mobile acceptance checklist

Run in an isolated environment after access and the reviewed schema are available. Use disposable content/media and separate owner/non-owner accounts. Avoid live edits to personal content.

1. At desktop width (approximately 1440px), sign in as the owner. Verify every Studio module, the shared Court Vision dashboard, legacy route, media library, focus visibility, and unsaved-change confirmations.
2. In a separate signed-out browser, request Studio pages/APIs, draft/private media URLs, and unpublished publication URLs. Expect the access gate or 401/403/404, and no private body or signed redirect.
3. Switch from owner to a non-owner account. Verify the old Studio cookie is cleared and data endpoints cannot reuse owner access. Test expired credentials, refresh, provider failure, retry, and sign-out while renewal is pending. Do not copy access tokens into chat or screenshots.
4. Upload a small image and PDF, then a permitted video. Throttle/fail the network, retry transfer/finalization, and confirm a single registered asset. Reject wrong types, empty/oversized files, and mismatched metadata. Confirm private preview and direct signed-out denial.
5. Save and mark ready, confirm publication, compare the signed-out portfolio, edit the draft without publishing, and verify public text stays unchanged. Publish again and verify refreshed lists/detail pages. Test unpublish, archive, trash, reactivation, stale-editor conflicts, and revision recovery.
6. Verify unpublishing stops new signed links; account for already-issued 60-second capabilities. Verify referenced media cannot move to trash and unused media can be recovered.
7. At 390px and 320px widths, repeat editing, media selection, confirmation dialogs, upload feedback, and sidebar navigation. Check horizontal overflow, readable labels, touch targets and scrolling. Use Tab/Shift+Tab, Enter/Space, and Escape without a mouse, plus 200% zoom.
8. Recheck original research text/posters, professional experience, photos, basketball videos, pickup sessions, Spotify freshness, daily chess puzzle, and Stockfish free play/reset. Confirm imports remain private and original content is neither removed nor duplicated.

## Automated verification

Final command results are recorded in the Increment 4.1 section of [RENAISSANCE.md](RENAISSANCE.md). PostgreSQL tests use in-memory PGlite with minimal Auth/Storage scaffolding; they exercise actual migrations, RLS, transactions and RPCs, but do not emulate hosted Auth or Storage services. SDK tests inspect real request generation with controlled provider responses. The production HTTP smoke suite exercises the running application while the CMS schema remains unavailable.
