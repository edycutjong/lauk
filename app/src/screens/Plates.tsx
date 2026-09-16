/**
 * Four deck rows, three tiles each. A locked tile carries the live price
 * from getOfferings(); tapping it opens the RevenueCat paywall. The
 * "Checks today" chip reads the daily cap from entitlements.
 */
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Pressable';
import { T } from '../components/Text';
import { PlateTile } from '../components/PlateTile';
import { COPY, PLATES } from '../core/content';
import { DECKS, type DeckId, type Plate } from '../core/pillars';
import { canCheck, canUseDeck, checksChip } from '../rc/access';
import { deckPriceLabel, presentCapPaywall, presentDeckPaywall } from '../rc/purchases';
import { useApp } from '../state/AppContext';
import { checksToday } from '../store/storage';
import { color, radius, space } from '../theme/tokens';

export function PlatesScreen({
  onPick,
  onSettings,
}: {
  onPick: (plate: Plate) => void;
  onSettings: () => void;
}) {
  const { info, offering, log, refreshInfo, rcConfigured } = useApp();
  const [busy, setBusy] = useState(false);
  const todayCount = checksToday(log);

  const tap = useCallback(
    async (plate: Plate) => {
      if (busy) return;
      setBusy(true);
      try {
        // Decide on the freshest CustomerInfo, not the closure's: a deck bought on THIS tap
        // raises the daily cap from 1 to 3, and the cap check below must see that.
        let current = info;
        if (!canUseDeck(plate.deck, current)) {
          if (!rcConfigured) return;
          const unlocked = await presentDeckPaywall(plate.deck, plate.name);
          current = (await refreshInfo()) ?? current;
          if (!unlocked) return;
        }
        if (!canCheck(current, todayCount)) {
          if (!rcConfigured) return;
          const ok = await presentCapPaywall();
          current = (await refreshInfo()) ?? current;
          if (!ok) return;
        }
        onPick(plate);
      } finally {
        setBusy(false);
      }
    },
    [busy, info, rcConfigured, todayCount, refreshInfo, onPick],
  );

  return (
    <Screen>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <T variant="title">{COPY.plates.title}</T>
        </View>
        <Press
          onPress={onSettings}
          style={styles.gear}
          accessibilityRole="button"
          accessibilityLabel={COPY.plates.settings}
        >
          <T style={{ fontSize: 20 }}>⚙︎</T>
        </Press>
      </View>
      <View style={styles.chip}>
        <T variant="hairline" style={{ color: color.sated }}>
          {COPY.plates.checksToday}: {checksChip(info, todayCount, COPY.plates.unlimited)}
        </T>
      </View>

      {DECKS.map((deck: DeckId) => {
        const open = canUseDeck(deck, info);
        const price = deck === 'counter' ? null : deckPriceLabel(offering, deck);
        return (
          <View key={deck} style={styles.deck}>
            <T variant="secondary" style={styles.deckTitle}>
              {COPY.decks[deck]}
            </T>
            <View style={styles.row}>
              {PLATES.filter((p) => p.deck === deck).map((p) => (
                <PlateTile
                  key={p.id}
                  plate={p}
                  locked={!open}
                  price={open ? null : price}
                  onPress={() => tap(p)}
                />
              ))}
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-start' },
  gear: { width: 44, height: 44, alignItems: 'center' },
  chip: {
    alignSelf: 'flex-start',
    marginTop: space.sm,
    marginBottom: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    backgroundColor: color.bgElevated,
    borderWidth: 1,
    borderColor: color.border,
  },
  deck: { marginBottom: space.md },
  deckTitle: { marginBottom: space.sm, textTransform: 'uppercase', letterSpacing: 1, fontSize: 13 },
  row: { flexDirection: 'row' },
});
