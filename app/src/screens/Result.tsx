/**
 * The ring + three cards, cheapest first. Tapping a card fills its pillars
 * in amber with a haptic, the other cards collapse, and the cue fades in
 * over the breathing bar. "I ate it as it was" is always one tap away.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { Press } from '../components/Pressable';
import { T } from '../components/Text';
import { PillarRing } from '../components/PillarRing';
import { AddCard } from '../components/AddCard';
import { ADDS, COPY } from '../core/content';
import type { Plate, Tier } from '../core/pillars';
import { litCount, rankAdds, type Card } from '../core/rank';
import { TIER_NAMES, ceilingLabel } from '../core/tiers';
import { useApp } from '../state/AppContext';
import { CueBar } from '../components/CueBar';
import { color, space } from '../theme/tokens';

export function ResultScreen({
  plate,
  ceiling,
  rowTs,
  onDone,
}: {
  plate: Plate;
  ceiling: Tier;
  rowTs: number;
  onDone: (card: Card | null) => void;
}) {
  const { weights, prefs, logAdd } = useApp();
  const cards = useMemo(() => rankAdds(plate, ceiling, ADDS, weights), [plate, ceiling, weights]);
  const [chosen, setChosen] = useState<Card | null>(null);
  const cue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!chosen) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Animated.timing(cue, { toValue: 1, duration: 600, delay: 250, useNativeDriver: true }).start();
    const t = setTimeout(() => onDone(chosen), 20000);
    return () => clearTimeout(t);
  }, [chosen, cue, onDone]);

  const pick = async (card: Card) => {
    setChosen(card);
    await logAdd(rowTs, card.add);
  };

  const levels = chosen ? chosen.after : plate.levels;

  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={chosen ? () => onDone(chosen) : undefined}
      disabled={!chosen}
    >
      <Screen scroll={!chosen}>
        <T variant="hairline">
          {plate.name} · {TIER_NAMES[ceiling]} {ceilingLabel(ceiling, prefs.currency)}
        </T>
        <T variant="display" style={{ marginTop: space.xs }}>
          {chosen ? chosen.add.name : COPY.result.title}
        </T>
        <View style={styles.ring}>
          <PillarRing levels={plate.levels} fill={chosen ? chosen.after : undefined} />
          <T variant="secondary" style={{ marginTop: space.sm }}>
            {litCount(levels)} {COPY.result.litOf}
          </T>
        </View>

        {chosen ? (
          <Animated.View style={{ opacity: cue, alignItems: 'center', marginTop: space.lg }}>
            <T variant="display" style={{ textAlign: 'center', color: color.sated }}>
              {COPY.cue.line}
            </T>
            <View style={{ width: '70%', marginTop: space.lg }}>
              <CueBar />
            </View>
            <T variant="hairline" style={{ marginTop: space.lg }}>
              {COPY.cue.skip}
            </T>
          </Animated.View>
        ) : (
          <>
            {cards.map((c, i) => (
              <AddCard
                key={c.add.id}
                card={c}
                currency={prefs.currency}
                index={i}
                onPress={() => pick(c)}
              />
            ))}
            <Press
              elevated={false}
              onPress={() => onDone(null)}
              style={styles.asIs}
              accessibilityRole="button"
            >
              <T variant="secondary" style={{ textAlign: 'center' }}>
                {COPY.result.ateAsIs}
              </T>
            </Press>
          </>
        )}
      </Screen>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ring: { alignItems: 'center', marginVertical: space.lg },
  asIs: { marginTop: space.sm, alignSelf: 'center', paddingHorizontal: space.lg },
});
