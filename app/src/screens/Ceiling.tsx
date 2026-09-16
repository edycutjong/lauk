/** Bottom sheet: four chips with the currency line under each. Tap = go. */
import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Press } from '../components/Pressable';
import { T } from '../components/Text';
import { COPY } from '../core/content';
import { TIERS, type Plate, type Tier } from '../core/pillars';
import { ceilingLabel } from '../core/tiers';
import { color, radius, space } from '../theme/tokens';

export function CeilingSheet({
  plate,
  currency,
  onPick,
  onClose,
}: {
  plate: Plate | null;
  currency: string;
  onPick: (t: Tier) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={plate !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="close" />
      <View style={styles.sheet}>
        <T variant="hairline">{plate?.name}</T>
        <T variant="display" style={{ marginTop: space.xs, marginBottom: space.md }}>
          {COPY.ceiling.title}
        </T>
        <View style={styles.grid}>
          {TIERS.map((t) => (
            <Press
              key={t}
              onPress={() => onPick(t)}
              style={styles.chip}
              accessibilityRole="button"
              accessibilityLabel={`${COPY.ceiling.tiers[t]}, ${ceilingLabel(t, currency)}`}
            >
              <T variant="card">{COPY.ceiling.tiers[t]}</T>
              <T variant="secondary">{ceilingLabel(t, currency)}</T>
            </Press>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: color.bgOverlay,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: space.lg,
    paddingBottom: space.xl,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -space.xs },
  chip: { width: '47%', margin: '1.5%', padding: space.md },
});
