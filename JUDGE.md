# For the judge — Lauk in 30 seconds

**Tap the plate you already bought and a spend ceiling; Lauk ranks one cheap add that makes it satisfying — and never counts anything.**

## The 30-second path (no setup, no keys)

1. Open the Google Play listing — _link lands here on publication (production submission 2026-09-23)._
2. Onboarding → **Student housing** · Plates → **Rice plate + one side** → **Medium**.
3. Three cards: lime wedge (free) · raw veg + chili (Rp 2,000) · fried egg (Rp 5,000). Tap the second — the ring goes from 2 of 5 lit to 4 of 5.
4. Tap anywhere → **satisfied** → the week strip shows today's face.
5. Tap a **Delivery** tile → the RevenueCat paywall (the Semester pass leads, because step 2 set `eating_context = student`). **Unlimited has a 7-day free trial** — that is the judge unlock.

Without a phone: `npm install --legacy-peer-deps && npm run check -- rice_side 2` prints the same three cards.

## Receipts

|                                              | Value                                                                                                                   | How to verify              |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Tests                                        | **70**, < 1 s, no device, no key                                                                                        | `npm test`                 |
| Exhaustive verification                      | **150,000** (plate, ceiling, weighting) queries — every card affordable, useful, distinct, cheapest-first; 0 violations | `tests/exhaustive.test.ts` |
| Coverage of the pure core                    | 99.3 % lines                                                                                                            | `npm run test:coverage`    |
| Ranker                                       | p50 1.8 µs · p95 4.8 µs (budget 1 ms)                                                                                   | `npm run bench`            |
| Copy-lint                                    | 22 banned words · 0 hits across content, UI strings and the paywall copy                                                | `tests/lint.test.ts`       |
| Entitlement boundary                         | expired / purchase-record / sibling-deck / look-alike id → all locked                                                   | `tests/boundary.test.ts`   |
| RevenueCat calls                             | 12, in one file                                                                                                         | `app/src/rc/purchases.ts`  |
| Native build                                 | debug APK `dev.edycu.lauk` assembles, RC modules linked                                                                 | CI Stage 4 · `DEMO.md`     |
| **On-device run, real purchase, stall test** | **pending** — dated in `DEMO.md` §3–4                                                                                   | —                          |

## Reproduce (the real path)

```bash
git clone https://github.com/edycutjong/lauk && cd lauk
npm install --legacy-peer-deps && npm test && npm run check -- rice_side 2 && npm run bench
# the app: cd app && npm install --legacy-peer-deps && cp ../.env.example .env  # RevenueCat Test Store public key
npx expo prebuild --platform android && npx expo run:android
```

There is no offline/mock/demo flag anywhere. Without a key the app runs with every deck but Counter locked and says so.

## Honest limitations

- The RevenueCat calls are verified against the SDK typings and the Metro bundle — **not yet against a live Test Store on a device.** That is build day 1 (2026-09-18); the Targeting screenshot lands in `docs/proof/`.
- Paywall copy is dashboard-authored; it is written and lint-checked in `docs/paywall-copy.md` but not yet pasted or screenshotted.
- Prices outside Indonesia are tier ceilings ("≤ $2"), not exact — only IDR has authored reference prices.
- The kill test (5 real budget eaters at a stall, 2026-09-20) has **no rows yet**; if fewer than 3 of 5 would buy the top card, the project is dropped, not the caveat.

## Links

Repo · Play listing (on publication) · Demo video (2026-09-23) · [DEMO.md](DEMO.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [docs/RANKER.md](docs/RANKER.md)
