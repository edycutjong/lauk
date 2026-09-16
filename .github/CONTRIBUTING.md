# Contributing

Thanks for your interest in improving Lauk! 🍚

## Getting Started

1. Fork the repo and branch from `main`: `git checkout -b feat/your-feature`
2. Install both workspaces: `npm install --legacy-peer-deps && npm --prefix app install --legacy-peer-deps`
3. Copy the env template: `cp .env.example app/.env` (a RevenueCat Test Store public key — the tests need none)
4. Run the no-credential suite: `npm test`, `npm run check -- rice_side 2`, `npm run bench`
5. Run the app: `cd app && npx expo prebuild --platform android && npx expo run:android`

## Before You Open a PR

- `npm run ci` passes (prettier, eslint, tsc ×2, vitest + coverage, bench, readiness).
- `npm run bundle:check` passes (Metro must bundle — a green typecheck is not proof).
- **The copy-lint is a hard rule.** No string a user can read may contain one of the 22 words in
  `app/src/core/lint.ts`. If your change adds copy, run `npm test` — `tests/lint.test.ts` scans
  content, UI source strings and `docs/paywall-copy.md`.
- Content changes go through `scripts/seed.ts`, never by editing `app/src/core/content/*.json`
  (the hash test will fail). The authored order of adds is the ranker's tie-break — reordering
  a row changes the product; say so in the PR.
- Regression tests are named after the defect they pin (`tests/regressions.test.ts`). Add one.
- Commits follow Angular convention (`feat:`, `fix:`, `docs:`, `chore:`) — `release.yml` derives
  the version from them.

## Reporting Bugs / Requesting Features

Open an issue using the provided templates. Include repro steps, expected vs.
actual behavior, and device / Android version.
