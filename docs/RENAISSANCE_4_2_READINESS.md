# Increment 4.2 activation readiness

Live activation awaits the remaining recovery and service-level checks below. The work runs on `portfolio-v2`.

## Backup artifacts and recovery

Private artifacts are stored under `C:\Users\kondw\AppData\Local\ProjectRenaissance\Backups`. This directory has a protected access-control list granting the current Windows user access. Successful `.rbackup` files use AES-256-GCM with a random per-file key protected by Windows DPAPI CurrentUser. Archive checksums and verification receipts identify the exact bytes recovered.

The Windows user profile and its DPAPI recovery material are required for decryption. These archives provide local recovery. Prepare a portable, separately protected copy or Windows-profile recovery arrangement for machine-loss protection.

| Backup | Coverage and evidence |
| --- | --- |
| Application-data export | One Court Vision row, zero pickup-session rows, one Spotify token row, plus the API schema. Two matching reads checked data stability during export. Encryption/decryption and isolated PostgreSQL JSONB row recovery passed for both saved rows. |
| Storage media | One bucket and one video object, with bucket configuration, path, object metadata, size and SHA-256. Encrypted archive verification and a new-folder file restoration passed. |
| Source snapshot | An initial 89,554,265-byte snapshot restored and verified all 283 files, including working-tree changes, Git metadata, public assets, local draft/staging files and environment files. Dependencies and generated Next output are recorded as omissions and rebuilt from the lockfile. The streamed format bounds memory usage. The final refreshed source artifact is identified by its verification receipt. |
| Full PostgreSQL backup | Pending private database/CLI authentication and PostgreSQL backup tooling. Application REST exports cover application rows. Auth records/sessions, complete database roles/DDL/policies, managed-schema customizations, encryption/configuration dependencies and a full schema restoration still need a verified PostgreSQL backup. |

The two matching REST reads provide a consistency check across the small application export. A transaction-consistent database snapshot remains part of the full backup requirement. Backups contain private token/environment material inside encryption. Restoration directories inherit the private backup-folder ACL and can contain plaintext recovered source files.

## Repeatable backup commands

Run from the portfolio repository under the same Windows user. The scripts read provider credentials privately from `.env.local` and print artifact metadata. Remote operations are reads.

```powershell
node scripts/backup-renaissance.mjs application-data
node scripts/backup-renaissance.mjs media
node scripts/backup-renaissance.mjs source

# Replace the placeholder with an actual saved .rbackup path.
node --wasm-num-compilation-tasks=1 scripts/restore-renaissance.mjs "C:\Users\kondw\AppData\Local\ProjectRenaissance\Backups\<archive>.rbackup" --receipt

# For source/media, restore to a newly created private restore-check directory.
node --wasm-num-compilation-tasks=1 scripts/restore-renaissance.mjs "C:\Users\kondw\AppData\Local\ProjectRenaissance\Backups\<archive>.rbackup" --restore-check --receipt
```

Recover source into that new directory and inspect its receipt, file hashes and `.git` branch before resuming development there. Reinstall dependencies using the restored lockfile, then run tests and a build. Treat recovered environment files as private credentials. Media restoration recreates bucket/path names under the private restore-check folder and writes `RESTORE_MANIFEST.json` with bucket configuration and per-file metadata. Uploading those files into a hosted bucket is a separate operation requiring the intended target and authorization.

Application-data recovery currently verifies every JSON row in isolated PostgreSQL. A full restoration should use a verified logical database dump in a new local database, with roles/schema/data in the provider-supported order, followed by content counts, constraints, grants, policies and service tests. Recovery of an Auth user with the configured owner ID must preserve its relationship to Studio authorization. [Provider restoration procedure](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)

