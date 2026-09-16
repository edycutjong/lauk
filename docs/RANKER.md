# The ranker

Lauk has no food database and no model. It has a 12-row plate table, a 40-row add table, and this rule.

## Inputs

- `plate` — five levels (`filling · fresh · rich · bright · crunch`), each 0 hollow · 1 half · 2 full
- `ceiling` — 0 Free · 1 Small (≤ Rp 2k) · 2 Medium (≤ Rp 5k) · 3 Treat (≤ Rp 10k)
- `weights` — five numbers, default 1.0, moved by the after-meal faces (`core/weights.ts`), clamped 0.5–1.5

## Rule (`app/src/core/rank.ts`)

```
gain_p(a) = 1 if p ∈ a.raises and plate_p < 2, else 0
tiers     = [ceiling−2 .. ceiling] ∩ [0..3], cheapest first, one card per tier
            (ceiling 0 → up to three free adds)
score(a)  = Σ_p w_p · gain_p(a) · [p not yet raised]     novel gain — the card must add something new
          + 0.5 · Σ_p w_p · gain_p(a)                     total gain
          − 0.1 · tier(a)                                  price penalty — only matters across ties
pick      = argmax (score desc, authored index asc); raised ∪= pillars the pick lifts
output    = picks sorted by (tier asc, authored index asc)
```

Availability: an add with a `plates` list is available on exactly those tiles; otherwise on every deck in
`where` (`"all"` = everywhere). Ties resolve on the authored order of `addons.json`, so the output is a pure
function of (content, plate, ceiling, weights). `tests/rank.test.ts` asserts the three reference queries and
1,000-run determinism; `npm run bench` prints p50/p95 over 12 × 4 × 3 weight profiles and re-checks the
content hash.

## Worked example — the demo query

`rice_side` (filling 2 · fresh 0 · rich 1 · bright 0 · crunch 0) at Medium:

| tier | winner          | score | why                                                                                   |
| ---- | --------------- | ----- | ------------------------------------------------------------------------------------- |
| 0    | Lime wedge      | 1.5   | every free add lifts one pillar; authored order breaks the tie                        |
| 1    | Raw veg + chili | 1.9   | lifts fresh (novel) and bright (already raised): 1 + 0.5·2 − 0.1                      |
| 2    | Fried egg       | 1.3   | lifts rich (novel): 1 + 0.5 − 0.2; fruit cup scores 0.8 (both pillars already raised) |

Tap card 2 and the ring reads filling 2 · fresh 1 · rich 1 · bright 1 · crunch 0 — four of five lit.

## The one deliberate exclusion

The "What Lauk never does" screen renders the banned-word list from `core/lint.ts`'s `BANNED` constant, not from
`copy.en.json`, so the copy-lint never scans its own denylist. Everything else the user can read is scanned.
