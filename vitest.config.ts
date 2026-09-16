import { defineConfig } from 'vitest/config';

// The suite covers app/src/core (pure TypeScript, zero react-native imports),
// the RevenueCat access math in app/src/rc/access.ts (a pure function over a
// CustomerInfo-shaped object) and the scripts. Nothing here needs a device, a
// key or a network — that is the judge's no-credential path.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    reporters: ['default'],
  },
});