The initial folder-ACL command failed when Windows requested an unavailable security privilege. The helper now modifies only the folder DACL. A PostgreSQL recovery check initially hit a WebAssembly compilation memory failure and passed with one compilation task. Failed attempts are retained separately from the verified artifacts. The first small `.json.dpapi` application export predates the `.rbackup` format. Use the verified `.rbackup` copies and their receipts for the current procedure. A deliberately corrupted copy was rejected, and an independent ACL check confirmed protected inheritance with one current-user access rule.

## Isolated staging preparation

The official CLI initialized `.studio/staging/supabase/config.toml`. The prepared project ID is `renaissance-local`, with PostgreSQL 17, API port 55421, database port 55422, Studio port 55423, mail port 55424 and application port 3102. The staging config uses 60-second JWT expiry for real expiry testing. Default seed execution and analytics are disabled. Both migration copies match the reviewed checksums. Hosted project linking is absent.

Local startup was attempted with CLI output captured to keep generated keys private. It exited with a Docker/container-runtime diagnostic. Docker/Podman and PostgreSQL backup commands were absent from PATH. WSL reported that it is uninstalled. The provider's native runtime supports Linux and Apple-silicon macOS, while Windows uses a container runtime. The machine also had approximately 454 MiB free RAM during inspection, which affected one compilation attempt. [Supported local runtimes](https://supabase.com/docs/guides/local-development/docker-and-native-runtimes)

### Steps once a suitable local runtime is available

1. Start the installed container runtime. Choose a local runtime/license suitable for your personal use without adding a paid hosted service.
2. From this repository, run `node scripts/prepare-studio-staging.mjs`, then `npx.cmd --yes supabase start --workdir .studio/staging`. This command targets the dedicated local stack and can initialize its local schemas.
3. Obtain the local API keys from the local stack privately. Set `RENAISSANCE_STAGING_PUBLISHABLE_KEY`, `RENAISSANCE_STAGING_SECRET_KEY`, and a repeatable `RENAISSANCE_STAGING_OWNER_PASSWORD` in your local process environment. Set `RENAISSANCE_STAGING_URL` to `http://127.0.0.1:55421`. Keep key values out of chat/logs.
4. Run `node scripts/test-studio-staging.mjs --check-expiry`. The test creates a local owner fixture using the configured owner UUID and a distinct non-owner account. It exercises real sign-in/refresh/expiry/sign-out, RLS, Storage upload and private-file access, publication isolation, recovery, unpublishing and archive/reactivation. Test fixtures are retained. Repeat runs require the same local owner fixture password.
5. Start the local application in a separate terminal with `node scripts/start-studio-staging.mjs`. This launcher provides loopback Supabase settings through the child-process environment and uses application port 3102.
6. Set `RENAISSANCE_STAGING_APP_URL` to `http://127.0.0.1:3102` and rerun the staging test. The additional flow exercises Studio cookies, content saves, signed uploads/finalization, private file denial, public-media redirects, public rendering and unpublishing through the application APIs.
7. Run the desktop/mobile and keyboard acceptance checklist in STUDIO_VERIFICATION.md against that staging application. Review real service results before live activation approval.

The staging test scripts were prepared and syntax-checked. Real Auth/Storage and application service flows await the missing runtime and local credentials. The earlier isolated PostgreSQL migration tests exercise the schema/RLS/RPC behavior with test Auth/Storage scaffolding.

## Security follow-up and activation requirements

The separate [legacy security plan](LEGACY_DATABASE_SECURITY_PLAN.md) covers broad API-role grants, future default privileges, the four Court Vision policy performance warnings, Auth settings and the legacy public-video delivery gap.

Before live activation, establish a verified full database backup and recovery procedure, pass real staging Auth/Storage/application tests, and complete browser acceptance testing. Review both exact migration files and their checksums. Live application then requires explicit approval for the named project and files. Current backup and staging preparation authorizes local recovery/testing work.

Final automated command results and source-backup verification are recorded in RENAISSANCE.md. Browser automation remains pending while the browser host is unavailable.
