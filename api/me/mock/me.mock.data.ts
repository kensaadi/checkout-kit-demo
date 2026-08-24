import type { CustomerProfile, StaffProfile } from '../me.types';

export const MOCK_DELAY_MS = 200;

/**
 * Mock staff profiles keyed by JWT `sub` claim. The auth.mock
 * tokens encode these exact sub values, so the me-mock can resolve
 * "currently logged in" by decoding the token in authStore.
 *
 * Mirrors `server/seed/users.json`.
 */
export const MOCK_STAFF_PROFILES: Record<string, StaffProfile> = {
  'mock-admin-001': {
    id: 'mock-admin-001',
    email: 'admin@checkout-kit.local',
    name: 'Admin User',
    roles: ['admin'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  'mock-sales-001': {
    id: 'mock-sales-001',
    email: 'sales@checkout-kit.local',
    name: 'Sales User',
    roles: ['sales'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
};

/**
 * Mock customer profile. Mirrors `server/seed/customers.json`.
 *
 * Mutable at module scope so `updateCustomerMe` and
 * `changeCustomerPassword` in the mock can persist between calls
 * within a single browser session.
 */
export const MOCK_CUSTOMER_PROFILES: Record<string, CustomerProfile> = {
  'mock-customer-001': {
    id: 'mock-customer-001',
    email: 'bob.buyer@example.com',
    firstName: 'Bob',
    lastName: 'Buyer',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
};

/**
 * Mock current password for the seeded customer — used by
 * `changeCustomerPassword` to validate the "current" credential.
 * Matches `MOCK_CUSTOMERS` in `api/auth/mock/auth.mock.data.ts`.
 *
 * Kept mutable so a successful change updates it.
 */
export const MOCK_CUSTOMER_PASSWORDS: Record<string, string> = {
  'mock-customer-001': 'BuyerPass!2026',
};
