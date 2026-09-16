import React from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color, space } from '../theme/tokens';

export function Screen({
  children,
  scroll = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.body, style]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.body, { flex: 1 }, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.bgBase },
  body: { paddingHorizontal: space.md, paddingTop: space.md, paddingBottom: space.xl },
});
