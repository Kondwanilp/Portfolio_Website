# Fieldwork - Portfolio V3

Kondwani Phiri's local scientific workspace, built on the existing Next.js/TypeScript portfolio and preserved integrations.

## Local development

Use this checkout: `kondwani-portfolio-v3` on `portfolio-v3`. The separate `kondwani-portfolio` checkout preserves V2.

```powershell
npm.cmd install
npm.cmd run dev -- --webpack --hostname 127.0.0.1 --port 3000
```

Open http://localhost:3000. Local environment configuration is ignored by Git. Never paste credentials into issues or documentation. The real public resume is `public/cv.pdf`.

## Verification

```powershell
npm.cmd run lint
npm.cmd run typecheck
node --liftoff-only --wasm-num-compilation-tasks=1 --test --test-concurrency=1 tests/*.test.ts
npm.cmd run build
```

Production builds use Next's supported Webpack path because this workstation exhibited native Turbopack allocation failures. Memory-constrained checks can use `NODE_OPTIONS=--max-old-space-size=768 --max-semi-space-size=8`; development may need a larger heap while compiling all collections.

## Design and recovery records

- [Reference analysis](docs/V3_REFERENCE_ANALYSIS.md)
- [Creative direction](docs/V3_CREATIVE_DIRECTION.md)
- [Architecture, checkpoints and verification](docs/RENAISSANCE.md)

V3 keeps real source-list routes, accessible research case files, local PDF/media viewers and existing Spotify/chess/Court Vision/Studio services. No production deployment or live migration is authorized by this local review stage.
