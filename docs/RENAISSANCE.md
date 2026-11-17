# Project Renaissance

## Working agreement

Portfolio V3 supersedes the V2 visual direction. The approved reset is documented in `V3_REFERENCE_ANALYSIS.md` and `V3_CREATIVE_DIRECTION.md`: Fieldwork, a personal scientific workspace. Work takes place in the separate `kondwani-portfolio-v3` checkout on `portfolio-v3`. The original `kondwani-portfolio` working tree, its uncommitted V2 source, `portfolio-v2` and `main` are preserved. The latest explicit instruction is local review before GitHub or Vercel; no push or deployment is authorized. Database activation and container-dependent staging remain deferred.

The Studio uses Supabase-backed drafts, revisions, private media and published snapshots through a verified owner-only server/API boundary. Both proposed migrations await explicit live-activation approval. Existing source-controlled portfolio content remains available while the hosted Studio schema is pending. Court Vision retains its established administration and publication modules.

The active V3 checkout is `kondwani-portfolio-v3` on `portfolio-v3`; V2 remains separately recoverable at `kondwani-portfolio`. Work proceeds in reviewable local increments. Personal writing, research, the approved palette, Spotify, Chess Corner, Court Vision, authentication, video management and the actual résumé are preserved requirements. Historical increment records below describe earlier V2 states and are not the current V3 design contract.

Production deployment, paid services, changes to `main`, secret disclosure, and destructive database changes require the owner's explicit approval.

## Application audit - Increment 1 baseline

Audited on November 15, 2026. The baseline checkout was clean. The parent directory contains a separate package manifest and a copy of the application. The active Git repository is the nested `kondwani-portfolio` directory.

The audit covers all application routes, shared components, stylesheets, Supabase clients, Spotify handlers, configuration, dependency manifests, and public asset inventory. Hosted database policies, bucket configuration, provider dashboards, and authenticated mutations remain unverified.

| Area | Findings | Priority and response |
| --- | --- | --- |
| Framework | Next.js 16.4.3, React 19.3.0, strict TypeScript, App Router, Cache Components and Partial Prefetching enabled. Local Next.js documentation is available under `node_modules/next/dist/docs`. | Follow installed documentation and preserve framework configuration. |
| Homepage | Entire page was a client component. Entrance opacity hid server-rendered content, and offscreen links remained keyboard reachable during the overlay. | P1 addressed with a server page and native modal entrance. |
| Research | Three detailed projects, lab photos, presentation photos, and posters. Images lacked intrinsic dimensions and optimized delivery. Two poster originals are approximately 16.3 and 17.8 MiB. | P1 addressed with static `next/image` imports and responsive sizes. Verify rendered image quality and bandwidth in browser QA. |
| Design system | Beige, ink, sage, serif headings, sans-serif body, and monospaced labels already exist. The design-refinement section was accidentally nested inside the reduced-motion query. Global stylesheet exceeds 2,100 lines. | P1 scope fix completed. Shared spacing, surfaces, focus treatment, and SVG icons added. Gradual stylesheet consolidation continues. |
| Responsive layout | Homepage navigation squeezed five links beside the wordmark at small widths. Short viewports could clip the entrance. Chessboards enforce a 240px minimum. | Navigation wraps with larger touch areas. Entrance can scroll in short viewports. Board sizing remains a follow-up. |
| Accessibility | Reduced-motion handling and some focus styles already exist. Missing skip link, incomplete tab associations and arrow-key behavior, emoji decorations, and limited live feedback. Chess gameplay relies on dragging. | Skip link, modal focus behavior, tab keyboard behavior, SVG decorations, upload progress semantics, and admin alerts added. Keyboard move entry and video captions remain pending. |
| Extras | Four channels are selected through local React state. Chess and Court Vision were eagerly imported. Channel state has no URL/history representation. | Channel and chess-mode modules now load on demand. Deep links and focus restoration are next. |
| Daily puzzle | Fetches the Lichess daily endpoint directly, validates solution moves, and supports retry/reveal. It expects `puzzle.fen`, while its response type also includes game PGN. Board observation starts before the conditional board mounts. | P1 verify actual provider response and handle PGN-derived positions. Reattach resize observation when the board appears. |
| Free play | Stockfish runs in a local worker with cleanup. Chessboard library is client-only. Baseline lint flagged mutable ref reads during render and an engine-effect dependency warning. | Initialization now uses lazy state, rendered player colors derive from state, and the worker-start callback is stable. Regression checks for reset, undo, color changes, and stale worker responses remain pending. |
| Court Vision | Browser queries `hoop_sessions` and published `court_videos`. Video URLs come from `hoops_bucket` using `getPublicUrl`. Public query and admin previously duplicated model/date definitions. | Shared models, bucket name, and date formatting extracted. Hosted access policies remain unverified. |
| Admin access | Password authentication and a hard-coded owner UUID gate the UI. Browser sessions use the publishable Supabase client. UI gating depends on matching hosted table/storage policies for enforcement. | P1 review actual RLS and storage policy ownership checks before adding CMS writes. Keep owner identity compatible during that work. |
| Video lifecycle | TUS uploads use a 45 MiB limit, six-MiB chunks, retries, and draft metadata. MIME is derived from the file. Resuming a previous upload can conflict with a newly generated storage path. Cleanup results are ignored. Deletion removes storage before the database row. | P1 design retry-safe upload identity and reconciliation. Draft files in a public bucket can still be reachable by URL. Private draft delivery needs coordinated storage work. |
| Spotify security | PKCE, state verification, HttpOnly setup cookies, server-only secret client, and local-only login already exist. The callback lacked the same environment restriction. | Callback now shares the login restriction, covered by eight regression cases. |
| Spotify reliability | Each public history request refreshes the owner token and may fetch up to ten pages. No application-level cache, request coalescing, or explicit upstream timeout. Weekly boundaries use Monday at 00:00 UTC. | P1 add bounded provider requests and confirm the existing reporting timezone with the owner. P2 add cache/coalescing with token-rotation handling. |
| Supabase boundaries | Browser client uses public URL/publishable key. Privileged client imports `server-only` and disables session persistence. Environment values are asserted at client initialization. No migrations or generated database types are tracked. | Document environment names, verify live policies read-only, then introduce schema-derived types and a server authorization boundary. |
| SEO | Root title/description exist. Research and Extras lacked distinct metadata, and the admin inherited indexable defaults. Canonical origin, sitemap, and social imagery are absent. | Route titles/descriptions and admin noindex added. Confirm the public origin before canonical URLs and sitemap work. |
| HTTP security | No custom security headers were configured. | Added MIME sniffing protection, referrer policy, same-origin framing, and permissions restrictions. A CSP needs provider/worker compatibility testing. |
| Tooling | Baseline build and type check pass. No test script existed. Baseline lint reported 46 errors and 122 warnings, including vendored Stockfish output. README contains starter instructions and an inaccurate font description. | Added explicit typecheck/test commands and targeted tests. Excluded vendored Stockfish from source lint. Remaining source lint debt and dependency advisory scanning are follow-ups. |

## Design system

The established typography stays in use. `EB Garamond` supplies editorial headings, `Instrument Sans` body text and controls, `Courier Prime` labels, and `Alex Brush` the portrait caption.

| Role | Token or convention |
| --- | --- |
| Page background | `--background`, warm beige `#f1ebe0` |
| Primary ink | `--foreground` / `--text-primary`, `#292720` |
| Body copy | `--text-secondary`, `#625d53` |
| Paper | `--paper`, `#fffdf9` |
| Subtle surface | `--surface-subtle`, `#f7f3eb` |
| Inset surface | `--surface-inset`, `#eee7da` |
| Accent | `--accent`, sage `#719d9a` |
| Keyboard focus | `--focus-ring`, dark sage `#527b77` |
| Spacing | `--space-1`, `2`, `3`, `4`, `6`, `8` represent 4–32px |
| Controls | `--radius-control`, 3px. Navigation targets are at least 44px high. |
| Icons | `app/components/Icon.tsx`, 24px SVG viewBox, currentColor, decorative and hidden from assistive technology. Adjacent text supplies meaning. |

Increment 5 brings the public Extras surfaces into the paper-and-ink system while retaining practical game and board colors. Small text uses the darker `--sage-ink` token. Fonts are locally hosted. Historical audit findings below describe their original increment. New interactive controls need labels, visible focus, disabled/loading states, reduced-motion support, and touch sizing. Content and contrast checks must include mobile and zoomed layouts.

## Architecture decisions

### 001 — Keep the existing application stack

Use the current Next.js/React/Supabase/TUS/Stockfish architecture. This increment adds no dependencies. Reuse the established content and visual language while extracting boundaries as they become needed.

### 002 — Server-render the portfolio content

`app/page.tsx` owns static portfolio markup. Increment 5 replaces the original modal entrance with an inline portrait study. `ScientificMotion` progressively enhances server-rendered content with session-aware finite animation. Navigation and reading remain available throughout. Native dialogs are reserved for user-opened image lightboxes and administration confirmations.

### 003 — Introduce shared foundations gradually

`app/foundations.css` provides cross-route primitives. The reduced-motion scope correction activates the existing refinement rules consistently. Homepage Extras-introduction selectors are scoped to their section to avoid styling the separate Extras directory. Feature styles stay alongside their components during consolidation. Static images use intrinsic metadata and responsive delivery.

### 004 — Preserve the current Supabase data contract

`lib/court-vision.ts` centralizes the existing models, bucket name, and calendar-date formatting. The extraction retains existing table names, fields, draft state, public filtering, and browser session behavior. These types describe current callers and require validation against the hosted schema before expansion.

