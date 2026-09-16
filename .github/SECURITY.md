# Security Policy

## Supported Versions

| Version         | Supported |
| --------------- | --------- |
| latest (`main`) | ✅        |

## What Lauk holds

Nothing worth stealing, by design: no accounts, no server, no PII. On the device: a log of
plate ids and three-face ratings (≤ 3 rows/day) and five weighting numbers, in the app's private
AsyncStorage. Purchases are handled by RevenueCat and Google Play Billing; the app holds only a
RevenueCat **public** SDK key, sourced from the environment at build time (`.env.example`).

## What is tested, not just claimed

- **No local write can unlock a deck.** `canUseDeck` / `dailyCap` read only
  `CustomerInfo.entitlements.active` from the RevenueCat SDK — `tests/boundary.test.ts` proves an
  expired entitlement, a purchase record, a sibling deck, a look-alike id and a malformed check
  count all stay locked.
- **No secret in the tree or its history.** `gitleaks` (full history) and TruffleHog run on every
  push; the upload keystore and every key live in `~/.config/lauk/`, never in the repo.

## Reporting a Vulnerability

Please **do not** open a public issue for security vulnerabilities. Instead,
report them privately:

- Email **edy.cu@live.com**, or
- Use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) (Security → Report a vulnerability).

You'll get an acknowledgment within 48 hours and a resolution timeline after
triage. Please give us a reasonable window to patch before public disclosure.
