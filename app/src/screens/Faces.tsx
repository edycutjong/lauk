/**
 * After the meal: three faces, then the week strip. No streaks, no misses;
 * an empty day is blank, never red. The face re-weights tomorrow's cards.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Pressable';
import { T } from '../components/Text';
import { FaceRow } from '../components/FaceRow';
import { WeekStrip } from '../components/WeekStrip';
import { COPY } from '../core/content';
import type { Add } from '../core/pillars';
import type { Face } from '../core/weights';
import { useApp } from '../state/AppContext';
import { weekStrip } from '../store/storage';
import { space } from '../theme/tokens';

export function FacesScreen({
  rowTs,
  add,
  onDone,
}: {
  rowTs: number;
  add: Add | null;
  onDone: () => void;
}) {
  const { log, logFace } = useApp();
  const pick = async (f: Face) => {
    await logFace(rowTs, add, f);
    onDone();
  };
  return (
    <Screen scroll={false}>
      <View style={{ flex: 1 }} />
      <T variant="display" style={{ textAlign: 'center' }}>
        {COPY.faces.title}
      </T>
      <View style={{ height: space.lg }} />
      <FaceRow
        labels={{ 0: COPY.faces.hungry, 1: COPY.faces.fine, 2: COPY.faces.satisfied }}
        onPick={pick}
      />
      <View style={{ height: space.xl }} />
      <T variant="hairline" style={{ textAlign: 'center', marginBottom: space.sm }}>
        {COPY.faces.week}
      </T>
      <WeekStrip days={weekStrip(log)} />
      <View style={{ flex: 1 }} />
      <Press elevated={false} onPress={onDone} style={styles.later} accessibilityRole="button">
        <T variant="secondary" style={{ textAlign: 'center' }}>
          {COPY.faces.later}
        </T>
      </Press>
    </Screen>
  );
}

const styles = StyleSheet.create({ later: { alignSelf: 'center', paddingHorizontal: space.lg } });
