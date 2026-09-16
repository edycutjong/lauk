/**
 * Lauk. One flow, so navigation is one switch:
 *
 *   onboarding → plates → (ceiling sheet) → result → cue → faces → plates
 *                   ↘ settings → never-does
 *
 * The RevenueCat gate sits inside the flow: a locked deck tile and the
 * daily cap both open a paywall from PlatesScreen, and the purchase
 * unlocks the very next check without a restart (see src/rc/purchases.ts).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Nunito_600SemiBold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';

import { AppProvider, useApp } from './src/state/AppContext';
import { OnboardingScreen } from './src/screens/Onboarding';
import { PlatesScreen } from './src/screens/Plates';
import { CeilingSheet } from './src/screens/Ceiling';
import { ResultScreen } from './src/screens/Result';
import { FacesScreen } from './src/screens/Faces';
import { SettingsScreen } from './src/screens/Settings';
import { NeverDoesScreen } from './src/screens/NeverDoes';
import type { Add, Plate, Tier } from './src/core/pillars';
import type { Card } from './src/core/rank';
import { color } from './src/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

type Screen =
  | { name: 'plates' }
  | { name: 'result'; plate: Plate; ceiling: Tier; rowTs: number }
  | { name: 'faces'; rowTs: number; add: Add | null }
  | { name: 'settings' }
  | { name: 'never' };

function Root() {
  const app = useApp();
  const [screen, setScreen] = useState<Screen>({ name: 'plates' });
  const [pending, setPending] = useState<Plate | null>(null);

  const onPickCeiling = useCallback(
    async (ceiling: Tier) => {
      if (!pending) return;
      const plate = pending;
      setPending(null);
      const rowTs = await app.logCheck(plate.id, ceiling);
      setScreen({ name: 'result', plate, ceiling, rowTs });
    },
    [pending, app],
  );

  const onResultDone = useCallback(
    (card: Card | null) => {
      if (screen.name !== 'result') return;
      setScreen({ name: 'faces', rowTs: screen.rowTs, add: card?.add ?? null });
    },
    [screen],
  );

  if (!app.prefs.onboarded)
    return <OnboardingScreen onDone={() => setScreen({ name: 'plates' })} />;

  switch (screen.name) {
    case 'result':
      return (
        <ResultScreen
          plate={screen.plate}
          ceiling={screen.ceiling}
          rowTs={screen.rowTs}
          onDone={onResultDone}
        />
      );
    case 'faces':
      return (
        <FacesScreen
          rowTs={screen.rowTs}
          add={screen.add}
          onDone={() => setScreen({ name: 'plates' })}
        />
      );
    case 'settings':
      return (
        <SettingsScreen
          onBack={() => setScreen({ name: 'plates' })}
          onNever={() => setScreen({ name: 'never' })}
        />
      );
    case 'never':
      return <NeverDoesScreen onBack={() => setScreen({ name: 'settings' })} />;
    case 'plates':
    default:
      return (
        <>
          <PlatesScreen onPick={setPending} onSettings={() => setScreen({ name: 'settings' })} />
          <CeilingSheet
            plate={pending}
            currency={app.prefs.currency}
            onPick={onPickCeiling}
            onClose={() => setPending(null)}
          />
        </>
      );
  }
}

function Gate() {
  const app = useApp();
  const [fontsLoaded] = useFonts({ Nunito_600SemiBold, Nunito_800ExtraBold });
  const ready = app.ready && fontsLoaded;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);
  if (!ready)
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={color.sated} />
      </View>
    );
  return <Root />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" backgroundColor={color.bgBase} />
        <Gate />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: color.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
