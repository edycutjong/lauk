/**
 * Every interactive element: 44 px minimum hit target, pressed state =
 * scale 0.97 + elevated background. One component so the rule holds.
 */
import React from 'react';
import {
  Pressable as RNPressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { HIT, color, radius } from '../theme/tokens';

export function Press({
  style,
  children,
  elevated = true,
  ...rest
}: PressableProps & {
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  children: React.ReactNode;
}) {
  return (
    <RNPressable
      {...rest}
      style={({ pressed }) => [
        styles.base,
        elevated && styles.elevated,
        style,
        pressed && { transform: [{ scale: 0.97 }], backgroundColor: color.bgOverlay },
      ]}
    >
      {children}
    </RNPressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: HIT, minWidth: HIT, justifyContent: 'center', borderRadius: radius.md },
  elevated: { backgroundColor: color.bgElevated, borderWidth: 1, borderColor: color.border },
});
