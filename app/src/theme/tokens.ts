/**
 * Design tokens — one axis, two states (specs/ui.md).
 *
 *   plate  #C8553D terracotta — the plate as bought; hollow ring segments
 *   sated  #F2B441 amber      — a pillar met; fires when the add lands
 *
 * Nothing else in the app is coloured. There is no green/red "good/bad":
 * a hollow segment is an outline, not a warning. Dark only in v1.
 */
export const color = {
  bgBase: '#1B1917',
  bgElevated: '#26221F',
  bgOverlay: '#2F2A26',
  textHi: '#F5EFE6',
  textMid: '#B8AFA3',
  /** 3.7:1 — hairline labels only, never body text. */
  textLow: '#7A7268',
  plate: '#C8553D',
  sated: '#F2B441',
  border: 'rgba(255,255,255,0.08)',
  onSated: '#1B1917',
} as const;

export const font = {
  display: 'Nunito_800ExtraBold',
  body: 'Nunito_600SemiBold',
} as const;

export const size = {
  title: 28,
  display: 24,
  card: 20,
  body: 17,
  secondary: 15,
  hairline: 13,
} as const;

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 10, md: 16, lg: 22, pill: 999 } as const;
/** Every interactive element: 44 px minimum hit target, pressed = scale 0.97 + elevated bg. */
export const HIT = 44;
