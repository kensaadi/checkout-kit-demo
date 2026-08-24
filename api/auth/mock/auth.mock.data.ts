import { encodeMockJwt } from '../jwt';

export const MOCK_DELAY_MS = 200;

/**
 * Seeded staff accounts for the mock provider. Mirrors
 * `server/seed/users.json` so the DemoSplashPage one-click buttons
 * "just work" with `VITE_PROVIDER=mock` (no BE running).
 *
 * Tokens are mock-signed but carry valid base64-encoded claims so
 * the FE's `decodeJwtPayload` can extract `sub` + `roles`.
 */
export const MOCK_STAFF: Record<string, { password: string; token: string }> = {
  'admin@checkout-kit.local': {
    password: 'AdminPass!2026',
    token: encodeMockJwt({ sub: 'mock-admin-001', roles: ['admin'] }),
  },
  'sales@checkout-kit.local': {
    password: 'SalesPass!2026',
    token: encodeMockJwt({ sub: 'mock-sales-001', roles: ['sales'] }),
  },
};

/**
 * Seeded customer accounts. Mirrors `server/seed/customers.json`.
 */
export const MOCK_CUSTOMERS: Record<
  string,
  { password: string; token: string }
> = {
  'bob.buyer@example.com': {
    password: 'BuyerPass!2026',
    token: encodeMockJwt({ sub: 'mock-customer-001', roles: ['customer'] }),
  },
};
