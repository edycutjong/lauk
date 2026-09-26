# Paywall copy (dashboard-authored strings)

> RevenueCat paywalls are designed in the dashboard, so the copy-lint cannot reach them at build time.
> Every string below is written here FIRST, lint-checked by `tests/lint.test.ts`, then pasted verbatim
> into the two dashboard templates. Rendered-paywall screenshots go into `docs/proof/` once they exist
> (none yet as of 2026-09-26 — no Play products are mapped, so the Play build cannot render them).
> Lines beginning with `>` are commentary and are excluded from the scan.

---

## Paywall 1 — a locked deck tile (`presentPaywall({ offering })`, offering `decks` / `decks_student`)

- Headline: Open the {deck} deck
- Headline with a plate (custom variable `plate`): Open the {deck} deck for {plate}
- Subhead: Three plates, every add that fits them — yours once, forever.
- Package — one deck: {deck} deck · once
- Package — Unlimited: Unlimited · every deck, no daily limit · 7 days free
- Package — Semester pass (`decks_student` only): Semester pass · 6 months of Unlimited · for student housing
- CTA (one deck): Open this deck
- CTA (Unlimited): Start 7 days free
- Footer: Cancel any time. One deck is a one-time purchase.
- Restore: Restore purchases

## Paywall 2 — the daily cap (`presentPaywallIfNeeded({ requiredEntitlementIdentifier: 'unlimited' })`)

- Headline: That was today’s check.
- Subhead: Unlimited opens every deck with no daily limit — 7 days free.
- Package — Unlimited monthly: Unlimited · 7 days free, then monthly
- Package — Semester pass (`decks_student` only): Semester pass · 6 months
- CTA: Start 7 days free
- Secondary: Not today
- Footer: Cancel any time from Google Play.

## Product display names (Play Console + RevenueCat)

- deck_instant → Instant deck
- deck_delivery → Delivery deck
- deck_cafeteria → Cafeteria deck
- unlimited_monthly (P1M base plan, 7-day free-trial offer) → Unlimited
- unlimited_semester (P6M) → Semester pass

Both subscriptions grant the `unlimited` entitlement.