Supabase authorization relies on database/storage enforcement. The next backend increment should inspect those policies and introduce a verified owner check for server mutations. Authorization roles must use trusted application metadata or database ownership. [Supabase storage access-control documentation](https://supabase.com/docs/guides/storage/security/access-control)

### 005 — Build CMS capabilities around the existing editor

The first reusable CMS domain is Court Vision. Extract its authentication boundary, uploader, video library, and session editor into focused modules. Use `/studio` as the central owner workspace and preserve `/extras/court-vision-admin` as a compatibility route. Extend the dashboard to research, experience, gallery, and Extras after draft/publication rules and policies have been verified.

The proposed content model includes typed entries, media references, draft/published state, ordering, and timestamps. Model research collaborators, methods, posters, and presentations explicitly to preserve the richness of the current writing. Build an import and preview path for existing content before switching public reads. Schema migrations and production changes remain separate reviewable increments.

### 006 — Match Spotify setup restrictions across both endpoints

The authorization callback and login share the loopback/development restriction. PKCE, state cookies, and the server-only token store continue to handle the existing local owner setup. Focused tests cover production rejection and misleading hostnames.

## Development roadmap

### Increment 1 — Audit and foundations

- [x] Audit source/configuration/assets and record baseline checks.
- [x] Correct reduced-motion CSS scope.
- [x] Add shared design foundations and SVG icon component.
- [x] Server-render homepage content and improve entrance focus behavior.
- [x] Improve small-screen navigation and short-screen entrance behavior.
- [x] Add keyboard tab associations and lazy-load feature modules.
- [x] Optimize portfolio/research images with intrinsic dimensions.
- [x] Add route metadata, admin noindex, and baseline security headers.
- [x] Centralize Court Vision model/date/bucket definitions.
- [x] Align Spotify setup restrictions and add regression tests.
- [ ] Complete browser visual and interaction verification when the browser host is available.

### Increment 2 — Reliability and authorization

- [x] Resolve baseline chess ref/dependency errors and JSX escaping errors.
- [x] Resolve the remaining admin effect-driven loading error and Spotify image warnings.
- [x] Verify the live Lichess response, validate solutions, support PGN fallback, and observe the board after it mounts.
- [x] Add keyboard move entry, accessible game feedback, and engine reconnect controls.
- [x] Inspect available hosted storage metadata, table contracts, and anonymous/privileged read visibility.
- [ ] Inspect the complete RLS/storage policy definitions and prove owner-only write enforcement. Connector access was denied.
- [x] Make upload identity and draft saving recoverable, validate publishing, and retain a draft reference during deletion failures.
- [ ] Verify authenticated upload/publish/delete interactions with disposable media in a controlled environment.
- [ ] Establish private draft-file delivery and media captions. The existing bucket is public.
- [x] Bound Spotify requests, add caching and rate-limit handling, and preserve Monday 00:00 UTC reporting.
- [x] Introduce shared loading, empty, error, and success feedback.
- [x] Add lifecycle, publication, Spotify, puzzle, and real-engine regression coverage.

### Increment 3 — Central dashboard

- [x] Extract admin authentication and Court Vision editor modules during Increment 2.
- [x] Add The Studio at `/studio` with an authenticated layout and preserved legacy Court Vision routing.
- [x] Define schemas for research, experience, gallery, notes, and Extras, and prepare a migration for review.
- [ ] Review and apply the proposed Studio schema in a controlled environment, then enable the Supabase content adapter.
- [ ] Import existing content with preview/diff verification.
- [x] Add local draft editing, private preview, review state, validation, media references, and publication export.
- [ ] Connect new content publication to the reviewed database schema and public portfolio rendering.

### Increment 4 — Persistent CMS and publication architecture

- [x] Replace runtime filesystem persistence with a JWT-scoped Supabase repository.
- [x] Prepare owner RLS, atomic draft/publication operations, immutable history, recovery, and private media migrations.
- [x] Implement publication confirmation, unpublishing, archive/trash/recovery, media upload/management, public snapshots, and cache invalidation.
- [x] Prepare deterministic private seeding and preserve source content during staged cutover.
- [x] Add isolated PostgreSQL migration/RLS/publication tests and SDK/session regressions.
- [ ] Approve migration activation after hosted preflight and disposable Supabase verification.
- [ ] Verify live owner sessions/uploads and desktop/mobile interaction after activation.

### Increment 4.1 — CMS verification and activation preparation

- [x] Audit CMS authorization, sessions, publication, revision recovery, media validation, and provider deadlines.
- [x] Correct session/account-switch races, upload reconciliation, stale unpublication tokens, and targeted content retrieval.
- [x] Expand isolated PostgreSQL, SDK, transport, and upload/session regression coverage.
- [x] Prepare read-only preflight, reviewed migration checksums, and beginner connection/backup instructions.
- [ ] Obtain hosted catalog access, validate real Auth/Storage in staging, and rehearse backup restoration.
- [ ] Complete desktop/mobile and keyboard browser acceptance tests when the browser host is available.
- [ ] Obtain explicit approval before live migration activation. No visual redesign or deployment is included.

### Increment 4.2 — Backup, staging and activation preparation

- [x] Create encrypted local application-row, source/Git/assets and Storage-media archives.
- [x] Verify archive authentication, per-file checksums, private-folder permissions, source/media recovery and isolated application-row recovery.
- [x] Prepare a dedicated loopback Supabase configuration and exact migration copies.
- [x] Validate migrations against broad production-style default grants in isolated PostgreSQL.
- [x] Prepare real Auth/Storage/application acceptance scripts, recovery instructions and a separate legacy security plan.
- [ ] Complete a full PostgreSQL dump and schema/Auth/configuration recovery rehearsal with private database authentication.
- [ ] Start the real local stack after a container runtime becomes available, then run Auth/Storage/application and browser acceptance.
- [ ] Obtain explicit approval before live activation.

### Increment 5 - Biology in Motion

- [x] Consolidate public design tokens, typography, layout, navigation and responsive styles.
- [x] Build a reusable session-aware SVG motion system with reduced-motion and skip controls.
- [x] Implement portrait, mitochondrion, translation, neuron, mitosis, ECG and branching studies.
- [x] Refine homepage, research, biography, experience, leadership, gallery, Extras, Listening Room, chess, Court Vision, Journal and Studio.
- [x] Self-host the established font families and preserve the original media.
- [x] Add content, scientific accuracy, contrast and motion regression checks.
- [x] Inspect responsive browser layouts and address the observed image/streaming issues.
- [ ] Complete a measured Lighthouse/Web Vitals and screen-reader acceptance pass.
- [ ] Confirm the canonical public origin before adding canonical URLs, sitemap, robots configuration and social cards.
- [ ] Finish the separate CSP compatibility review for Supabase, Spotify, Lichess and Stockfish workers.
- [ ] Resume database backup/staging/activation gates in a separately authorized increment.

## Verification log

Run commands inside `kondwani-portfolio`. On Windows PowerShell, use `npm.cmd` because the installed `npm.ps1` is blocked by the machine execution policy.

| Check | Baseline | Foundation increment |
| --- | --- | --- |
| Production build | Pass | Final build passes with all ten static pages generated. |
| TypeScript | Pass | Pass after shared-model extraction and tests. |
| Automated tests | No suite | Eight Spotify authorization regression cases pass using Node 24's native TypeScript support. |
| ESLint | 46 errors, 122 warnings | Vendored Stockfish excluded. One existing admin effect-driven loading error and two remote Spotify image warnings remain. |
| Browser | Unverified | Browser access host returned unavailable. Visual layout, dialog interaction, gameplay, and responsive rendering require a browser pass. |
| Hosted mutations | Unverified | Login, upload, publish, and delete have source-level review only. |

The final production HTTP smoke check returned 200 for `/`, `/research`, `/extras`, and `/extras/court-vision-admin`. It verified main landmarks, optimized research-image URLs, security headers, and admin noindex metadata. Both Spotify setup endpoints returned 404 in production mode as intended.

The sandboxed Spotify history check initially returned 503 because the server's outbound Supabase request failed with `EACCES`. After approval for a network-enabled local preview, the same integration returned 200 with five tracks and 39 weekly plays. This verifies the existing token-storage/provider/read-response path. The owner authorization flow and authenticated video mutations still require interaction testing.

Admin calendar dates are initialized after asynchronous session lookup, preserving visit-time dates under Cache Components prerendering. The final build verifies this framework constraint.

Node may print a module-type detection warning for native TypeScript tests. The build also detects the parent directory's unrelated lockfile and warns that it is outside the active repository. Both are tooling follow-ups.

### Local environment contract

The browser requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Server Spotify integration also uses `SUPABASE_SECRET_KEY`, `SPOTIFY_CLIENT_ID`, and `SPOTIFY_REDIRECT_URI`. Keep values in ignored local environment configuration. Privileged credentials belong exclusively in server-only modules. This audit used source references and build behavior without printing environment values.

### Repeatable checks

```sh
npm run typecheck
npm test
npm run build
npm run lint
```

For browser QA, test desktop, 390px, 320px, short landscape viewports, 200% zoom, keyboard navigation, and reduced motion. Check the homepage with JavaScript disabled, direct research/hash links, each Extras channel, both chess modes, and the signed-out admin page. Authenticated workflow checks need a controlled test environment and disposable media.

## Increment 2 implementation and verification

Completed locally on `portfolio-v2` on November 15, 2026. Earlier audit findings and the foundation verification table describe the starting state. This section records the current implementation.

### 007 — Reusable Court Vision administration

The existing admin URL remains the entry point. Its page composes `AdminLogin`, `VideoUploadForm`, `VideoLibrary`, and `SessionEditor`. `useCourtAuth` validates the current user with Supabase Auth, responds to session changes, and initializes calendar dates after asynchronous session lookup. The existing owner UUID remains compatible with the current account.

`lib/court-vision-repository.ts` owns dashboard queries and mutation adapters. `lib/video-lifecycle.ts` provides testable upload-finalization, publication, and deletion workflows. Dashboard requests abort on unmount or replacement, ignore obsolete responses, and keep existing data available during refresh. Browser Supabase requests have a 15-second deadline, and database lifecycle operations have an additional overall deadline.

Pickup-session submissions retain an operation UUID during retries and reconcile ambiguous insert responses against the saved row. A pending submission keeps its original date and location so an edited retry cannot silently discard changes or create a duplicate.

The browser's owner check supports the administrative interface. Hosted table and storage policies remain the authoritative enforcement boundary. The implementation adds no privileged browser credentials.

### 008 — Recoverable uploads and media operations

An upload receives a stable UUID and storage path before transfer. A browser journal connects that identity to the owner and selected file's name, size, and modification time. Only identifiers and file metadata are persisted. A current-tab fallback supports retries when browser storage is unavailable. A matching journal allows recovery across reloads when storage is available.

TUS uses an owner/object-specific fingerprint and matches previous upload metadata and origin before resuming. Each outgoing request obtains the current access token. Six-MiB chunks, bounded retries, a 60-second request watchdog, pause/unmount cleanup, and upload progress support slow or interrupted transfers. A completed stored object is checked for its expected size and reused after a metadata-save failure.

Draft insertion uses the stable UUID. An ambiguous insert is reconciled by reading that ID before retrying. A completed draft is preserved on retry, including any publication change. A metadata failure retains the file and journal so the user can finish saving it. The application no longer deletes a file as an unchecked response to an ambiguous insert error.

Publication re-reads the row, rejects stale editor state, checks that the file exists, and uses a conditional update that confirms a row was changed. Deletion unpublishes first, removes the file, then conditionally deletes the draft row. Storage failure preserves the draft and path. A failed final row deletion can be retried after the object is already gone. Per-video locks prevent duplicate button actions, and Web Locks coordinate supported tabs in the same browser.

Storage and database operations span separate services. Cross-device races and a permanent reconciliation ledger still need a reviewed backend transaction/RPC or job design. Authenticated media mutations were tested with an in-memory gateway. Live media records were inspected through reads.

The existing public bucket means a draft file can be opened with its object URL. The upload form now explains that distinction. Private draft delivery requires coordinated bucket/policy and media-URL changes. Bucket MIME/size restrictions and caption support remain outstanding hosted/media work.

### 009 — Spotify request and cache boundaries

`lib/spotify-history.ts` separates provider loading, ranking, and caching from the route. A single 20-second signal bounds token lookup, token rotation persistence, and up to ten history pages. Token replacement uses a conditional update against the previous refresh token to avoid overwriting a newer connection. All upstream failures, including pagination failures, produce a controlled response instead of a partial weekly chart.

The process-local cache shares an in-flight refresh among concurrent requests, keeps successful summaries fresh for 60 seconds, and can return a labeled stale summary for up to 15 minutes during a provider failure. It honors numeric and HTTP-date `Retry-After` values, suppresses repeated calls during cooldown, and resets at the UTC week boundary. Cached data contains only the public weekly summary. Healthy responses allow up to 60 seconds of shared HTTP caching, capped at the end of the week. Stale and error responses use `no-store`.

The client has a 25-second deadline, retry feedback, and a stale-history message. Spotify artwork uses `next/image` with direct CDN delivery and intrinsic dimensions through `unoptimized`, resolving ESLint warnings while keeping the existing provider image URLs. Caches and request coalescing are scoped to each running server process. Cross-instance coordination remains future work.

Spotify rate-limit handling follows the provider's retry guidance. [Spotify rate-limit documentation](https://developer.spotify.com/documentation/web-api/concepts/rate-limits)

### 010 — Dedicated channel routes and reusable feedback

`lib/extras.ts` holds the existing channel descriptions and entries. `ExtrasView` renders the directory and the selected channel. `/extras/chess`, `/extras/basketball`, `/extras/wordplay`, and `/extras/archives` support direct links, refresh, and browser history through Next.js Link navigation. The existing static admin route retains precedence over the dynamic channel segment. Heavy interactive channel modules retain deferred loading.

Unknown channels render a not-found state and noindex metadata. With the current Cache Components streaming behavior, an unknown channel can return HTTP 200 after streaming begins. The HTTP regression check verifies its indexing exclusion.

`Feedback` supplies shared loading, empty, error, and success states with appropriate live-region semantics. Admin forms, dashboard refresh, channel loading, Spotify failures, and Court Vision read failures reuse it. Public session-read failures now appear as errors instead of an empty session history.

### 011 — Chess reliability and keyboard access

The live Lichess response includes FEN, PGN, initial ply, and a five-move solution. The retrieved solution was replayed successfully. `normalizeDailyPuzzle` validates FEN payloads and supports PGN-derived positions at `initialPly`. Daily requests have a 15-second deadline, and board resize observation follows the conditional board mount. Both boards can shrink below their former 240px minimum.

`ChessMoveEntry` allows keyboard moves using starting/ending squares and optional promotion letters. The same move handlers serve dragging and form submission. Stockfish has startup/search deadlines, reconnect feedback, a search-position guard, and worker/timer cleanup. New games send `ucinewgame`. Actions are disabled while the engine is unavailable or searching.

The actual bundled JavaScript/WASM engine passed a Node UCI handshake, legal opening moves for both colors, and a new-game reset. Browser worker execution and mobile gestures still require an available browser session.

### Hosted read-only inspection

`scripts/inspect-integrations.mjs` reads the existing environment configuration in memory and prints selected schema/bucket metadata and row counts. It also fetches and validates the public daily puzzle. It performs no table, schema, bucket, or policy writes.

| Inspection | Observed result |
| --- | --- |
| Supabase connector project discovery | No accessible projects returned. |
| `pg_policies` inspection through the connector | Denied with “You do not have permission to perform this action”. |
| `hoops_bucket` | Public, with null bucket-level file-size and MIME restrictions. |
| `court_videos` contract | UUID primary key, existing title/date/location/path/publication fields confirmed through OpenAPI. |
| `hoop_sessions` contract | UUID primary key and existing date/location fields confirmed through OpenAPI. |
| Published video reads | One row visible to both anonymous and privileged clients. |
| Draft video reads | Zero rows for both clients. This cannot prove draft filtering because no draft rows exist. |
| Session reads | Zero rows for both clients. |
| Spotify token visibility | Anonymous count zero, privileged count one. Token values were excluded from inspection output. |

Full policy verification requires read access to the project's policy catalog. The outstanding inspection should cover `pg_class.relrowsecurity`, `pg_policies` predicates and roles, grants on the three public tables, and `storage.objects` policies restricted to the expected bucket and owner. The denied query was limited to policy definitions for `hoop_sessions`, `court_videos`, `spotify_tokens`, and `storage.objects`. Owner-only insert/update/delete permissions remain unverified.

### Increment 2 checks

| Check | Result |
| --- | --- |
| ESLint | Clean, with zero errors and zero warnings. |
| TypeScript | Pass. |
| Production build | Pass with the four channel URLs generated. |
| Regression suite | 33 tests covering authorization, puzzle normalization/promotion, bundled Stockfish, Spotify ranking/cache/coalescing/timeouts/rate limits, draft recovery, publication checks, and deletion failures. |
| HTTP smoke | Eight public/admin/channel pages returned 200, production Spotify setup returned 404, and both engine assets returned 200. |
| Live Spotify | Five simultaneous requests returned five tracks with the same update timestamp and fresh-cache state. |
| Live Lichess | Response shape and full solution validated. |
| Browser desktop/mobile | Unavailable. Inventory returned no apps or browsers and reported the browser access host unavailable. |
| Authenticated media interactions | Pending a controlled owner session and disposable media. |

Run `node scripts/smoke-test.mjs` against a local production server. `PORTFOLIO_TEST_URL` can select another local preview URL. Network inspection needs access to the configured Supabase project and public provider endpoints. The existing Node module-detection and parent-lockfile notices are separate from the clean ESLint result.

## Increment 3 — The Studio

The Studio is available at `/studio` on the `portfolio-v2` checkout. Its beige workspace, sage navigation, serif headings, and monospaced labels reuse the established design system. Sidebar links open the overview, five content collections, Court Vision, and the media library. Mobile layouts stack the navigation and editor, inputs retain visible focus, and confirmation dialogs use native modal keyboard behavior.

### Increment 2 verification before implementation

Lint, strict TypeScript, all 33 tests, and the production build passed before Studio source changes began. The original HTTP smoke suite passed for eight public/admin/channel pages, both Stockfish assets, and live Spotify requests sharing a fresh summary. Read-only Supabase inspection again confirmed the public video bucket, current table contracts, published video visibility, and anonymous exclusion of the existing Spotify token row. Lichess returned a valid five-move solution.

The connector again returned no accessible projects and denied the `pg_policies` query. The computer/browser inventory returned no apps or browsers and reported the browser access host unavailable. Complete hosted policy inspection, authenticated media interactions, and desktop/mobile browser verification remain unresolved.

### 012 — Server-verified Studio access

`lib/owner.ts` holds the existing owner identity shared by Court Vision and The Studio. The Studio's server layout reads its session behind a Suspense boundary, as required by the installed Cache Components documentation. A signed-out visitor sees the owner sign-in form. Protected pages contain client workspace components whose data comes exclusively through protected Studio endpoints.

The session bridge obtains the existing browser Supabase access token and exchanges it through a same-origin POST. The server calls Supabase Auth `getUser(token)` and compares the verified identity with the owner ID. Missing, expired, forged, and non-owner identities are rejected. Authorization failures prevent data access, and provider failures produce a controlled unavailable response. An HttpOnly, SameSite Strict, host-only cookie lasts five minutes, uses Secure in production, and is renewed while The Studio is open. Refresh tokens stay in the existing Supabase session implementation.

Every content, media, export, and session endpoint verifies authorization independently. Studio mutations check the browser Origin against the externally addressed request host and protocol. Tests cover loopback hostname normalization and HTTPS forwarding. Responses carrying Studio data use `Cache-Control: no-store`. The Studio inherits noindex metadata. Sign-out clears the Studio cookie and the local Supabase session.

Authorization uses verified user identity and the configured owner ID. User-editable metadata supplies no authorization decision. The implementation follows the provider's verified-user API. [Supabase getUser documentation](https://supabase.com/docs/reference/javascript/auth-getuser)

### 013 — Functional local drafts while the schema awaits review

New research, experience, gallery, personal-note, and Extras entries save through the owner-protected content API into `.studio/drafts`. This directory is ignored by Git. It contains working content and should remain on a private, durable local filesystem. The choice permits working editors and previews during database review.

The filesystem adapter validates collection fields, IDs, slugs, content lengths, media references, and workflow state. Each save uses a revision predicate, an exclusive entry lock, a flushed temporary file, and an atomic rename. Concurrent or stale editors receive a conflict instead of replacing a newer revision. Failed validation preserves the previous entry. Tests use isolated temporary directories and verify their paths before cleanup.

The editor supports title, slug, summary, body, collection-specific fields, and media references. Research includes institution, mentors/collaborators, and methods. Experience includes organization, role, and dates. Gallery includes accessible image description, location, and date. Notes include a topic. Extras entries select from the existing channel IDs.

The workflow is draft → private preview → ready for review → saved-entry JSON export. Readiness validates the required text and gallery media description. Previews render escaped text and referenced media. Confirmation dialogs cover readiness and switching away from unsaved edits. Main sidebar navigation, sign-out, and browser close/reload warn about unsaved work. Export packages include the saved revision and resolved media references. An unavailable media reference prevents an incomplete export.

Public portfolio content continues to use the current source pages. New Studio exports require review and an approved storage/rendering adapter before they become public. Existing research, biography, experience, Extras descriptions, and media were preserved. Importing that source content into managed entries remains a separate preview-and-diff task.

### 014 — Shared Court Vision and media architecture

`CourtAdmin.tsx` contains the reusable Court Vision dashboard. The original `/extras/court-vision-admin` page wraps it for compatibility, and `/studio/court-vision` embeds its upload, video library, and session editor under the Studio layout. The Studio shell owns its sign-out control. Court Vision's browser mutations retain their existing Supabase session and policy requirements.

`studioMediaCatalog` reads actual portfolio image assets and Court Vision video records. The media library supports title/filename search, image and video previews, and opening originals. The existing Court Vision uploader remains the entry point for new videos. Content entries reference catalog IDs, and the server validates those references when saving. Static-image previews use responsive Next.js image optimization. A failed video query produces an unavailable state for its count and library source.

The overview derives local draft and review counts from saved entries and video counts from actual query results. Unavailable values display an em dash with feedback. No placeholder activity or invented statistics are generated.

### 015 — Review-only database migration

The official Supabase CLI generated `supabase/migrations/20261115213550_studio_cms_review.sql`. Its contents are proposed SQL for review. The migration has not been applied, and no project was linked by the generation command.

The proposal creates private entry, media, and entry/media-reference tables and a separate publication-snapshot table. Owner predicates use the existing owner UUID and `auth.uid()`. Anonymous access is limited to publication snapshots. An invoker-security publication function locks the expected revision, checks readiness and public-media approval, then writes the snapshot atomically. Existing Court Vision tables, storage configuration, and production policies are outside this migration.

Before activation, inspect the hosted catalog, validate collisions/grants and RLS with owner/non-owner sessions in a controlled database, review media privacy, and test publication/unpublication transactions. Then implement the Supabase adapter, map local media IDs to managed records, import approved drafts, and connect public reads to snapshots. The Studio currently exposes export-for-review controls for new collections. Court Vision retains its established live publication controls.

### Increment 3 verification and outstanding work

| Check | Result |
| --- | --- |
| Increment 2 baseline | Lint, TypeScript, 33 tests, production build, provider reads, and HTTP smoke passed before Studio work. |
| Studio regression suite | 41 tests pass, including verified-owner access, denied sessions/origins, host/proxy handling, collection validation, atomic saves, concurrent creation, revision conflicts, and collection immutability. |
| ESLint | Zero errors and zero warnings. |
| TypeScript | Pass. Route types were regenerated after introducing Studio routes. |
| Production build | Pass with Studio layouts, collection pages, Court Vision/media pages, and protected APIs. |
| Signed-out HTTP checks | All Studio routes show the access gate and noindex metadata. Studio data APIs and unauthenticated writes return 401. |
| Forged token/origin checks | Covered by unit and HTTP regression checks. Failed exchanges issue no session cookie. |
| Browser desktop/mobile | Unavailable because the browser access host could not connect. |
| Owner sign-in/editor interaction | Logic and persistence tested independently. A live authenticated browser pass remains pending. |
| Proposed migration | Generated and reviewed as source. SQL execution and hosted policy tests remain pending approval and database access. |

The native Node module-detection notices and the unrelated parent-lockfile warning remain tooling follow-ups. No application dependencies were added for The Studio. The Supabase CLI was fetched for local migration generation.

The local filesystem adapter is a foundation for this checkout. A persistent database adapter is required before hosting The Studio on an ephemeral filesystem. A process crash during a save may leave a lock or temporary file. Preserve the JSON entry and confirm no save process is active before recovering such a lock. Browser Back/Forward and fully authenticated mobile interactions still need interactive verification. Existing public-bucket draft privacy, media captions, and cross-device Court Vision reconciliation remain open from Increment 2.

Final production HTTP verification passed for all sixteen expected portfolio and Studio pages. The four Studio data/session/export GET endpoints and an unauthenticated content PUT returned 401. A foreign-origin session exchange returned 403. A same-origin forged-token exchange returned 401 and issued no cookie. Five simultaneous live Spotify requests shared a fresh summary, and both Stockfish assets returned 200. The final build, standalone TypeScript check, and lint completed successfully. `git diff --check` passed, and both `.studio` drafts and Supabase CLI temporary files are ignored by Git.


## Increment 4 — Persistent CMS and publication architecture

This section supersedes Increment 3's local filesystem adapter and export-only publication limitations. No live database changes have been applied. The activation review and content preservation procedure are in [STUDIO_MIGRATION.md](STUDIO_MIGRATION.md).

### Increment 3 audit baseline

Before implementation, lint completed with zero errors/warnings, strict TypeScript passed, all 41 existing tests passed, and the production build passed. Auditing identified the runtime filesystem dependency, absent database persistence/publication integration, an ignored Supabase sign-out error, and a possible cookie renewal/sign-out race. Those implementation gaps are addressed below. Hosted policies and authenticated browser flows were previously unverified and remain activation requirements.

### 016 — Persistent draft adapter and verified database identity

`studioStore` now creates a Supabase repository using the verified owner's JWT and the publishable key. CMS writes go through database RLS. No production request imports or calls the filesystem draft store. That adapter remains only for historical offline tests; the seed preparation tool reads existing private local files explicitly. Static asset discovery uses filesystem reads only.

Missing tables/functions produce a controlled 503 setup message. Editors disable creation when the database collection cannot load; they never claim that a local file saved successfully. Existing public content continues to render independently. The application is implemented for the reviewed schema and awaits its approved activation.

Mutations validate input, same-origin browser requests, and expected revisions. Atomic database functions lock the current entry and prevent stale overwrites. The repository handles PostgREST's one-to-one publication relationship as an object and supports array-shaped test/provider representations. Owner validation is reused within each content request rather than repeated for every dependent query.

### 017 — Publication, history, and recovery

Private working documents and public snapshots are separate records. The Studio supports saved-revision publication with confirmation, unpublication, archive, recoverable trash, reactivation, and restoring a historical version into a new draft revision. Revision triggers record changes, including authorized direct database edits. API roles cannot modify history or hard-delete entry/media rows. The history UI displays the latest 100 revisions, with older revisions retained.

Preview renders escaped editor content and owner-protected uploaded media. Confirmations explain publication visibility, recovery, and the short lifetime of issued media links. Inactive entries disable editing until recovered. Collection entries can be reopened to reload a changed revision after a conflict. Feedback keeps unsaved content available when a request fails.

Publications render through anonymous, published-only queries on the homepage, research page, Extras, `/journal`, and `/journal/[kind]/[slug]`. Legacy source-controlled content remains intact. New content is additive; imported legacy sections require a reviewed cutover before publication to avoid duplication. Shared tagged caches expire after successful transitions, with page-path revalidation. The installed Cache Components API requires runtime parameter access behind Suspense; the journal detail route follows that pattern.

### 018 — Reusable private media library

The Studio accepts private images, PDFs, and short videos up to 50 MiB, using direct signed Storage uploads and server-side object metadata verification before finalization. The browser can retry transfer/finalization without creating a second registered asset. Existing Court Vision upload and video/session administration are preserved. Static images and Court Vision clips are registered by reference, preserving their original files and IDs.

Uploaded media can be renamed, moved to recoverable trash when unused, and recovered. References in drafts, revisions, or publications block removal. Private originals are retained. Abandoned unfinalized uploads require a reviewed reconciliation/cleanup operation; no automatic destructive cleanup is introduced.

Owner previews use authenticated redirects. Public file delivery checks a current publication through the anonymous client before signing the corresponding private object with server-only credentials. It grants no draft access. Issued links expire after 60 seconds; previously downloaded files cannot be recalled. Uploaded images bypass image-optimizer caching. The existing public Court Vision bucket remains a separate unresolved legacy privacy issue.

### 019 — Session and interface reliability

Studio cookie changes now use a serialized browser queue. Signing out stops renewals before clearing the cookie, checks the Supabase sign-out result, and refreshes the server gate. Every CMS endpoint independently verifies the owner; direct unauthorized requests fail before reading or mutating data. Expired sessions are rejected by verified Auth checks and the existing session implementation owns refresh tokens.

New forms use labeled fields, native controls, reusable feedback, native dialog confirmations, and 44px controls. Publication/media panels wrap at the existing mobile breakpoints. Beige, sage, serif, and monospaced design tokens remain in use. React component review checked hook ordering, escaped content, server/client boundaries, and protected media cache behavior. Interactive keyboard and mobile verification remains pending browser access.

### 020 — Migration and seed review

The official Supabase CLI generated `20261115220705_studio_persistence_publication.sql`. Both it and the Increment 3 migration are required, in order. The second migration adds the canonical document, history, atomic RPCs, private bucket, media management, and idempotent private seed import. It backfills any existing Increment 3 documents/media references before recording history. Existing production tables, policies, and objects are untouched by these proposed files.

`node scripts/prepare-studio-seed.mjs --write` generated an ignored local review package with five source sections and zero local drafts in this checkout. It retains exact source fragments, stable IDs, checksums, and flags dynamic expressions. It makes zero network/database writes. Imports always begin as private drafts and matching seed keys never overwrite existing edits. Editorial review is required before imports and before replacing any legacy section.

### Increment 4 verification results

Final verification results are recorded below after the complete suite. Supabase catalog inspection was attempted read-only: the connector returned no accessible projects and denied the `pg_policies` query. No migration was applied. Browser inventory found a Chrome window but no browser connector host. Native window access first returned unavailable accessibility state, then stopped because it could not establish the current URL confidently enough to enforce its policy. No desktop/mobile visual or authenticated browser pass is claimed.

| Check | Result |
| --- | --- |
| Increment 3 audit baseline | 41 tests, lint, TypeScript, and production build passed before Increment 4 changes. |
| Final automated suite | **46 tests pass**, zero failures/skips. Includes real isolated PostgreSQL migration/RLS/publication/recovery/private-storage tests, deterministic seeding, SDK JWT/CAS/error mapping, upload validation, and cookie-renewal/sign-out ordering. |
| ESLint | Zero errors and zero warnings after the final code changes. |
| Strict TypeScript | Pass, including all new routes, components, and regression tests. |
| Production build | Pass, 30 generated pages. A clean rebuild resolved a Windows/OneDrive EPERM while deleting generated `.next` output; only the verified build-cache directory was removed. |
| Public HTTP checks | Homepage, research, Extras and its four channels, legacy administration, and journal return 200. Unknown channels/publications return 404 or streamed noindex not-found responses. |
| Studio HTTP checks | All eight Studio pages show the signed-out gate. Existing protected APIs plus six new history/action/upload/media/private-file request cases return 401 with no-store. Foreign origins return 403; forged token exchange returns 401 without a session cookie. |
| Sign-out HTTP checks | Same-origin DELETE returns 200 and clears the HttpOnly, Secure, SameSite Strict cookie with Max-Age=0. Foreign-origin DELETE returns 403. |
| Public media privacy | A nonexistent/unpublished object returns 503 while the schema is unavailable and issues no signed redirect. PostgreSQL tests separately verify that only an approved media reference can enter a publication. |
| Integrations | Five concurrent Spotify responses share fresh data; both Stockfish assets return 200 and real UCI/position tests pass; live Lichess data normalizes to a valid five-move puzzle. |
| Supabase read-only visibility | Existing public video bucket and table contracts confirmed. Anonymous reads exclude the existing Spotify token row. Hosted catalog/RLS inspection remains denied. |
| Dependency audit | Production dependencies: zero known vulnerabilities. Full audit: seven moderate lint-toolchain advisories remain through typescript-eslint/minimatch. Compatible `npm audit fix --ignore-scripts` updated 13 packages but did not resolve that version range. No forced major override was introduced. |
| Seed review | Five source sections, zero local drafts, zero database writes. Review output remains ignored by Git. |
| Browser desktop/mobile | Blocked by browser-host/native URL verification access. No visual, keyboard, real-owner, or mobile end-to-end pass is claimed. |

The build deliberately tolerates unavailable/unapproved publication tables by keeping legacy content available. Restricted build-time network access produced sanitized publication-unavailable notices. Native Node module-detection notices and the unrelated parent-lockfile warning remain tooling follow-ups. The new PGlite dependency is development-only and runs isolated PostgreSQL tests without a hosted service.

Outstanding activation work: authorized hosted catalog inspection; disposable Supabase Auth/Storage integration tests; approval and application of both migration files; reviewed private content import; a per-section legacy-content cutover before publishing imported sections; real owner refresh/expiry/sign-out/upload flows; desktop/mobile and keyboard browser verification. Existing public-bucket Court Vision privacy, retention/purge and orphan-upload reconciliation, and large-collection pagination remain follow-ups. Application APIs do not run destructive cleanup. No migration, policy change, production deployment, or main-branch modification occurred.

## Increment 4.1 — CMS verification and database activation preparation

Completed on `portfolio-v2`. Live activation remains pending. The current audit is in [STUDIO_VERIFICATION.md](STUDIO_VERIFICATION.md), and beginner-friendly project connection, backup, restore-rehearsal and approval instructions are in [STUDIO_ACTIVATION_GUIDE.md](STUDIO_ACTIVATION_GUIDE.md). These supplement the migration procedure above and supersede earlier account-exchange and unpublication behavior descriptions.

### Findings resolved

1. Same-origin rejected session exchanges now clear any previous owner cookie. Foreign-origin failures do not change cookies, preserving CSRF protection. Provider outages return unavailable feedback without clearing valid credentials.
2. Session renewal checks cancellation after browser session lookup and again before dispatch. A queued or late renewal cannot run after sign-out. Failed sign-out resumes verification, and failed expired-session closure is surfaced.
3. The proposed unpublish transaction now advances the draft revision and resets readiness. A stale publish token cannot undo an unpublish. This change remains SQL source only until approval.
4. Upload retries reconcile object presence after any transfer response, including HTTP 400 duplicate responses. Metadata retries retain completed transfer state and the original ticket. Server metadata checks are reused for finalization and publication.
5. Publication verifies uploaded objects still exist with an allowed MIME type and size. Archived assets are rejected by the application and proposed publication function. Draft attachment checks lock media against concurrent archiving and reject missing/invalid media arrays.
6. Single-entry lookup now queries by indexed ID rather than searching a collection response subject to Supabase's result cap.
7. Shared bounded server fetch preserves caller cancellation and adds deadlines to privileged media reads/signing. Save validation no longer repeats catalog work; upload metadata queries/approvals are batched and object inspections run concurrently.

No redesign, new application dependency, live schema/policy change, or deployment was performed. Existing personal content and integrations remain in place. The second, still-unapplied migration was corrected in place. [STUDIO_MIGRATION_REVIEW.json](STUDIO_MIGRATION_REVIEW.json) records the exact current file checksums for re-review. An environment that already applied a prior version would require a newly generated forward migration instead.

### Verification results

| Check | Increment 4.1 result |
| --- | --- |
| ESLint | Pass, zero errors/warnings. |
| Strict TypeScript | Pass after the final application changes. |
| Full automated suite | **50 passed**, zero failures/skips. Four new test cases plus expanded existing assertions cover upload retry, cancellation/deadlines, stored-object validation, targeted reads, session queues, legacy coexistence, archive/readiness, and stale unpublication tokens. |
| Database behavior | Both migrations execute in order against isolated PostgreSQL. Owner/non-owner/anonymous access, private storage, immutable history, publication isolation, recovery, trash/reactivation, archive, unpublish conflicts, seed idempotency, and legacy fixture preservation pass. |
| Preflight SQL | The explicitly read-only [studio-preflight.sql](../scripts/studio-preflight.sql) executes against the isolated fixture and gathers catalog/bucket/grant metadata without selecting content or credentials. |
| Production build | Pass, 30 generated pages, including final session-cookie changes. |
| Production HTTP suite | Pass for existing portfolio pages, all eight Studio gates, journal/not-found behavior, protected APIs, six new persistence/media request cases, foreign-origin rejection, forged credentials, unreferenced media denial, and cookie closure. Rejected same-origin exchanges now issue only an expiring cookie; cross-origin exchanges issue none. |
| Public photographs/posters | All eight public media files return 200 to HEAD requests with matching byte sizes. No file bodies downloaded. Repeat with `node scripts/verify-public-assets.mjs`. |
| Court Vision | Published video metadata remains readable anonymously; one existing published video returns 200 to an anonymous HEAD request. Existing table contracts remain valid. No live video/session edits or uploads were made. |
| Spotify | Five concurrent requests share a fresh summary. The current UTC reporting week returned zero tracks, an accepted empty state. Token rows remain absent from anonymous reads. |
| Chess | Bundled Stockfish UCI, legal reply and reset tests pass; both engine assets return 200. Live Lichess returns a valid five-move puzzle. |
| Production dependency audit | Zero known vulnerabilities. |
| Full dependency audit | Seven moderate development-tool advisories remain through typescript-eslint/minimatch; no high/critical findings. No forced major dependency override was applied. |
| Hosted catalog/advisors | Blocked. Project listing returns an empty array; policy inspection and security-advisor calls are denied. No live-policy certification is claimed. |
| Desktop/mobile browser tests | Blocked. The current browser inventory reports that the browser access host is unavailable. A detailed manual acceptance matrix is prepared, but no visual/mobile/keyboard pass is claimed. |
| Branch and whitespace | Remains `portfolio-v2`; `git diff --check` passes. |

The tests initially exposed an outdated expectation after unpublishing began resetting readiness. The test now marks the new draft ready before exercising archived-media rejection and separately asserts stale-token failure. The final complete suite passes. Builds retain the existing parent-lockfile warning, Node emits the existing module-detection notices, and restricted build-time publication reads produce sanitized unavailable messages while legacy content stays available.

### Activation blockers and required user actions

1. Confirm the project reference and intended owner account using the activation guide. Reconnect Supabase for that account/organization, preferably scoped read-only to the confirmed project. Do not send credentials or enable write access just to inspect policies. A project-scoped connector may omit account-level listing; an authorized project query is the deciding check.
2. Run/review the read-only preflight and resolve object, migration-ledger, owner, and policy conflicts. Existing permissive Storage policies must be inspected because they can widen access to the proposed bucket.
3. Choose a private backup destination. Create and verify database/configuration backups and separate Storage object copies, then rehearse restoration in an isolated environment. **No live backup or restore rehearsal has been completed here.**
4. Verify real Auth/Storage behavior in staging, including owner/non-owner account switching, expiry/refresh, sign-out races, signed uploads and retries, private previews, all publication transitions and cache invalidation. Isolated PostgreSQL/provider tests cannot replace these checks.
5. Restore browser-host access and complete desktop/mobile, keyboard, zoom and throttled-network acceptance tests. Large-collection pagination, abandoned-upload cleanup/retention, immediate copied-token revocation, and legacy public-bucket privacy remain explicit follow-ups.
6. After those checks, explicitly approve the exact reviewed migration files and target project before live application. Approval to connect or back up does not authorize migration or deployment. Imported legacy sections stay private until a content diff and cutover are reviewed.

Read-only hosted inspection found no unpublished Court Vision rows under either anonymous or privileged reads, so it cannot prove unpublished-row exclusion with current data. The known public bucket also cannot provide private-object guarantees for legacy URLs. Neither issue was masked by changing existing production policies. New Studio draft/media privacy is demonstrated locally and still requires hosted validation before activation.

### Reconnected hosted preflight — 2026-11-16 UTC

The user reconnected Supabase and authorized read-only inspection. Project listing, API URL lookup, catalog queries, migration listing, and security/performance advisors now succeed. The access blocker recorded earlier is resolved.

| Item | Observed result |
| --- | --- |
| Project | `kondwani's Project`, reference `zpdebvrdourervijfnpd`, region `us-west-2`, `ACTIVE_HEALTHY`. |
| API identity | Connector URL and local configured hostname both match `zpdebvrdourervijfnpd.supabase.co`. |
| Database | PostgreSQL 17.11, provider release `17.11.0.011`. Connector SQL executes as `postgres`. This inspection used catalog SELECTs and a rollback-only read-only transaction. |
| Owner | The configured UUID exists, its email is confirmed, and the account is neither anonymous nor deleted. The same UUID appears in application authorization, Court Vision write policies, and proposed Studio constraints/policies. |
| Existing schema | `court_videos`, `hoop_sessions`, and `spotify_tokens` have RLS enabled. Court Vision/session columns, defaults, primary keys and existing constraints match the application's contract. `storage.objects` and `storage.buckets` also have RLS enabled. |
| Studio names | Proposed Studio tables, functions, `studio_internal`, and `studio-media` are available in the inspected catalog. |
| Migration history | `list_migrations` returns an empty list. The `supabase_migrations` schema and its ledger relation are absent. Plan first managed migration initialization during approved activation. |
| Reviewed files | Both migration SHA-256 values match `STUDIO_MIGRATION_REVIEW.json`. SQL files were read for compatibility review. |
| Backup inventory | One Court Vision row, one published video, zero pickup-session rows, one Spotify token row, one Court Vision Storage object. Object metadata reports 4,902,523 bytes. Credentials and content values were excluded from inspection results. |

The initial multi-statement preflight executed successfully, but the connector returned only the final migration-ledger result. Follow-up consolidated SELECTs retrieved the complete schema, policy, grant, function and bucket metadata. All follow-up operations were read-only.

#### Row and Storage authorization

Court Vision INSERT/UPDATE/DELETE policies restrict writes to the configured owner. Its SELECT policy allows published rows and owner access. Pickup-session SELECT is public, and its write policies restrict access to the same owner. UPDATE policies include matching ownership checks. `anon` and `authenticated` have neither superuser nor BYPASSRLS privileges and have no additional role memberships in the inspected catalog. Both lack CREATE permission on `public`. `service_role` has BYPASSRLS as expected for the server-only privileged client.

`spotify_tokens` has RLS enabled and zero policies. API-role row access therefore follows default denial, while the privileged server client remains able to use the token row. The security advisor's informational RLS-without-policy finding matches this server-only design. Keep token material server-side. [Advisor reference](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)

All four existing Storage policies target `hoops_bucket`. Writes require the owner, while the SELECT policy grants all roles access to that bucket's object metadata. The bucket is public and has no configured MIME allowlist or file-size limit. Public file URLs can deliver an object regardless of its corresponding Court Vision row's publication state. The proposed `studio-media` bucket has a distinct name and private, owner-prefixed policies, so the inspected legacy bucket policies do not broaden the proposed bucket's scope. Legacy video privacy requires a separate, approved policy/delivery design if private drafts are desired there.

#### Grants and advisor findings

The legacy public tables grant broad privileges to `anon` and `authenticated`, including TRUNCATE, REFERENCES and TRIGGER. RLS governs row operations. TRUNCATE and REFERENCES fall outside RLS and deserve a separate least-privilege grant review for SQL-capable access. Public-schema function inventory is empty and API roles lack public-schema CREATE permission. This inspection evaluated grants and policy definitions without exercising destructive privileges. [PostgreSQL row-security scope](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)

The security advisor reports disabled leaked-password protection. Provider documentation places that feature on Pro plans and above. Review available Auth controls under the current plan and record the warning during activation review. [Password-security guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

The performance advisor flags four Court Vision policies for per-row `auth.uid()` evaluation. A future approved optimization can use `(select auth.uid())`, consistent with the existing pickup-session and proposed Studio policies. Current inventory is small. [Advisor remediation](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan)

#### Migration compatibility assessment

The inspected catalog presents available object names and matching owner identity for the two proposed migrations. Their statements target Studio objects and a distinct bucket. Existing Court Vision tables, constraints and bucket policy scopes are compatible with that plan.

The project applies broad default table/function privileges in `public`. The proposals explicitly revoke API-role privileges before granting their intended table/function access, then enable owner RLS and public snapshot reads. Verify this behavior again against the actual default privileges in staging. Creation of the first migration ledger and application of both files should follow the chosen migration tool's supported workflow during approved execution. The missing ledger alone does not require a repair operation.

Local migration tests from the earlier verification remain the recorded automated baseline. This task performed hosted read-only inspection and documentation updates. Real owner/non-owner CMS workflows, signed uploads, and publication tests still depend on an isolated schema with real Auth/Storage services.

#### Remaining activation steps

1. Choose a private backup folder outside public/shared project paths. Check Database > Backups in the confirmed project dashboard and record the available backup time and restoration method. The current connector exposes no backup-listing tool, so backup availability and retention remain unverified.
2. Create a logical export where appropriate, covering application data, roles, functions, grants, policies and necessary managed-schema customizations. Preserve Auth/provider configuration privately. Back up local source/assets and `.studio` review files. Preserve the Spotify token row securely.
3. Copy the actual stored video with its bucket/path metadata, and verify its checksum alongside the database exports. Database backups cover Storage metadata separately from object bytes. [Backup coverage](https://supabase.com/docs/guides/platform/backups)
4. Restore and compare the backup in an isolated environment. Validate the exact proposed migrations against the inspected default grants and policy scopes, then exercise real Auth, owner/non-owner access, uploads, previews, publication, recovery, unpublishing and caching.
5. Complete desktop/mobile and keyboard verification when browser access is available. Review the separate legacy public-bucket privacy, broad grants and advisor findings before deciding their follow-up scope.
6. Approve the exact migration files and confirmed target project when ready for live activation. The current authorization covers inspection. Database activation still awaits explicit approval.

The next user action is backup preparation, using the updated activation guide. The database inspection resolved project and catalog access, established policy scope and migration-name availability, and recorded the remaining verification limits.

## Increment 4.2 — Backup, staging and activation preparation

The [activation readiness report](RENAISSANCE_4_2_READINESS.md) records the backup format, recovery commands, staging setup, remaining service dependencies and approval steps. The [legacy database security plan](LEGACY_DATABASE_SECURITY_PLAN.md) separately covers grants, default privileges, Auth settings, policy performance and legacy video delivery.

### Completed backup and recovery work

The private backup directory is `C:\Users\kondw\AppData\Local\ProjectRenaissance\Backups`, outside the repository and OneDrive workspace. Its DACL has protected inheritance and one current-user access rule, confirmed independently after setup. Artifacts use AES-256-GCM with a per-file random key wrapped by Windows DPAPI CurrentUser. Decryption depends on the Windows user profile and its recovery material. A portable/machine-loss recovery arrangement remains part of the backup plan.

`scripts/backup-renaissance.mjs` supports source, application-data and media snapshots. It preserves remote credentials privately in memory, encrypts private data before writing backup artifacts, and prints metadata. `scripts/restore-renaissance.mjs` authenticates/decrypts archives, checks per-file hashes, restores files into a fresh private directory, verifies application JSON rows in isolated PostgreSQL, and can write verification receipts. Source archives use a streamed JSON-lines format to bound memory. Media restore includes bucket/path metadata in `RESTORE_MANIFEST.json`.

| Artifact | Verification |
| --- | --- |
| Initial source snapshot | 283 files and 89,554,265 source bytes, including Git metadata, uncommitted work, public assets, environment files and local draft/staging files. Every file was restored and checksum-verified in a new private directory. Generated `.next` output and `node_modules` are recorded as omissions. |
| Application export | One Court Vision row, zero pickup-session rows and one Spotify token row, plus the API schema. Two matching REST reads checked stability. Decryption and isolated PostgreSQL JSONB recovery passed for both saved records. |
| Media snapshot | One bucket and one video object, with original path, configuration, metadata, size and SHA-256. Decryption and restored-file hash verification passed. |
| Tamper rejection | A separately created corrupted copy failed authentication. Original archives were preserved. |
| Final source refresh | The final documentation/scripts are included in a refreshed source archive. Its private verification receipt identifies the exact hash and file count. |

The application export lacks full PostgreSQL/Auth/schema/configuration coverage. A transaction-consistent database dump and complete schema restoration await database/CLI authentication and appropriate backup tooling. The REST consistency check and JSONB recovery establish serialization/recovery of the saved application records. Auth users/sessions, complete DDL/grants/policies and provider configuration still require the full backup procedure.

The first small export used a direct `.json.dpapi` format. Later artifacts use the documented `.rbackup` format. An ACL setup retry encountered an unavailable Windows security privilege and was corrected to change only the dedicated folder DACL. One PGlite recovery attempt failed under memory pressure, then passed with one WebAssembly compilation task. Approximately 454 MiB free RAM was observed during that check. Source backup/restoration was changed to streaming before the large snapshot was created. Private restored source folders can contain plaintext environment credentials under their inherited current-user ACL.

### Isolated staging and migration validation

The official CLI initialized the ignored `.studio/staging` directory. The prepared project ID is `renaissance-local`, PostgreSQL major version 17, API/database ports 55421/55422, Studio/mail ports 55423/55424 and application port 3102. Staging JWT expiry is 60 seconds for expiry acceptance testing. Default seed execution and analytics are disabled. Both copied SQL files match the reviewed migration hashes. The staging directory has no hosted project link.

Local stack startup was attempted with CLI output captured privately to avoid printing generated keys. It exited with a Docker/container-runtime diagnostic. Docker, Podman, pg_dump and psql commands were absent from PATH, and WSL reported that it is uninstalled. The provider's native runtime supports Linux and Apple-silicon macOS, while Windows uses a container runtime. [Runtime support](https://supabase.com/docs/guides/local-development/docker-and-native-runtimes)

`scripts/test-studio-staging.mjs` prepares real Auth/Storage acceptance against the dedicated loopback API. It covers owner/non-owner accounts, sign-in, refresh, optional expiry, sign-out, RLS, private uploads/signed reads, publication isolation, revision recovery, unpublish conflicts and archive/reactivation. Optional application checks exercise Studio session cookies, content APIs, signed upload finalization, private/public delivery and journal rendering. The script requires local fixture credentials, retains fixtures, and validates the loopback target before writes. `scripts/start-studio-staging.mjs` provides local Supabase settings through a child process environment for the local application. These service-level flows remain unexecuted until the runtime and local keys are available.

The isolated PostgreSQL migration test now reproduces the hosted project's broad public-schema default table/function grants before applying both proposals. It verifies that Studio API roles lack TRUNCATE, anonymous publication execute and history-write privileges after migration, while the existing owner/RLS/publication/recovery tests continue to pass. This expands actual database behavior coverage while real Auth/Storage services remain pending.

### Verification results

| Check | Result |
| --- | --- |
| Full automated suite | 50 passed, zero failures/skips, run serially with one WebAssembly compilation task to control memory. |
| Migration compatibility | Both migrations pass in isolated PostgreSQL with legacy fixtures and production-style defaults. The local staging copies match both reviewed hashes. |
| Lint and TypeScript | Pass after the new backup/staging scripts and recovery-manifest change. |
| Production build | Pass, 30 generated pages. Existing parent-lockfile and sanitized publication-unavailable notices remain. |
| Script syntax | All Node backup, recovery, staging and verification scripts pass syntax checks. |
| Local HTTP smoke | Pass for public pages/channels, all eight Studio access gates, protected content/media APIs, origin rejection, expired-cookie closure, rejected-token cookie clearing, journal/not-found handling and unpublished-media denial. |
| Public assets/integrations | Eight public media files return matching HEAD sizes. Both Stockfish assets return 200 and UCI tests pass. Spotify returns a shared fresh empty-week summary across five concurrent requests. |
| Backup integrity | Source/media file restoration, authenticated decryption, application JSONB recovery, tamper rejection and private ACL verification pass. |
| Browser desktop/mobile | Browser inventory again reports the browser access host unavailable. Interactive acceptance remains pending. |
| Real staging Auth/Storage | Prepared and syntax-checked, blocked by absent container runtime and local keys. |
| Full database restoration | Blocked by unavailable PostgreSQL backup tooling/private database or CLI authentication. |
| Branch | `portfolio-v2`, with whitespace checks passing. |

### Remaining user actions and activation decision

1. Provide a running local container runtime suitable for this personal project without a paid hosted service, or identify an existing isolated environment for the real service tests. The supported local setup is documented in the readiness report.
2. Configure database/CLI authentication locally for the full PostgreSQL export. Keep credentials out of chat and command logs. Complete Auth/schema/configuration backup coverage and a full restoration rehearsal.
3. Supply local staging keys and a repeatable fixture password privately, start the prepared stack/application, and run real acceptance with expiry checks. Restore browser-host access for desktop/mobile/keyboard acceptance.
4. Review the exact migration files, current checksums, backup recovery evidence and service results before granting explicit approval for live activation.

The legacy `hoops_bucket` public-URL privacy issue and broad grants are documented in the separate security plan. Their follow-up requires its own reviewed scope. The current readiness decision is **pending full database recovery and real staging/browser acceptance**. Production interactions in this increment used read operations for backups and verification.


## Increment 5 - Biology in Motion

### Scope and recoverable checkpoint

The creative redesign runs on `portfolio-v2`. The Increment 5 brief defers database activation and container-dependent staging. Existing Studio persistence, owner checks, migrations, source fallback, backups and integration services remain part of the application architecture.

Before editing, the frontend audit indexed the application, libraries, scripts, tests, migrations and documentation in the ignored `.studio/increment5-audit.json`. The encrypted source checkpoint `2026-11-16T01-59-13-332Z-source.rbackup` passed authenticated integrity verification for 284 files. Its SHA-256 is `d34cf1a79353250c0967f5ccea4791455cc634587aa9ef5d337caa82fffd39c6`. The existing private backup and restoration procedures apply.

### Design decisions and implemented surfaces

- Established parchment, paper, sage, deep sage, stone and ink tokens. Added darker sage ink for small text after measuring the requested deep sage at approximately 3.97 to 1 against parchment. Stone and lighter sage serve illustration and decorative roles. Typography retains EB Garamond, Instrument Sans, Courier Prime and Alex Brush. Six Latin WOFF2 faces total 193,644 bytes and are locally hosted with their OFL licenses. Body and editorial families receive framework resource hints. Handwriting appears on the portrait annotation.
- Replaced overlapping global CSS refinements with one responsive editorial stylesheet. Feature styles retain their scope and consume the shared type tokens. Main navigation is shared across the homepage, research, journal and Extras, with a native disclosure menu on narrow screens.
- Reworked the homepage into a portrait-led editorial composition. The inline polaroid and one microscopy study keep the original photograph and handwritten caption. Visitors can navigate and read during the entrance. Existing biography, laboratory experience, professional training, leadership and communities retain their personal facts and wording.
- Research projects use editorial case studies, an anchor index, expandable methods and original-image lightboxes. Native dialogs provide Escape dismissal and focus restoration. Original links remain available before hydration. Full-resolution images load when a lightbox is opened. The quantum-dot result retains its theoretical 2 percent qualification.
- Replaced the gallery placeholder with existing laboratory, symposium and academy photographs, with factual captions and full-size access. Personal photographs and posters retain their original files.
- Reworked the Listening Room into a compact chart and featured-track composition with actual provider counts, artwork, retry and empty states. Extras receives an editorial channel directory, ECG study, paper-and-ink chess treatment and a half-court illustration. Gameplay, video controls and administration remain connected to their existing implementations.
- Journal uses an organic branching study and published entries. Its empty state appears when the publication collection is empty. Public articles retain quiet reading typography. The Studio receives shared typography, paper form surfaces, stronger navigation selection, readable mobile inputs and practical administration spacing.

### Scientific motion architecture

`ScientificFigure` produces server-rendered SVG schematics. `ScientificMotion` adds a finite viewport-triggered enhancement using an IntersectionObserver, a versioned sessionStorage key, CSS keyframes and a 2.4-second completion timer. Each figure runs once per tab session, with a once-per-mount fallback when storage is unavailable. The default server output is fully visible. Skip, reduced-motion preference changes, background visibility and offscreen animation pausing are supported. Cleanup cancels timers and observers. Section heading reveals take 650 ms. No animation package was added.

The visual vocabulary includes mitochondrion/cristae/ATP synthase, translation, a growing neuron, simplified mitosis/cytokinesis, ECG and botanical branching. The translation example uses AUG GCU UUU GGA UAA and Met-Ala-Phe-Gly. Anticodons are explicitly antiparallel and the stop codon has no amino acid or tRNA. ATP synthase heads and ATP are placed on the matrix side. These are labeled illustrative schematics. Scientific references include the NCBI treatments of [RNA to protein](https://www.ncbi.nlm.nih.gov/books/NBK26829/) and [mitochondria](https://www.ncbi.nlm.nih.gov/books/NBK26894/).

### Implementation inventory

Primary files include `app/globals.css`, `app/motion.css`, `app/layout.tsx`, `app/page.tsx`, `app/research/page.tsx`, `app/journal/page.tsx`, `app/components/ScientificMotion.tsx`, `ScientificFigure.tsx`, `SiteNavigation.tsx`, `PortfolioEntrance.tsx`, `ImageLightbox.tsx`, `PublishedCollection.tsx`, `SpotifyListeningRoom.module.css`, `lib/motion.ts`, `app/fonts`, `app/extras/ExtrasView.tsx`, `CourtVision.tsx`, `editorial-extras.css`, the scoped Extras styles, `app/studio/studio.css` and `tests/editorial.test.ts` with its original-content fixture. Package dependencies are unchanged.

### Verification in progress

The initial ESLint, TypeScript and production build pass. The build generates 30 pages and retains the existing parent-lockfile warning and sanitized publication-unavailable fallback. A concurrent build/test attempt exhausted memory in the isolated PostgreSQL test. Its serial rerun passed. New scientific motion and original-content regression tests pass. Final full-suite, production HTTP, integration and browser results are recorded below when verification completes.

## Living Matter — creative checkpoint, November 16, 2026

### Scope and recovery

Implemented two interactive concepts at `/motion-lab` on `portfolio-v2`, following the latest Living Matter brief. This is the approval checkpoint before any further public redesign. The server returns 404 outside development and supplies noindex metadata; the route is absent from public navigation. No dependencies, database migrations, policies, deployments or production data were changed for this checkpoint.

Before implementation, the encrypted source checkpoint `2026-11-16T05-31-28-299Z-source.rbackup` captured 318 files / 99,595,094 source bytes in the existing private backup directory. Authenticated integrity verification passed for all 318 files. Archive SHA-256: `ab24b84e8a45c975116883655e68905b92bfa6a5a446ea16becbae9dea301d22`. This check verified the archive; it did not perform another full file-restoration rehearsal.

### Two working directions

| Direction | Visual system and composition | Motion and mobile behavior |
| --- | --- | --- |
| A — Living Matter | Parchment `#F1EBE0`, paper `#FFFDF9`, ink `#292720`, sage `#527B77`, selective blue `#54C8F4`. Asymmetrical portrait cover, generous serif hierarchy, connected research questions and original laboratory photographs. | A membrane assembles with cristae and energy particles, then resolves into the measured research rule while a blue aperture opens the actual page. Translation assembles a four-residue peptide that resolves into portrait corners. Mobile stacks the portrait after the introduction and retains one reading column. |
| B — Field Atlas | Atlas paper `#EAE4D7`, paper `#FFFDF9`, ink `#292720`, brown `#805D38`, amber `#CFAB7D`. Name-led masthead, offset photography, monospaced margin notes, folio-like research studies and a contact-frame portrait. | Scientific contour lines register into real study rules; an amber scan opens the research composition. Translation resolves into a photographic contact frame. On mobile, margin notes move above studies and the photo follows the narrative. |

Both use locally hosted EB Garamond for editorial hierarchy, Instrument Sans for reading and Courier Prime for annotations. The prototypes reuse the existing biography, research projects, supervisors, dates and personal photographs. Method buttons trace genuine method/project connections; details expose existing project information and links. The quantum-dot claim retains its theoretical qualification. Existing full pages remain available.

The laboratory includes direction selection, working Home/Research/About navigation, dedicated Research/About transition previews, replay, immediate skip, playback speed, particle density, glow, three energy colors, 390px canvas and reduced-motion preview. Normal duration is 2.5 seconds; quick study is approximately 1.67 seconds and the explicitly selected slow study approximately 3.33 seconds.

### Architecture and accessibility decisions

- `app/motion-lab/page.tsx` enforces the development boundary before rendering. `MotionLaboratory.tsx` owns settings and URL/history synchronization, while `LabCompositions.tsx` owns actual destination content. `lib/motion-lab.ts` contains pure geometry, sanitized locations and concept definitions. Styles are scoped to the laboratory.
- `playback.ts` measures the mounted destination once, then uses requestAnimationFrame for independently animated molecular shapes and the Web Animations API for geometric revelation. The membrane/protein geometry transforms into measured interface geometry. No per-frame layout reads or animation dependency were introduced. The new concepts use procedural scientific studies; the earlier Figma-derived dimensional-art implementation remains separate and has not received final visual acceptance.
- Navigation remains outside the animation. Direct URLs and browser history reveal readable content immediately. Ordinary visits use versioned session keys to avoid unnecessary replay; preview/replay buttons intentionally override that. Rapid navigation, concept/settings changes and component cleanup cancel prior frames, observers, listeners and animations. Resize finishes safely. Background/offscreen time pauses progression.
- System reduced motion and the laboratory preview bypass motion. Escape and Skip finish immediately. Focusing destination controls finishes the sequence before keyboard interaction. Destination content is mounted independently of image loading, and missing/unsupported Web Animations support reveals it immediately. Native controls, visible focus and status announcements remain available. These behaviors have code/regression coverage; the remaining manual acceptance items are listed below.

### CV — separately authorized public addition

The owner specified `/cv.pdf` with both new-tab viewing and downloading, accessible from the main navigation and homepage without animation. Added reusable `CVLinks` with those two actions and an editorial text treatment. Availability uses a read-only server file check; when absent, the site shows a pending label instead of a broken action. The owner's real `public/cv.pdf` is now present: 65,225 bytes. Its content was neither generated nor replaced. Both development and production HTTP checks confirm the anchors and PDF response (`200`, `application/pdf`, matching length). No placeholder CV was created.

### Verification results

- **61/61 automated tests pass**, including five new geometry, URL/environment-boundary and playback regression tests. The playback harness covers all four concept/destination pairs, completion cleanup, cancellation, hidden-document pause and zero-density/glow settings. Full suite command: `node --liftoff-only --wasm-num-compilation-tasks=1 --test --test-concurrency=1 tests/*.test.ts`. Serial WebAssembly compilation avoids the earlier concurrent PGlite memory failure.
- **ESLint, TypeScript and production build pass.** Build generated 31 pages using one worker. Existing warnings remain: the parent directory's ignored lockfile, and a sanitized Studio publication-unavailable fallback while live schema activation is deferred.
- `scripts/verify-motion-lab.mjs --development`: all six direction/view URLs return 200 with the laboratory and noindex metadata. Production mode: all six return 404 without laboratory markup. Public homepage has no laboratory navigation. CV view/download and metadata checks pass in both modes.
- `scripts/verify-editorial.mjs` passes for home, research, journal and Extras, preserving 35 substantive baseline passages in server HTML. `scripts/verify-public-assets.mjs` passes all 16 public media files using HEAD requests without downloading bodies.
- Production smoke checks reach all eight public/Extras/legacy-admin pages successfully, verify disabled Spotify OAuth routes and unknown-channel noindex handling, then **fail at Spotify history with HTTP 503**. The full smoke script stops there, so downstream checks must not be described as a complete smoke pass. No Spotify credentials or live tokens were modified to address this during the creative checkpoint.
- Separate read-only production HTTP probes confirm session/content/media APIs deny anonymous access with 401 and no-store, both Stockfish worker/WASM assets return 200, and unavailable publication media returns 503 with no private redirect. `git diff --check` passes; checkout remains `portfolio-v2`.
- Native Chrome desktop review confirmed both concept interfaces and actual Research/About content; an active Field Atlas translation frame was visually captured. The visible sequence contains separate ribosome subunits, codon track, carriers, particles and peptide assembly. Further interaction was blocked by the computer-use tool reporting detected user input. **Mobile interaction, reduced-motion interaction, full browser back/forward/rapid-navigation acceptance and final frame-by-frame review remain incomplete.** Responsive CSS and geometry tests are implemented; they do not substitute for mobile browser acceptance. No FPS, Lighthouse, screen-reader or device-performance measurement is claimed.

### Review and remaining work

With the development server running, open `http://localhost:3000/motion-lab?concept=living&view=cover` and `http://localhost:3000/motion-lab?concept=atlas&view=cover`. Use Research/About transition buttons, then adjust settings and Replay. Both compositions link to original full content. The 390px control provides a narrow prototype canvas; actual narrow-window administration controls still need manual acceptance.

Await the owner's choice of direction and creative feedback before rolling out either concept. Complete the outstanding mobile/browser acceptance and investigate the Spotify 503 before declaring full regression acceptance. The previous dimensional Figma-art composite still needs final visual review after its asset revisions. Studio live activation, staging recovery acceptance, and the legacy public `hoops_bucket` privacy/security follow-up remain deferred under their existing approval requirements.


## Increment 5.2 ? definitive Living Matter implementation

### Approval, scope and recovery

Read `Living-Matter-Art-Direction.md` in its entirety and implemented the approved direction on the actual portfolio. This supersedes the earlier two-concept approval checkpoint. The owner's subsequent request explicitly authorizes section-triggered autonomous playback, scroll-responsive acceleration and replay on reentry; these behaviors replace the earlier session-only/deep-link playback rule. Direct server output remains readable without JavaScript or an animation curtain.

Work remains on `portfolio-v2`. No remote push, deployment, live migration, production policy change or backend feature replacement was performed. The owner's CV and photographs were reused. No animation dependency was added. Package manifests remain semantically identical to the pre-change review archive. During the first memory-failing build, Next attempted to reinstall already present Node type declarations and pinned their manifest range; the original range was restored and manifest equality verified.

The encrypted source checkpoint `2026-11-16T06-35-54-517Z-source.rbackup` passed authenticated integrity verification for 331 files. SHA-256: `5d92babd3d220e9aee93d3e483289d0b865aff7a7907e9f15f3fbb162efa985d`. No private backup contents were inspected for redesign content. Earlier competing lab implementations were retired after checkpointing; their source is recoverable from the encrypted checkpoint and the previous desktop review archive. Existing Figma raster assets and legacy figure components remain available as unmounted source/assets, but are no longer public entrances or global animation styles.

### Actual portfolio changes

- Home is a readable portrait-led editorial cover: real identity and introduction, one primary Research action, About path, direct CV view/download, and a restrained three-part exhibition index. The old forced/decorative portrait and biology entrance calls were removed. `/#about`, `/#experience`, `/#leadership`, `/#gallery` and `/#extras` remain available.
- `/about` is a real server-rendered page with the approved full biography, original portrait, Lusaka/Grambling notes, aspirations, CV and onward links. The original home biography remains for legacy deep links.
- Research is an alternating image-led dossier with the original questions, contribution, results, sample distinctions and theoretical qualifications intact. The methods index highlights genuine project connections without hiding the server-rendered cases. All seven original photograph/poster assets retain accessible full-size links and dialogs.
- Experience and leadership use timeline/rule-based layouts, while the gallery uses existing photographs with accessible enlargement. Journal retains published entries and its truthful empty state in a readable editorial index.
- Extras removes the competing wordmark and irrelevant ECG decoration. Its directory, Listening Room sleeve/chart, chess study and Court Vision sports-journal layouts share the approved palette and reading scale. Listening summaries display an em dash while unavailable rather than implying genuine zero counts. Provider fetching, chess gameplay, videos, pickup sessions and administrative logic were preserved.
- Main navigation keeps real Next links, active-page indication, native mobile disclosure and both CV actions. The mobile disclosure closes after selecting a destination. Public typography and compositions use scoped rules; Studio authorization and functional controls are untouched.

### Scientific renderer and review environment

`lib/living-matter.ts`, `LivingScene.tsx` and `LivingStage.tsx` provide the one shared procedural renderer. The research organelle uses normalized hand-authored B?zier paths: an asymmetrical outer membrane, a separate continuous inner membrane with connected deep invaginations, matrix/intermembrane shading, restrained highlights and a traveling inner-membrane light. The organelle holds its anatomical form rather than being forcibly interpolated into a rectangle. Particles follow deterministic curved, nonuniform routes; mobile hides alternate particles. The scene is clipped and bounded to viewport geometry, with 24 particles maximum and no article-sized blur.

Translation uses AUG GCU UUU GGU UAA, corresponding to Met-Ala-Phe-Gly followed by termination. Large/small ribosomal subunits assemble, tRNAs enter and depart sequentially, the ribosome advances along the labeled 5-prime to 3-prime direction, and four connected residues emerge and release. Stop adds neither a residue nor another tRNA. The chain unfurls toward a visible portrait edge or a quiet narrative rule. This is an illustrative scientific sequence, not a claim of molecular simulation. The two scenes share timing but use distinct dark energy-wave and parchment scan reveals. Renderer/reveal use the same normalized progress and `livingReveal` function.

The development-only `/motion-lab` now has one direction and real page iframes rather than duplicate page mockups. It uses the exact shared renderer, clock and section-visit model, supports 320/390/768/1440/1920px canvases, presentation mode, replay/skip, speed study, reduced-motion preview and freeze/scrub controls. Full anatomy is inspectable at 60%; peptide release at 72%. Public automatic motion is disabled inside the review iframe to avoid two simultaneous systems. The parent review controller consumes iframe scroll input. No lab link is added to public navigation; production exclusion remains enforced before rendering.

### Hybrid autonomous and scroll-responsive controller

`lib/living-timeline.ts` owns finite normalized progress, velocity filtering, playback rate and cancellation. At rest, the baseline sequence is 2,500ms at 1x. Actual scroll displacement is sampled through passive scroll events, so wheel, touch, trackpad and keyboard movement share one input path. Absolute velocity accepts either direction, decays over 180ms and drives a rate eased over 140ms, bounded from 1x to 5x. Scroll input changes speed without assigning or resetting progress. When input stops, the rate smoothly returns to 1x while the existing sequence continues.

`lib/living-viewport.ts` is the shared section-visit state machine. Entry requires 80ms of meaningful visibility, with full-exit hysteresis to prevent boundary flicker. Research and dedicated About markers are on their signature introductions rather than the entire scrollable article. Home's legacy About section also participates. Full exit rearms replay and smoothly drains any remaining choreography over 220ms; reentry can start another visit without a page refresh. A rapid pass never holds the user's scroll. The review laboratory uses this same visit model.

`LivingTransitions.tsx` discovers mounted destinations, binds a single passive listener, batches geometry checks into animation frames and mounts an aria-hidden decorative overlay over already rendered content. It never prevents a link or scroll event, locks scrolling, fetches before navigation, or introduces a loading screen. Skip/Escape settle immediately; Tab and interactive controls allow content access. Skip focuses the real destination heading. Reduced motion bypasses sequences. Resize, hidden tabs, unmount and navigation clear frames and aria-busy. Replaced destination elements cannot complete a stale controller. On return from a hidden tab, settled content remains readable.

### Verification record

- Before the adaptive additions, all 66 tests passed. The adaptive additions then passed 73/73 plus all nine targeted adaptive-clock cases. Final combined suite: **81/81 pass**, including six shared viewport/reentry cases. Coverage includes anatomy topology/containment, valid peptide progression, finite reveals, frame cancellation/errors, autonomous timing, proportional bounded acceleration, idle recovery, reverse/touch displacement, exit draining, entry hysteresis and replay eligibility. These are deterministic regressions, not substitutes for device interaction testing.
- Final `npm run lint`, `npm run typecheck` and `npm run build` all pass with `NODE_OPTIONS=--max-old-space-size=768 --max-semi-space-size=8`. Initial unconstrained lint/build attempts exhausted process memory. The final post-integration build generated 32 pages, including `/about`, in a single-worker configuration. The parent-lockfile warning remains. `git diff --check` passes and the active branch remains `portfolio-v2`.
- Production HTTP smoke passed: public/Extras/legacy administration routes, Studio gates, unauthenticated 401 and foreign-origin 403 boundaries, rejected forged sessions, private-media fail-closed behavior and secure sign-out cookies. Spotify returned fresh history for five concurrent requests sharing the cached result (one available track); both Stockfish assets returned 200. No owner mutation or live schema activation was exercised.
- Editorial HTTP verification passes for home, Research, About, Journal and Extras, preserving all 35 substantive baseline passages and the original research media links. Public asset verification passes 16 files with HEAD requests. CV viewing/downloading returns the existing 65,225-byte PDF. Production lab URLs, including old concept parameters, return 404 with no laboratory UI.
- Development HTTP checks also pass for all five public editorial pages and all five laboratory query variants. The laboratory source contract confirms the shared renderer. Rapid exit/reentry while a controller is still completing preserves its current sequence instead of resetting it; a later completed visit can replay normally.
- Browser and native computer-use connections were retried and reset but remained unavailable (`browser access host is unavailable`; native list_apps timed out). **No new actual-browser screenshots, desktop/mobile interaction acceptance, clips, measured FPS, Lighthouse results or screen-reader verification are claimed.** Local anatomy reference renders were inspected at full size, 320px and 160px; they show connected non-crossing folds and recognizable silhouettes. References are under `.studio/living-anatomy-reference.png`, `.studio/living-anatomy-320.png` and `.studio/living-anatomy-160.png`, outside public production assets. They are geometry renders, not screenshots of the website.

### Local review and remaining acceptance

The existing local development server at **http://localhost:3000** serves the updated website; HTTP checks confirm the new cover and `/about` navigation. Visit `/research`, `/about`, `/#about`, `/extras`, `/extras/chess`, `/extras/basketball`, `/journal` and `/motion-lab?view=research` or `/motion-lab?view=about`. No production deployment has occurred.

For manual acceptance: pause at a signature introduction, scroll gently then quickly, stop and check continued playback, scroll fully beyond it and return. Check Escape/Skip, reduced motion, touch scrolling, keyboard navigation, native modifier clicks and rapid route changes. Freeze the anatomy in the laboratory and inspect all requested viewport sizes. Actual browser review and at least one refinement based on rendered-page screenshots remain outstanding until browser access is restored. Device performance is a target, not an established measurement. The live Studio activation/backups/staging and legacy public `hoops_bucket` security follow-up remain subject to their existing approvals; this work does not resolve those deferred infrastructure requirements.


## Portfolio V3 - Fieldwork creative reset

### Recovery and branch isolation

The V3 brief was read in full. Before V3 presentation changes, the current V2 committed/uncommitted tree was audited and encrypted checkpoint `2026-11-16T23-21-21-470Z-source.rbackup` verified: 385 files, SHA-256 `4702320fb1390b4d54d3b2a8763663cf992a11975a797daa72ce7a558f56794d`. Verification checked authenticated archive integrity; it was not another full restore rehearsal.

A separate worktree at `../kondwani-portfolio-v3` uses branch `portfolio-v3`. All 226 current nonprivate source/asset files were copied byte-for-byte and checked against a baseline manifest. Commit `75d10a5` records that complete V2 working source on V3, before the creative reset. The original V2 branch still points to `f418901c4b35c8f085a98525599b1ce7c4fd76af`; neither V2 nor main was checked out for new implementation. Environment configuration remains local and ignored. Source backups, private staging and credentials were not staged.

Dependencies initially used a local junction for speed. Before a V3 security patch, that junction was moved (not recursively deleted) into ignored staging. V3 now has its own physical installed dependencies. V2's installed packages are not modified. The old local dev listener was identified by its project command path before stopping it; port 3000 is reserved for the new local V3 server. This changes a local runtime, not V2 source or production resources.

### Discovery and creative decision

`docs/V3_REFERENCE_ANALYSIS.md` records the reference investigation, evidence limits, original reinterpretations, public source URLs, and the Craft Anything review. Craft was read-only. Its MIT/Apache code terms and separately protected brand/icon assets were reviewed; no Craft code, assets or Rust installation were needed. The useful method is evidence-first study, state-based inspection and iterative comparison against an original direction. Public-source findings are not labeled clean-room or browser observations.

`docs/V3_CREATIVE_DIRECTION.md` defines Fieldwork. The stable source list and contextual toolbar provide an application frame; research becomes a real collection of case files; photographs, music, chess and basketball receive content-specific spaces. The V2 full-screen biological sequences are no longer mounted. The palette and native document experience remain, while the old public presentation cascade was replaced instead of retaining layers of V2 overrides.

### Implemented interface and preserved content

- `SiteNavigation`, `NavigationLinks`, `WorkspaceToolbar`, `WorkspaceIcon`, `public-navigation.ts` and `v3-shell.css` implement grouped source-list navigation, current collection state, a compact mobile collections menu, server-rendered fallback navigation, direct URLs and immediate resume access.
- The new welcome workspace uses the real portrait and academic identity, authentic case-file links, photographic/journal shortcuts and a distinct off-duty shelf. It does not repeat the full biography, experience timeline or leadership record.
- Research uses `ResearchNotebook`, `ResearchCaseFiles`, its pure selection model and a scoped notebook stylesheet. Native disclosures retain complete SSR/no-JS write-ups; client enhancement selects a case with URL-backed hashes and browser history. Arrow keys and the mobile picker support selection. Technique connections are factual, including the shared data-analysis relationship. All 17 original research passages and seven original photograph/poster assets remain.
- About, Experience, Leadership, Gallery, Journal and published articles use the same workspace frame with different reading/collection compositions. All 35 original substantive content passages are still checked by unchanged fixture text. The original public contact mailto was verified from the actual CV rather than copied from the reference or auth configuration.
- Listening Room, chess and Court Vision retain their provider/game/video implementations and separate personalities. No decorative sequence resets a game or blocks its board. Public API, authorization, video storage, draft/revision/publication and migration code remain protected boundaries.
- The actual PDF/media window system was deliberately retained as a useful V3 tool. Its review corrected stale native close events during StrictMode, WAAPI-close failure fallback, navigation cleanup and accumulated requested zoom. Fullscreen/expand, zoom/fit, original-file access, download, Escape, focus restoration and near-full-screen mobile presentation remain functional design contracts. The one-page original CV and pinned local PDF worker are unchanged.

### Safe maintenance found during audit

The previous homepage extraction had left review-only Studio seed preparation pointing to old source locations. `prepare-studio-seed.mjs` now resolves `ResearchCaseFiles`, `ExperienceTimeline` and `PortfolioGallery` while retaining the original five seed keys/IDs. Current source locations are recorded separately. Imported public images are resolved; dynamic expressions remain marked for editorial review. Source-only preflight can exclude private local drafts. This prepares review data; it does not publish or apply a migration.

The local Extras validation allowlist now includes the existing Listening Room channel. No hosted schema or policy changed.

A read-only dependency audit confirmed GHSA-mfr8-8qww-v76h against Next 16.4.3 (moderate; affected range 16.3.0-16.4.4). The source does not contain the advisory's `unstable_cache()` nesting pattern. V3 is now pinned to the compatible Next/eslint-config-next 16.4.6 patch in its independent dependency directory. Advisory details were checked against [the official GitHub advisory](https://github.com/advisories/GHSA-mfr8-8qww-v76h). The post-patch production dependency audit reports **zero vulnerabilities**. The installation's development-inclusive audit still reports **seven moderate vulnerabilities**; these need a separate compatibility-aware dependency review before release. No broad `audit fix` was applied. V2 retains its original dependencies.

Final independent source review caught an early PDF-render cancellation window. Painting promises are now observed immediately, even when cancellation precedes text loading. Development browser telemetry recorded that cancellation error before the fix; post-fix interactive replay remains pending. Research technique selection now marks related files with a border rather than reducing operable link/text opacity. The root document declares Next's supported `data-scroll-behavior="smooth"` contract so route transitions do not inherit CSS smooth scrolling. A React checklist review retained lazy document loading, server-rendered content, functional state updates and effect cleanup without adding a component framework.

### Verification and remaining acceptance

Final post-patch checks, repeated after the PDF cancellation and research contrast fixes:

| Check | Result and scope |
| --- | --- |
| `npm.cmd run lint` | Pass; no remaining ESLint errors or warnings. |
| `npm.cmd run typecheck` | Pass. |
| Serial complete test suite | **98/98 pass**, zero skipped, including four research/source-list model tests and four actual-source/seed preservation tests. |
| `npm.cmd run build` | Pass with Next 16.4.6/Webpack; all 36 static-generation entries completed. |
| `verify-editorial.mjs` | All 11 public destinations pass; all 35 original substantive passages, research assets/methods and public navigation contracts preserved. |
| `verify-public-assets.mjs` | All 16 public media HEAD requests pass; no full media bodies downloaded. |
| Production `verify-motion-lab.mjs` | Five current/legacy query variants return 404; actual CV HEAD returns 200, `application/pdf`, 65,225 bytes; in-site/view/download entry checks pass. |
| Local production smoke | Public/Extras/legacy-admin routes, Spotify, Stockfish, Studio gates, API denial and session closure checks pass; detailed limits below. |
| PDF engine | Installed PDF.js rendered the actual one-page CV to a 918 by 1,188 pixel local inspection image; visual inspection passed without changing the PDF. This is not browser-window interaction proof. |
| Production dependency audit | Zero known vulnerabilities reported after the framework patch. Seven moderate development-inclusive audit findings remain for separate review. |
| Preservation and private-file review | All 226 V2 source hashes, its branch/HEAD and all 113 status entries match the saved baseline. Thirty-five V3 candidate files reviewed; no private artifacts or common credential patterns detected. `git diff --check` passes. |

Commands used the workstation's bounded Node heap (`--max-old-space-size=768 --max-semi-space-size=8`); the test runner additionally used `--liftoff-only --wasm-num-compilation-tasks=1 --test --test-concurrency=1 tests/*.test.ts`. The original content fixture text was not deleted or weakened; obsolete V2 presentation expectations were replaced with V3 navigation, document and preservation contracts. Logs and the PDF inspection image stay in ignored local staging, not public assets.

The final full local production smoke returned four fresh Spotify tracks and verified five coalesced concurrent responses. An intermediate rerun under a network-restricted server stopped at Spotify 503; restarting the identical build with upstream network access made the full smoke pass. Both logs are retained, and the development server has the required network access. No Spotify code or tokens were edited to obtain that result. Stockfish JavaScript/WASM assets return 200; deterministic game/puzzle tests pass, while actual board interaction remains a browser acceptance item. Studio pages return the login boundary. Anonymous and forged sessions receive 401/no-store; foreign-origin requests receive 403; guarded persistence/upload/media endpoints deny anonymous access. Unpublished/unavailable media returns 503 with no private redirect while Studio activation is pending. Sign-out clears the secure cookie and rejects foreign origins. **No real-owner mutation, media upload, revision recovery, publication or live schema activation was exercised by this creative increment.** Earlier isolated integration tests remain in the suite; they do not prove current hosted activation.

Browser/native inspection was retried for this increment and timed out. No V3 desktop/mobile screenshots, hover outcomes, clips, measured FPS, Lighthouse or screen-reader acceptance are claimed. Source review caught and corrected a mobile sidebar-variable cascade issue, while actual rendered-page iteration remains pending browser access. The source-list/no-JS fallback and real URL contracts have automated checks; they do not substitute for device interaction testing. Development browser telemetry also recorded hydration attribute diffs for injected `bis_skin_checked`/`__processed` attributes. The shown diffs are consistent with browser-extension injection; an extension-free browser retest is still required. Hydration warnings were not hidden with blanket suppression.

### Local handoff and outstanding work

The V3 development server runs at **http://localhost:3000** from `kondwani-portfolio-v3` on `portfolio-v3`, using `npm.cmd run dev -- --webpack --hostname 127.0.0.1 --port 3000` and a 1,536 MiB old-space heap for route compilation. The production verification server is temporary and is stopped after checks. A local implementation commit follows baseline `75d10a5`; use `git log --oneline -2` to identify both checkpoints. No push, merge to main, deployment, live database migration or production policy change occurred.

Manual review must cover the welcome workspace, research selection/history and keyboard navigation, mobile menu, resume opening/rapid zoom/closing, poster/photo zoom, music, puzzle/freeplay, Court Vision and private admin restrictions. Complete desktop/mobile visual refinement and device accessibility/performance acceptance once browser tools recover. Review development dependency advisories separately. Existing Studio activation, full recovery/staging acceptance and the legacy public `hoops_bucket` privacy follow-up remain deferred under their original approval requirements. V2 presentation, optional biological renderers and the archived development laboratory remain recoverable; they are not mounted as public entrances or linked in the new navigation.
