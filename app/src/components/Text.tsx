import React from 'react';
import { Text as RNText, StyleSheet, type TextProps } from 'react-native';
import { color, font, size } from '../theme/tokens';

type Variant = 'title' | 'display' | 'card' | 'body' | 'secondary' | 'hairline';

export function T({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  return (
    <RNText {...rest} style={[styles.base, styles[variant], style]} maxFontSizeMultiplier={1.3} />
  );
}

const styles = StyleSheet.create({
  base: { color: color.textHi, fontFamily: font.body },
  title: { fontFamily: font.display, fontSize: size.title, lineHeight: 34 },
  display: { fontFamily: font.display, fontSize: size.display, lineHeight: 30 },
  card: { fontFamily: font.display, fontSize: size.card, lineHeight: 26 },
  body: { fontSize: size.body, lineHeight: 24 },
  secondary: { fontSize: size.secondary, lineHeight: 21, color: color.textMid },
  hairline: { fontSize: size.hairline, lineHeight: 18, color: color.textLow },
});
