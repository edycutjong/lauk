import React from 'react';
import { StyleSheet, View } from 'react-native';
import { T } from './Text';
import type { Pillar } from '../core/pillars';
import { color, radius, space } from '../theme/tokens';

export function PillarChip({ pillar, lit = true }: { pillar: Pillar; lit?: boolean }) {
  return (
    <View style={[styles.chip, lit ? styles.lit : styles.hollow]}>
      <T variant="hairline" style={{ color: lit ? color.onSated : color.plate }}>
        {pillar}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginRight: space.xs,
  },
  lit: { backgroundColor: color.sated },
  hollow: { borderWidth: 1, borderColor: color.plate },
});
