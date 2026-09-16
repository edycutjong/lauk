/**
 * Once. Three big buttons set `eating_context`, which becomes a RevenueCat
 * customer attribute — the dashboard Targeting rule reads it to serve the
 * `decks_student` offering (Semester pass first) at placement `second_deck`.
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Pressable';
import { T } from '../components/Text';
import { COPY } from '../core/content';
import type { EatingContext } from '../rc/purchases';
import { useApp } from '../state/AppContext';
import { space } from '../theme/tokens';

const OPTIONS: { ctx: EatingContext; label: string }[] = [
  { ctx: 'student', label: COPY.onboarding.student },
  { ctx: 'office', label: COPY.onboarding.office },
  { ctx: 'road', label: COPY.onboarding.road },
];

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { setContext } = useApp();
  const [busy, setBusy] = useState(false);
  return (
    <Screen scroll={false} style={styles.body}>
      <View style={{ flex: 1 }} />
      <T variant="title">{COPY.onboarding.title}</T>
      <View style={{ height: space.lg }} />
      {OPTIONS.map((o) => (
        <Press
          key={o.ctx}
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            await setContext(o.ctx);
            onDone();
          }}
          style={styles.option}
          accessibilityRole="button"
        >
          <T variant="card">{o.label}</T>
        </Press>
      ))}
      <View style={{ flex: 1 }} />
      <T variant="secondary" style={{ textAlign: 'center' }}>
        {COPY.onboarding.footer}
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { justifyContent: 'flex-end' },
  option: { padding: space.lg, marginBottom: space.sm },
});
