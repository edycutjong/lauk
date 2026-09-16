/**
 * Decks shelf (getOfferings → purchasePackage), Restore, Customer Center,
 * eating context, the five weight bars, "What Lauk never does", About.
 */
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { Screen } from '../components/Screen';
import { Press } from '../components/Pressable';
import { T } from '../components/Text';
import { ADDS, CONTENT_HASH, COPY, PLATES } from '../core/content';
import { PILLARS, type DeckId } from '../core/pillars';
import { W_MAX, W_MIN } from '../core/weights';
import { canUseDeck, hasUnlimited } from '../rc/access';
import {
  buyPackage,
  packageForDeck,
  presentCustomerCenter,
  restore,
  unlimitedPackages,
  type EatingContext,
} from '../rc/purchases';
import { useApp } from '../state/AppContext';
import { color, radius, space } from '../theme/tokens';

const CONTEXTS: { ctx: EatingContext; label: string }[] = [
  { ctx: 'student', label: COPY.onboarding.student },
  { ctx: 'office', label: COPY.onboarding.office },
  { ctx: 'road', label: COPY.onboarding.road },
];

export function SettingsScreen({ onBack, onNever }: { onBack: () => void; onNever: () => void }) {
  const { info, offering, prefs, weights, rcConfigured, setContext, refreshInfo, resetLearned } =
    useApp();
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(key);
    setNote(null);
    try {
      await fn();
    } catch (e) {
      setNote(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const buy = (pkg: PurchasesPackage) =>
    run(pkg.identifier, async () => {
      const r = await buyPackage(pkg);
      if (r) await refreshInfo();
    });

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
        <T variant="title">{COPY.settings.title}</T>
      </View>

      {/* ── Decks shelf ── */}
      <T variant="secondary" style={styles.h}>
        {COPY.decksShelf.title}
      </T>
      {!rcConfigured ? (
        <T variant="hairline" style={{ marginBottom: space.md }}>
          No RevenueCat key configured for this build — the shelf is empty. See README → Setup.
        </T>
      ) : null}
      {(['instant', 'delivery', 'cafeteria'] as Exclude<DeckId, 'counter'>[]).map((deck) => {
        const pkg = packageForDeck(offering, deck);
        const owned = canUseDeck(deck, info);
        return (
          <View key={deck} style={styles.rowCard}>
            <View style={{ flex: 1 }}>
              <T variant="card">{COPY.decks[deck]} deck</T>
              <T variant="secondary">
                {PLATES.filter((p) => p.deck === deck)
                  .map((p) => p.name)
                  .join(' · ')}
              </T>
            </View>
            {owned ? (
              <T variant="hairline" style={{ color: color.sated }}>
                {COPY.decksShelf.owned}
              </T>
            ) : pkg ? (
              <Press
                onPress={() => buy(pkg)}
                disabled={busy !== null}
                style={styles.buy}
                accessibilityRole="button"
              >
                <T
                  variant="secondary"
                  style={{ color: color.onSated, fontFamily: 'Nunito_800ExtraBold' }}
                >
                  {pkg.product.priceString} {COPY.decksShelf.once}
                </T>
              </Press>
            ) : (
              <T variant="hairline">—</T>
            )}
          </View>
        );
      })}
      <View style={styles.rowCard}>
        <View style={{ flex: 1 }}>
          <T variant="card">{COPY.decksShelf.unlimitedTitle}</T>
          <T variant="secondary">{COPY.decksShelf.unlimitedBody}</T>
        </View>
        {hasUnlimited(info) ? (
          <T variant="hairline" style={{ color: color.sated }}>
            {COPY.decksShelf.owned}
          </T>
        ) : (
          <View>
            {unlimitedPackages(offering).map((pkg) => (
              <Press
                key={pkg.identifier}
                onPress={() => buy(pkg)}
                disabled={busy !== null}
                style={[styles.buy, { marginBottom: space.xs }]}
                accessibilityRole="button"
              >
                <T
                  variant="secondary"
                  style={{ color: color.onSated, fontFamily: 'Nunito_800ExtraBold' }}
                >
                  {pkg.product.priceString}
                </T>
              </Press>
            ))}
          </View>
        )}
      </View>
      <View style={styles.inline}>
        <Press
          elevated={false}
          disabled={!rcConfigured}
          onPress={() =>
            run('restore', async () => {
              await restore();
              await refreshInfo();
            })
          }
          accessibilityRole="button"
        >
          <T variant="secondary" style={styles.link}>
            {COPY.decksShelf.restore}
          </T>
        </Press>
        <Press
          elevated={false}
          disabled={!rcConfigured}
          onPress={() => run('manage', presentCustomerCenter)}
          accessibilityRole="button"
        >
          <T variant="secondary" style={styles.link}>
            {COPY.decksShelf.manage}
          </T>
        </Press>
      </View>
      {note ? <T variant="hairline">{note}</T> : null}

      {/* ── Eating context ── */}
      <T variant="secondary" style={styles.h}>
        {COPY.settings.context}
      </T>
      <View style={{ flexDirection: 'row' }}>
        {CONTEXTS.map((c) => (
          <Press
            key={c.ctx}
            onPress={() => setContext(c.ctx)}
            style={[styles.ctx, prefs.eating_context === c.ctx && styles.ctxOn]}
            accessibilityRole="button"
          >
            <T
              variant="secondary"
              style={prefs.eating_context === c.ctx ? { color: color.onSated } : undefined}
            >
              {c.label}
            </T>
          </Press>
        ))}
      </View>

      {/* ── Learned weights ── */}
      <View style={[styles.top, { marginTop: space.lg }]}>
        <T variant="secondary" style={[styles.h, { flex: 1, marginTop: 0 }]}>
          {COPY.settings.learned}
        </T>
        <Press elevated={false} onPress={resetLearned} accessibilityRole="button">
          <T variant="hairline" style={styles.link}>
            {COPY.settings.reset}
          </T>
        </Press>
      </View>
      {PILLARS.map((p) => (
        <View key={p} style={styles.bar}>
          <T variant="hairline" style={{ width: 64 }}>
            {p}
          </T>
          <View style={styles.track}>
            <View
              style={[styles.fill, { width: `${((weights[p] - W_MIN) / (W_MAX - W_MIN)) * 100}%` }]}
            />
          </View>
          <T variant="hairline" style={{ width: 40, textAlign: 'right' }}>
            {weights[p].toFixed(2)}
          </T>
        </View>
      ))}

      {/* ── Never / About ── */}
      <Press
        onPress={onNever}
        style={[styles.rowCard, { marginTop: space.lg }]}
        accessibilityRole="button"
      >
        <T variant="card">{COPY.settings.never}</T>
        <T style={{ fontSize: 18 }}>→</T>
      </Press>
      <T variant="secondary" style={styles.h}>
        {COPY.settings.about}
      </T>
      <T variant="hairline">
        {COPY.settings.content}: {PLATES.length} plates · {ADDS.length} adds ·{' '}
        {CONTENT_HASH.slice(0, 12)}
      </T>
      <T variant="hairline">{COPY.app.tagline}</T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center' },
  back: { width: 44, height: 44, alignItems: 'center', marginRight: space.sm },
  h: {
    marginTop: space.lg,
    marginBottom: space.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 13,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.md,
    marginBottom: space.sm,
    backgroundColor: color.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
  },
  buy: {
    backgroundColor: color.sated,
    borderColor: color.sated,
    paddingHorizontal: space.md,
    marginLeft: space.md,
  },
  inline: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.xs },
  link: { color: color.sated, paddingVertical: space.sm },
  ctx: { flex: 1, alignItems: 'center', paddingVertical: space.sm, marginRight: space.sm },
  ctxOn: { backgroundColor: color.sated, borderColor: color.sated },
  bar: { flexDirection: 'row', alignItems: 'center', marginBottom: space.sm },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.bgElevated,
    marginHorizontal: space.sm,
    overflow: 'hidden',
  },
  fill: { height: 6, backgroundColor: color.sated },
});
