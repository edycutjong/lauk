/**
 * Regression tests, each named after the defect it pins. The list is a
 * changelog of real bugs found while building — not a coverage exercise.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ADDS, PLATES } from '../app/src/core/content';
import { DEFAULT_WEIGHTS, DECKS, TIERS, isAvailable } from '../app/src/core/pillars';
import { rankAdds, tiersFor } from '../app/src/core/rank';
import { findBannedWords } from '../app/src/core/lint';

describe('regressions', () => {
  it('tiersFor_treat_ceiling_kept_tier_3_after_truncating_before_filtering (2026-09-16)', () => {
    // First version built [0,1,2], cut at three, THEN filtered t >= ceiling-2 → [1,2]:
    // a Treat ceiling silently never offered a treat-tier add.
    expect(tiersFor(3)).toEqual([1, 2, 3]);
    for (const p of PLATES)
      expect(
        rankAdds(p, 3, ADDS, DEFAULT_WEIGHTS).some((c) => c.tier === 3),
        p.id,
      ).toBe(true);
  });

  it('instant_deck_had_zero_treat_tier_adds_despite_the_two_per_tier_invariant (2026-09-16)', () => {
    // seed-data claimed "every deck has >=2 adds per tier"; the Instant deck had none at tier 3,
    // so instant noodles at a Rp 10k ceiling returned only two cards.
    for (const d of DECKS)
      for (const t of TIERS)
        expect(
          ADDS.filter(
            (a) => a.tier === t && !a.plates && (a.where === 'all' || a.where.includes(d)),
          ).length,
          `${d}@${t}`,
        ).toBeGreaterThanOrEqual(2);
  });

  it('lint_fixture_tripped_its_own_denylist_with_the_word_lose (2026-09-16)', () => {
    // The word-boundary test asserted "loser is not lose" had zero hits — it contains "lose".
    // A fixture that fails for the wrong reason hides a real regression behind a known-red test.
    expect(findBannedWords([['fixture', 'a loser, a closet, a slimmer']])).toEqual([]);
    expect(findBannedWords([['fixture', 'lose']])).toHaveLength(1);
  });

  it('readme_prose_said_calories_and_weight_profiles_until_the_readiness_scan_caught_it (2026-09-16)', () => {
    // The scan that fails the build on those words in prose must keep matching them inside sentences.
    expect(findBannedWords([['README', 'Every app answers "how many calories?"']])).toHaveLength(1);
    expect(findBannedWords([['DEMO', '12 plates × 4 ceilings × 3 weight profiles']])).toHaveLength(
      1,
    );
    expect(findBannedWords([['DEMO', '12 plates × 4 ceilings × 3 weighting profiles']])).toEqual(
      [],
    );
  });

  it('plates_list_narrows_availability_rather_than_extending_it (design, 2026-09-16)', () => {
    // With OR semantics pickles (where: delivery+cafeteria, plates: fried_rice) would be available
    // on the salad bowl and win the free slot (3.0 > 1.5), breaking the asserted salad_bowl query.
    const pickles = ADDS.find((a) => a.id === 'pickles')!;
    expect(
      isAvailable(
        pickles,
        PLATES.find((p) => p.id === 'salad_bowl')!,
      ),
    ).toBe(false);
    expect(
      isAvailable(
        pickles,
        PLATES.find((p) => p.id === 'fried_rice')!,
      ),
    ).toBe(true);
  });

  it('plates_tap_checked_the_daily_cap_against_pre_purchase_customer_info (2026-09-16 audit)', () => {
    // After presentDeckPaywall the tap continued with the closure's stale `info`, so a deck bought
    // on that tap (cap 1 → 3) still hit the cap paywall. The tap now decides on refreshInfo()'s
    // return value; this pins the wiring at source level.
    const plates = readFileSync(resolve(__dirname, '../app/src/screens/Plates.tsx'), 'utf8');
    expect(plates).toMatch(/current = \(await refreshInfo\(\)\) \?\? current/);
    expect(plates).toMatch(/canCheck\(current, todayCount\)/);
    expect(plates).not.toMatch(/canCheck\(info, todayCount\)/);
    const ctx = readFileSync(resolve(__dirname, '../app/src/state/AppContext.tsx'), 'utf8');
    expect(ctx).toMatch(/refreshInfo\(\): Promise<CustomerInfo \| null>/);
  });
});
