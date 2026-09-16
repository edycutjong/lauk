# DEMO.md — judge path and receipts

Everything below is either reproducible from a fresh clone right now, or explicitly marked **pending** with the
date it is due. Nothing here is simulated: there is no demo flag, no mock mode, no seeded user data anywhere in the app.

## 1. Reproduce from a fresh clone (no credentials)

```bash
git clone https://github.com/edycutjong/lauk && cd lauk
npm install --legacy-peer-deps
npm test
npm run check -- rice_side 2
npm run bench
```

Expected: `Tests 58 passed`, the three-card output shown in the README, and

```
lauk bench — 12 plates × 4 ceilings × 3 weighting profiles × 200 rounds = 28800 queries
  p50 1.8 µs · p95 4.8 µs · p99 9.3 µs
  asserted queries: 3/3 · I1 48/48 · I2 40/40
  content hash <12 hex> (matches disk)
  PASS
```

(measured 2026-09-16 on an Apple M-series laptop, Node 22; the p95 budget the bench enforces is 1 ms.)

## 2. The judge path on a device (dev build)

1. Install the dev build (`npx expo run:android` with a Test Store key in `app/.env`).
2. Onboarding → **Student housing**. This sets the RevenueCat attribute `eating_context = student`.
3. Plates → tap **Rice plate + one side** → **Medium**. Three cards: lime wedge (free), raw veg + chili (Rp 2,000), fried egg (Rp 5,000).
4. Tap **Raw veg + chili**. The ring fills fresh + bright in amber (4 of 5 lit), a haptic lands, the cue fades in.
5. Tap anywhere → three faces → tap **satisfied** → the week strip shows today's face. Settings → the `fresh` and `bright` bars have moved up.
6. Back on Plates: the chip reads **Checks today: 1 of 1**. Tap any Counter plate again → the daily-cap paywall (`presentPaywallIfNeeded`, entitlement `unlimited`).
7. Tap a **Delivery** tile → the deck paywall (`presentPaywall`, offering from placement `second_deck`). Because step 2 set `student`, a Targeting rule serves `decks_student` and the **Semester pass** leads. Buy the Delivery deck (Test Store, instant) → the tile unlocks and the chip reads **0 of 3**.
8. Force-stop the app, cold start → the Delivery deck is still open (`entitlements.active.deck_delivery` read back from RevenueCat, not from local storage).
9. Settings → **Restore purchases** · **Manage subscription** (Customer Center) · **What Lauk never does** (the 22-word denylist rendered from `lint.ts`).

## 3. Receipts

| Receipt                                                                              | Status                                                                                                                  |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Bench p50/p95 + invariants + content hash                                            | ✅ `npm run bench` (section 1)                                                                                          |
| 58 tests including the copy-lint gate                                                | ✅ `npm test`                                                                                                           |
| Metro bundle contains every RevenueCat call + the content                            | ✅ `npm run bundle:check` (3.4 MB Hermes bytecode, 2026-09-16)                                                          |
| Day-1 Targeting proof (`eating_context` flip changes the offering id in the SDK log) | **pending — build day 1, 2026-09-18**, screenshot → `docs/proof/day1-targeting.png`                                     |
| Cold-start entitlement read-back + RevenueCat customer page                          | **pending — build day 4, 2026-09-21**, screenshots → `docs/proof/`                                                      |
| Play Billing sandbox purchase (license tester)                                       | **pending — build day 4**                                                                                               |
| One real-money purchase, labelled who paid                                           | **pending — build day 5, 2026-09-22** (fallback: builder's second Google account, labelled "self-purchase, real money") |
| Play production submission                                                           | **pending — 2026-09-23**                                                                                                |
| Demo video (≤ 2 min, handheld, real table, real plate)                               | **pending — 2026-09-23 afternoon**                                                                                      |

## 4. The stall test (the killer number)

The number Lauk will headline is not a benchmark. It is: **k of 5 real budget eaters, plate in front of them at a real
stall, say they would buy the top-ranked add at that price.** The test runs on 2026-09-20; n, k, each eater's plate,
ceiling and card, and a consenting first-name quote are appended here as rows. If k < 3 the project is dropped —
the kill criterion applies to the idea, not to the caveat. **No rows exist yet; nothing above this line claims otherwise.**

## 5. What still breaks or is unfinished (honest list, updated per build day)

- The canvas has never run on a physical device with a live RevenueCat key — the SDK calls are verified against the
  published typings and the Metro bundle, not yet against the Test Store. That is build day 1.
- Paywall templates are dashboard-authored; their copy is written and lint-checked in `docs/paywall-copy.md` but not yet
  pasted, so the rendered paywalls are not yet screenshotted.
- Currency labels beyond IDR/USD are tier ceilings, not exact prices (by design — only IDR has authored reference prices).
- Google Play production access on the publishing account is unconfirmed (per-account gate).
