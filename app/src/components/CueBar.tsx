/**
 * The breathing bar: a 2 px amber line that swells 4 s in / 4 s out for
 * 20 seconds under the cue. Reduced motion → a static line.
 */
import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet } from 'react-native';
import { color } from '../theme/tokens';

export function CueBar({ seconds = 20 }: { seconds?: number }) {
  const w = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce) {
        w.setValue(0.7);
        return;
      }
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(w, { toValue: 1, duration: 4000, useNativeDriver: false }),
          Animated.timing(w, { toValue: 0.3, duration: 4000, useNativeDriver: false }),
        ]),
        { iterations: Math.ceil(seconds / 8) },
      );
      loop.start();
    });
    return () => loop?.stop();
  }, [w, seconds]);

  return (
    <Animated.View
      style={[
        styles.bar,
        { width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  bar: { height: 2, backgroundColor: color.sated, alignSelf: 'center', borderRadius: 1 },
});
