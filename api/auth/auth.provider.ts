import { PROVIDER } from '@api/_shared/config';
import type { LoginInput, LoginResult } from './auth.types';

/**
 * Contract every auth provider must implement.
 *
 * Two methods, one per BE endpoint:
 *   - `loginStaff`    → POST /v1/auth/login
 *   - `loginCustomer` → POST /v1/auth/customer-login
 *
 * The kit keeps them as separate methods (rather than a single
 * function with a `kind` argument) because the URLs differ and
 * because the snake_case service surface stays cleaner.
 */
export interface AuthProvider {
  loginStaff(input: LoginInput): Promise<LoginResult>;
  loginCustomer(input: LoginInput): Promise<LoginResult>;
}

const authProviderMapping: Record<string, () => Promise<AuthProvider>> = {
  live: () =>
    import('./live/auth.live').then((m) => m.default as AuthProvider),
  mock: () =>
    import('./mock/auth.mock').then((m) => m.default as AuthProvider),
};

export async function authProvider(): Promise<AuthProvider> {
  const loader = authProviderMapping[PROVIDER];
  if (!loader) {
    throw new Error(`[auth] provider "${PROVIDER}" not supported`);
  }
  return loader();
}
