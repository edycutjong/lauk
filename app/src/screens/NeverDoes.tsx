/**
 * The denylist, rendered from lint.ts's BANNED constant — the one string
 * source the copy-lint deliberately does not scan (docs/RANKER.md).
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Pressable';
import { T } from '../components/Text';
import { COPY } from '../core/content';
import { BANNED } from '../core/lint';
import { color, radius, space } from '../theme/tokens';

export function NeverDoesScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen>
      <View style={styles.top}>
        <Press
          onPress={onBack}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="back"
        >
          <T style={{ fontSize: 20 }}>←</T>
        </Press>
        <T variant="title" style={{ flex: 1 }}>
          {COPY.never.title}
        </T>
      </View>
      <T variant="secondary" style={{ marginVertical: space.md }}>
        {COPY.never.line}
      </T>
      <View style={styles.wrap}>
        {BANNED.map((w) => (
          <View key={w} style={styles.word}>
            <T
              variant="secondary"
              style={{ color: color.plate, textDecorationLine: 'line-through' }}
            >
              {w}
            </T>
          </View>
        ))}
      </View>
      <T variant="secondary" style={{ marginTop: space.lg }}>
        {COPY.never.also}
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center' },
  back: { width: 44, height: 44, alignItems: 'center', marginRight: space.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  word: {
    borderWidth: 1,
    borderColor: color.plate,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm + 2,
    paddingVertical: 2,
    marginRight: space.sm,
    marginBottom: space.sm,
  },
});
