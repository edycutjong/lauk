import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Press } from './Pressable';
import { T } from './Text';
import type { Plate } from '../core/pillars';
import { color, radius, space } from '../theme/tokens';

export function PlateTile({
  plate,
  locked,
  price,
  onPress,
}: {
  plate: Plate;
  locked: boolean;
  price: string | null;
  onPress: () => void;
}) {
  return (
    <Press
      onPress={onPress}
      style={[styles.tile, locked && styles.locked]}
      accessibilityRole="button"
      accessibilityLabel={locked ? `${plate.name}, locked${price ? `, ${price}` : ''}` : plate.name}
    >
      <T variant="body" style={styles.name} numberOfLines={2}>
        {plate.name}
      </T>
      {plate.local ? (
        <T variant="hairline" numberOfLines={1}>
          {plate.local}
        </T>
      ) : null}
      {locked ? (
        <View style={styles.badge}>
          <T variant="hairline" style={styles.badgeText}>
            {price ? `🔒 ${price}` : '🔒'}
          </T>
        </View>
      ) : null}
    </Press>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 96,
    padding: space.sm + 4,
    justifyContent: 'flex-start',
    marginRight: space.sm,
  },
  locked: { opacity: 0.6 },
  name: { fontFamily: 'Nunito_800ExtraBold', lineHeight: 22 },
  badge: {
    marginTop: 'auto',
    alignSelf: 'flex-start',
    backgroundColor: color.bgOverlay,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: color.sated,
    fontFamily: 'Nunito_800ExtraBold',
    fontVariant: ['tabular-nums'],
  },
});
