/**
 * The RevenueCat surface — every SDK call the app makes lives in this file.
 *
 * Remove it and every deck but Counter is permanently locked, the second
 * check of the day dead-ends, the Semester pass never appears, and restore /
 * manage vanish: the app collapses to a one-deck, one-check toy. That is the
 * point — the SDK is the engine, not a purchase button bolted on at the end.
 *
 * Twelve calls, numbered so the audit can grep them:
 *   1 configure · 2 setAttributes · 3 syncAttributesAndOfferingsIfNeeded
 *   4 getOfferings · 5 getCurrentOfferingForPlacement · 6 purchasePackage
 *   7 getCustomerInfo · 8 addCustomerInfoUpdateListener · 9 restorePurchases
 *   10 presentPaywall · 11 presentPaywallIfNeeded · 12 presentCustomerCenter
 */
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesOfferings,
  type PurchasesPackage,
} from 'react-native-purchases';
import RevenueCatUI, { CustomVariableValue, PAYWALL_RESULT } from 'react-native-purchases-ui';
import type { DeckId } from '../core/pillars';
import { DECK_ENTITLEMENT, ENT_UNLIMITED } from './access';

export type EatingContext = 'student' | 'office' | 'road';

/** Placement the locked-tile paywall is fetched from; Targeting serves `decks_student` here for students. */
export const PLACEMENT_SECOND_DECK = 'second_deck';
export const OFFERING_DECKS = 'decks';
export const OFFERING_STUDENT = 'decks_student';

/**
 * Which public key this build talks to. Test Store in development (instant,
 * no-charge purchases), Google Play on the release build. Both keys are
 * public SDK keys sourced from ~/.config/lauk/ into EXPO_PUBLIC_* — never a
 * secret key, never a file in this tree.
 */
export function resolveApiKey(): { key: string; store: 'TEST' | 'GOOGLE' } {
  const store = process.env.EXPO_PUBLIC_RC_STORE === 'GOOGLE' ? 'GOOGLE' : 'TEST';
  const key =
    store === 'GOOGLE'
      ? process.env.EXPO_PUBLIC_RC_GOOGLE_KEY
      : process.env.EXPO_PUBLIC_RC_TEST_KEY;
  return { key: key ?? '', store };
}

/** 1. Purchases.configure — anonymous app user id; no login, no account. */
export function configurePurchases(): boolean {
  const { key } = resolveApiKey();
  if (!key) return false;
  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey: key });
  return true;
}

/**
 * 2 + 3. setAttributes({ eating_context }) → syncAttributesAndOfferingsIfNeeded.
 *
 * The attribute drives a dashboard Targeting rule ("eating_context is student
 * → offering decks_student at placement second_deck"). The sync call exists
 * precisely for this — it pushes the attribute and refetches offerings so
 * the very next placement read reflects the rule. It is throttled by the
 * SDK; onboarding sets the attribute once, so the throttle never bites.
 */
export async function setEatingContext(ctx: EatingContext): Promise<PurchasesOfferings> {
  Purchases.setAttributes({ eating_context: ctx });
  return Purchases.syncAttributesAndOfferingsIfNeeded();
}

/** 4. getOfferings — the deck shelf and the price badges on locked tiles render from this. */
export async function getOfferings(): Promise<PurchasesOfferings> {
  return Purchases.getOfferings();
}

/** 5. getCurrentOfferingForPlacement — what the locked tile's paywall shows (Targeting-aware). */
export async function getSecondDeckOffering(): Promise<PurchasesOffering | null> {
  return Purchases.getCurrentOfferingForPlacement(PLACEMENT_SECOND_DECK);
}

/** 6. purchasePackage — from the Decks shelf. `null` = the user cancelled. */
export async function buyPackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (e: unknown) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'userCancelled' in e &&
      (e as { userCancelled?: boolean }).userCancelled
    )
      return null;
    throw e;
  }
}

/** 7. getCustomerInfo — the gate reads entitlements.active from this. */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

/** 8. addCustomerInfoUpdateListener — a trial converting or a purchase landing re-renders every tile. */
export function onCustomerInfo(cb: (info: CustomerInfo) => void): () => void {
  Purchases.addCustomerInfoUpdateListener(cb);
  return () => Purchases.removeCustomerInfoUpdateListener(cb);
}

/** 9. restorePurchases — reinstall / device swap, from Settings. */
export async function restore(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

/**
 * 10. presentPaywall — a locked deck tile. The offering comes from the
 * placement (5), so a student sees the Semester pass first. The paywall
 * headline names the tapped plate through a custom variable.
 */
export async function presentDeckPaywall(deck: DeckId, plateName: string): Promise<boolean> {
  const offering = await getSecondDeckOffering();
  const result = await RevenueCatUI.presentPaywall({
    offering: offering ?? undefined,
    displayCloseButton: true,
    customVariables: {
      deck: CustomVariableValue.string(deck),
      plate: CustomVariableValue.string(plateName),
    },
  });
  return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
}

/** 11. presentPaywallIfNeeded — the daily cap. Shows nothing if `unlimited` is already active. */
export async function presentCapPaywall(): Promise<boolean> {
  const result = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: ENT_UNLIMITED,
    displayCloseButton: true,
  });
  return (
    result === PAYWALL_RESULT.PURCHASED ||
    result === PAYWALL_RESULT.RESTORED ||
    result === PAYWALL_RESULT.NOT_PRESENTED
  );
}

/** 12. presentCustomerCenter — manage / cancel the subscription, from Settings. */
export async function presentCustomerCenter(): Promise<void> {
  await RevenueCatUI.presentCustomerCenter();
}

// ── helpers over offerings (pure) ────────────────────────────────────────────

/** The package that unlocks a deck, from an offering. Products are named after the entitlement. */
export function packageForDeck(
  offering: PurchasesOffering | null,
  deck: Exclude<DeckId, 'counter'>,
): PurchasesPackage | null {
  const wanted = DECK_ENTITLEMENT[deck];
  return offering?.availablePackages.find((p) => p.product.identifier.startsWith(wanted)) ?? null;
}

export function unlimitedPackages(offering: PurchasesOffering | null): PurchasesPackage[] {
  return (
    offering?.availablePackages.filter((p) => p.product.identifier.startsWith(ENT_UNLIMITED)) ?? []
  );
}

/** The badge on a locked tile — the store's own localized price string. */
export function deckPriceLabel(
  offering: PurchasesOffering | null,
  deck: Exclude<DeckId, 'counter'>,
): string | null {
  return packageForDeck(offering, deck)?.product.priceString ?? null;
}
