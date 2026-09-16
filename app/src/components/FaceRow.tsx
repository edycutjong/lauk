import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Press } from './Pressable';
import { T } from './Text';
import type { Face } from '../core/weights';
import { space } from '../theme/tokens';

export const FACE_GLYPH: Record<Face, string> = { 0: '😕', 1: '🙂', 2: '😌' };

export function FaceRow({
  labels,
  onPick,
}: {
  labels: Record<Face, string>;
  onPick: (f: Face) => void;
}) {
  return (
    <View style={styles.row}>
      {([0, 1, 2] as Face[]).map((f) => (
        <Press
          key={f}
          onPress={() => onPick(f)}
          style={styles.face}
          accessibilityRole="button"
          accessibilityLabel={labels[f]}
        >
          <T style={styles.glyph}>{FACE_GLYPH[f]}</T>
          <T variant="secondary" style={{ textAlign: 'center' }}>
            {labels[f]}
          </T>
        </Press>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  face: { flex: 1, alignItems: 'center', paddingVertical: space.md, marginHorizontal: space.xs },
  glyph: { fontSize: 44, lineHeight: 56 },
});
