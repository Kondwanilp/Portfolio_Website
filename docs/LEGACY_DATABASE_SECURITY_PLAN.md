# Legacy database least-privilege improvement plan

This plan covers the existing Court Vision, pickup-session, Spotify and legacy media infrastructure. Production execution requires a separately reviewed change and explicit approval. The Studio activation files have their own reviewed scope.

## Observed baseline

Hosted inspection found RLS on all three application tables. Court Vision and pickup-session writes use owner UUID `a78f637f-4bf2-4927-886e-2421af084f4a`. Court Vision reads allow published rows and the owner. Pickup sessions are publicly readable. Spotify tokens have default-deny row policies and are used through the server-only privileged client.

The public application tables carry broad `anon` and `authenticated` grants, including TRUNCATE, REFERENCES and TRIGGER. API roles lack superuser/BYPASSRLS and public-schema CREATE privileges. The inspected public schema has zero functions. RLS applies to row operations, while whole-table privileges need their own grant review. [PostgreSQL RLS scope](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)

## Proposed privilege targets

| Object | Anonymous role | Authenticated role | Additional authorization |
| --- | --- | --- | --- |
| `court_videos` | SELECT | SELECT, INSERT, UPDATE, DELETE | Existing publication/owner RLS, including matching UPDATE checks. |
| `hoop_sessions` | SELECT | SELECT, INSERT, UPDATE, DELETE | Existing owner write RLS. |
| `spotify_tokens` | Zero table privileges | Zero table privileges | Preserve the server-only privileged integration and token rotation. |
| Studio tables/functions | Explicit grants from reviewed Studio migrations | Explicit grants from reviewed Studio migrations | Fixed owner checks, RLS, immutable history and private media. |
| Legacy Storage | Existing behavior until privacy design is approved | Grants required by the existing uploader | Bucket-scoped owner writes and reviewed delivery rules. |

Review service-role access against its actual server callers, including Spotify persistence, owner catalog reads and signed public-media delivery. Supabase-managed roles and schemas need compatibility checks before broad grant changes.

## Rollout sequence

1. Capture current ACLs, policies, defaults, object ownership, roles and caller inventory in the backup. Restore a test environment and compare it with the catalog inspection.
2. Prepare a dedicated migration for narrowing legacy table privileges to the matrix. Preserve required owner CRUD and public SELECT behavior. Verify denied TRUNCATE/REFERENCES/TRIGGER privileges through catalog checks. Execute row-operation acceptance tests using real anonymous, owner and non-owner sessions in staging.
3. Review default privileges for future application objects. The current defaults automatically grant broad table/function access in `public`. Evaluate changes for each creating role, with explicit grants for required new objects. Check Supabase tooling and application RPC compatibility before approval.
4. Optimize the four flagged Court Vision policies by evaluating `(select auth.uid())` once per statement. Preserve role targets, publication conditions and owner WITH CHECK predicates. Compare query plans and behavior with the existing policies. [Advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan)
5. Review Auth settings available under the current plan. The advisor reports disabled leaked-password protection, a provider feature offered on Pro and above. Record the current-plan options and any chosen password/MFA improvements for separate approval. [Provider guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
6. Re-run advisors, owner/non-owner/API tests and legacy integrations. Publish a proposed execution and rollback procedure for approval. Keep the captured ACL/policy definitions available for a reviewed restoration if behavior regresses.

## Legacy video privacy

`hoops_bucket` is public. Its SELECT policy allows every role to read objects in that bucket. Court Vision's row-level `is_published` condition governs metadata visibility. A public Storage URL can still deliver the file after its corresponding row is unpublished. The current inspected inventory contains one published video and one object, so there is no known unpublished row to use for a live privacy test.

A future design should give new uploads private storage, provide owner-only draft previews, and gate public delivery on publication. Evaluate a separate private bucket for new uploads while retaining compatibility for existing published media. Evaluate the lifecycle of existing public files separately, including cached URLs, republishing, redirects under application-controlled URLs, retention, recovery and any approved retirement of delivery copies. Previously downloaded media cannot be recalled. A bucket visibility change affects existing direct URLs and requires explicit impact review.

Stage tests should cover direct object access, listing, owner/non-owner access, lost upload responses, publishing, unpublishing and signed-link expiry. The new Studio bucket's policy scope is distinct from the existing `hoops_bucket` policies. Both delivery paths require their own acceptance results.
