import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Press } from './Pressable';
import { T } from './Text';
import { PillarChip } from './PillarChip';
import type { Card } from '../core/rank';
import { costLabel } from '../core/tiers';
import { color, space } from '../theme/tokens';

export function AddCard({
  card,
  currency,
  index,
  onPress,
  animate = true,
}: {
  card: Card;
  currency: string;
  index: number;
  onPress: () => void;
  animate?: boolean;
}) {
  const y = useRef(new Animated.Value(animate ? 24 : 0)).current;
  const o = useRef(new Animated.Value(animate ? 0 : 1)).current;
  useEffect(() => {
    if (!animate) return;
    Animated.parallel([
      Animated.timing(y, { toValue: 0, duration: 320, delay: index * 80, useNativeDriver: true }),
      Animated.timing(o, { toValue: 1, duration: 320, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, [animate, index, y, o]);

  return (
    <Animated.View style={{ transform: [{ translateY: y }], opacity: o }}>
      <Press
        onPress={onPress}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={`${card.add.name}, ${costLabel(card.tier, card.add.idr, currency)}`}
      >
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <T variant="card">{card.add.name}</T>
            {card.add.local ? <T variant="secondary">{card.add.local}</T> : null}
          </View>
          <T variant="card" style={styles.cost}>
            {costLabel(card.tier, card.add.idr, currency)}
          </T>
        </View>
        <View style={styles.chips}>
          {card.raises.map((p) => (
            <PillarChip key={p} pillar={p} />
          ))}
        </View>
      </Press>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { padding: space.md, marginBottom: space.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  cost: { color: color.sated, marginLeft: space.md, fontVariant: ['tabular-nums'] },
  chips: { flexDirection: 'row', marginTop: space.sm },
});
