import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

/**
 * Root vitest config for the client/ workspace.
 *
 * Tests run in Node (no DOM). Component tests in mui/ and tailwind/
 * use their own vitest config when they land, with a happy-dom or
 * jsdom environment.
 *
 * The path aliases mirror tsconfig.base.json so test imports look
 * identical to source imports (`@api/...`, `@shared/...`).
 */
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['api/**/*.test.{ts,tsx}', 'shared/**/*.test.{ts,tsx}'],
    env: {
      // Default env values used by `api/_shared/config.ts` at module load.
      // Tests that need specific values can override via `vi.stubEnv(...)`.
      VITE_APP_API_HOST: 'http://localhost:3333',
      VITE_STRIPE_PK: 'pk_test_fake',
      VITE_PROVIDER: 'mock',
    },
  },
  resolve: {
    alias: {
      '@api': fileURLToPath(new URL('./api', import.meta.url)),
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
});
