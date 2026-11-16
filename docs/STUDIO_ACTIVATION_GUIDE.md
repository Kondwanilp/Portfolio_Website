# Connecting and preparing The Studio safely

These instructions prepare access, backups, and verification. They do not authorize a live migration. No paid plan or new hosted service is required by this guide. If a step is unavailable, stop there and report it.

## 1. Confirm the project

1. Open the [Supabase dashboard](https://supabase.com/dashboard) and sign in yourself.
2. Select the organization that owns this portfolio. Open the project that contains `court_videos`, `hoop_sessions`, and the existing `hoops_bucket` bucket.
3. Compare the project reference in the dashboard URL with the hostname in the local `.env.local` variable `NEXT_PUBLIC_SUPABASE_URL`. Inspect that file privately; do not paste it into chat. The reference observed in the current checkout is `zpdebvrdourervijfnpd`. Project references are identifiers, not passwords.
4. If those references differ, leave both unchanged and resolve which project is intended before continuing.
5. In Authentication > Users, confirm that the intended owner account has ID `a78f637f-4bf2-4927-886e-2421af084f4a`. Signing into the Supabase dashboard and signing into the portfolio are separate accounts/sessions.

## 2. Reconnect the Supabase integration

Access was verified after reconnection on 2026-11-16 UTC. The connector lists `kondwani's Project`, reference `zpdebvrdourervijfnpd`, and successfully reads its schema, policies, grants, owner-account status, and advisors. The local configured API hostname matches. Continue with backup preparation in section 3 for this connection. The reconnection instructions below apply if access fails in a future session.

Open this assistant's Apps/Integrations settings, find Supabase, and reconnect or reauthorize it. Complete the provider's sign-in flow yourself using the account and organization from step 1. If the connection offers project selection, choose only the confirmed portfolio project and read-only access. Reload the assistant session after connecting. Report that it is reconnected; do not send passwords or keys.

If your IDE uses a custom MCP server instead of the bundled app, use the provider's [MCP setup panel and instructions](https://supabase.com/docs/guides/ai-tools/mcp). Its project-scoped read-only URL is:

```text
https://mcp.supabase.com/mcp?project_ref=zpdebvrdourervijfnpd&read_only=true
```

Use that reference only after confirming it in step 1. Keep normal confirmations enabled. Do not add options that skip approval prompts. Project-scoped connections may disable account-level project-list tools; the decisive check is an authorized read-only query against the intended project.

If the integration remains unavailable, open the confirmed project's SQL Editor and run [studio-preflight.sql](../scripts/studio-preflight.sql). It is explicitly read-only and selects schema, policy, grant, bucket, and owner-existence information. Review results privately and share only the relevant non-secret metadata. Do not run either migration file yet.

Application API keys in `.env.local` do not grant the assistant organization/catalog permissions. Keep the existing publishable key client-visible and the secret key server-only. Never solve this connection problem by putting a secret key into a `NEXT_PUBLIC_` variable.

## 3. Prepare backups before activation

Choose a private, preferably encrypted backup folder outside the repository and public web folders. Avoid automatically shared/synced folders for database exports. Exports can include private drafts, authentication information, and Spotify tokens. Do not commit or send them to chat.

- Record the project reference, backup date, current app revision/worktree changes, database version, and migration ledger versions.
- Back up the repository's current changes, `public`, and ignored `.studio` files. Generate the private seed review with `node scripts/prepare-studio-seed.mjs --write`; it performs no database writes.
- If the project already has a usable dashboard backup, record its time and restoration procedure. Do not enable a paid backup feature for this task.
- Otherwise prepare a logical export with the official CLI and confirm coverage of application data, required Auth/Storage metadata, custom functions, grants, and policies. The CLI guide may require Docker/pg_dump tooling. Missing tooling is a blocker, not a reason to skip the backup.
- Separately download/copy Storage object bytes, keeping their original bucket/path names. A database backup contains Storage metadata, not the actual media files. Preserve the existing basketball videos and any private objects.
- Record authentication settings, redirect URLs, and provider configuration privately. A SQL dump alone is not a complete backup of project configuration or external provider secrets.
- Confirm files are nonempty, calculate SHA-256 checksums, and restore them into an isolated non-production database before declaring the backup usable. Compare row counts, a sample of actual content, media checksums, grants, and policies. A dump command succeeding is not proof of recoverability.

The installed CLI v3 help was inspected during Increment 4.1. It targets local databases by default and supports explicit `--remote=<ref>` and `--file` flags. After CLI authentication, these are export examples for the **confirmed** remote project, using a private folder you choose:

```powershell
# Replace X:\PrivateBackups\Renaissance with your actual private backup folder.
# Run from the portfolio repository. These commands export; they do not apply migrations.
npx.cmd --yes supabase db dump --remote=zpdebvrdourervijfnpd --role-only --file "X:\PrivateBackups\Renaissance\roles.sql"
npx.cmd --yes supabase db dump --remote=zpdebvrdourervijfnpd --file "X:\PrivateBackups\Renaissance\schema.sql"
npx.cmd --yes supabase db dump --remote=zpdebvrdourervijfnpd --data-only --use-copy --file "X:\PrivateBackups\Renaissance\data.sql"
```

Here `npx --yes` accepts package execution, not hosted database changes. Do not append Supabase's own `--yes` flag. Handle any required credentials through the provider's supported private authentication flow. Do not place passwords in commands, screenshots, or URLs you share. Inspect the dump's schema coverage and omissions before relying on it, especially managed schemas and custom Auth/Storage policies. Follow the current [official backup/restore guide](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore) for your project version; do not run its restore steps against production. [Database backup limitations](https://supabase.com/docs/guides/platform/backups) explain the separate Storage-object requirement.

The CLI may require broader credential-management permissions than a read-only connector provides. Review any requested scope yourself. A backup procedure does not authorize schema changes or automatic permission expansion.

Increment 4.2 created encrypted local source, application-data and media archives with integrity/recovery checks. Full PostgreSQL backup coverage and real Auth/Storage staging verification await the tooling and authentication described in the [readiness report](RENAISSANCE_4_2_READINESS.md).

The reconnected read-only inspection establishes project access. The current inventory contains one Court Vision row, one published video, zero pickup-session rows, one Spotify token row, and one Storage object in `hoops_bucket`. Storage metadata reports 4,902,523 bytes for that object. Include all application schemas, Auth/Storage metadata and configuration, local portfolio sources/assets, and the actual video bytes in the backup plan. The completed local artifacts and the remaining full-database restoration requirements are recorded in the Increment 4.2 report.

## 4. Review the exact migrations

Read [STUDIO_MIGRATION.md](STUDIO_MIGRATION.md) and both linked SQL files. The second file was strengthened during Increment 4.1 and must be reviewed in its current form. It has never been applied by this work. If either file has been applied elsewhere, do not edit or replay its history; prepare a separately generated forward migration for that environment.

[STUDIO_MIGRATION_REVIEW.json](STUDIO_MIGRATION_REVIEW.json) records SHA-256 checksums of the exact current migration bytes. Compare them again immediately before approving execution. If files or line endings change, regenerate and re-review the manifest.

Run the read-only preflight and check for existing `studio_*` objects, the `studio_internal` schema, `studio-media`, broader Storage policies, owner mismatches, and migration-ledger conflicts. Both files must pass in order in an isolated Supabase environment with real Auth and Storage before hosted activation. Local PostgreSQL tests cannot certify the live project's policies.

The existing public `hoops_bucket` remains public. The proposed private Studio bucket does not retroactively protect old public video URLs. Review that legacy privacy issue separately without changing existing policies as part of this activation.

## 5. Required approval and verification

After access, backups, restore rehearsal, and staging verification are complete, explicitly approve the named project and the exact reviewed migration files. Approval to inspect, connect, or back up is not approval to migrate or deploy. No production deployment is part of this task.

After approved migration activation, use a test draft and test media in the isolated environment to verify owner access, rejection of another account, expired sessions, sign-out during refresh, upload retry, private previews, publication confirmation, revision recovery, unpublishing, archiving, trash recovery, and cache invalidation. Compare the public view from a separate signed-out browser. Repeat at desktop and narrow mobile widths with keyboard-only navigation.

Keep imported legacy sections private until their content diff and cutover are reviewed. Preserve original files and backups throughout. If activation fails before commit, retain the previous app and inspect the failed transaction. If data was committed, prefer a reviewed forward fix or disable CMS writes while preserving data. Never use a destructive production reset or table drop as a routine rollback. Restoring a live backup requires a separate impact review and explicit approval.
