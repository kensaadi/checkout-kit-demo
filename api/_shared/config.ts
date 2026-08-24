/**
 * Runtime configuration for the API layer.
 *
 * Read from Vite's import.meta.env at module load. Missing required
 * variables throw immediately so the app refuses to boot with a
 * broken configuration (loud-fail instead of a silent 500 on the
 * first request).
 *
 * Required:
 *   - VITE_APP_API_HOST — base URL of the BE (e.g. http://localhost:3333)
 *   - VITE_STRIPE_PK    — Stripe publishable key (pk_test_...)
 *
 * Optional:
 *   - VITE_PROVIDER     — 'live' (default) or 'mock'
 */

function required(key: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(`[config] missing required env var: ${key}`);
  }
  return value;
}

export type ProviderType = 'live' | 'mock';

export const PROVIDER: ProviderType =
  (import.meta.env.VITE_PROVIDER as ProviderType | undefined) ?? 'live';

export const API_HOST: string = required(
  'VITE_APP_API_HOST',
  import.meta.env.VITE_APP_API_HOST as string | undefined,
);

export const STRIPE_PK: string = required(
  'VITE_STRIPE_PK',
  import.meta.env.VITE_STRIPE_PK as string | undefined,
);

export const IS_STRIPE_TEST_MODE: boolean = STRIPE_PK.startsWith('pk_test_');
