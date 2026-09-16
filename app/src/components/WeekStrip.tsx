/**
 * Seven dots. A dot shows the face logged that day; an empty day is a
 * hairline dot — never red, never a number, no streak text anywhere.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { T } from './Text';
import { FACE_GLYPH } from './FaceRow';
import type { Face } from '../core/weights';
import { color, space } from '../theme/tokens';

export function WeekStrip({ days }: { days: { day: string; face: Face | null }[] }) {
  return (
    <View style={styles.row}>
      {days.map((d, i) => {
        const isToday = i === days.length - 1;
        return (
          <View
            key={d.day}
            style={[styles.slot, isToday && styles.today]}
            accessibilityLabel={d.face === null ? 'no entry' : FACE_GLYPH[d.face]}
          >
            {d.face === null ? (
              <View style={styles.empty} />
            ) : (
              <T style={styles.glyph}>{FACE_GLYPH[d.face]}</T>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.sm },
  slot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1.5, borderColor: color.sated },
  empty: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: color.textLow },
  glyph: { fontSize: 20, lineHeight: 26 },
});
