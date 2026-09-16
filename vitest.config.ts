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
    // Only bites on `npm run test:coverage` (which passes --coverage.enabled);
    // plain `npm test` never turns coverage collection on, so this block is
    // inert there. The include set itself is passed via that script's CLI
    // flags, not here — this just gates the number once it's collected.
    coverage: {
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
