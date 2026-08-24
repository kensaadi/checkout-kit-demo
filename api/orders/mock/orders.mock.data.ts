import type { Order } from '../orders.types';

export const MOCK_DELAY_MS = 150;

/**
 * In-memory order store for the mock provider, keyed by order id.
 *
 * Shared with the checkout mock — `checkout/mock/checkout.mock.ts`
 * writes to this map when `confirm()` is called, simulating the
 * BE creating an order. Polling from `orders/mock` then reads
 * from this same map.
 *
 * The two mocks couple intentionally on this shared mutable
 * state because the LIVE BE has exactly this coupling internally
 * (checkout writes orders; orders endpoints read them). Mirroring
 * it client-side keeps the mock faithful to BE behaviour.
 */
export const MOCK_ORDERS: Map<string, Order> = new Map();

/**
 * Test helper — wipes the store. Tests call this in `beforeEach`
 * so each case starts from a known baseline.
 */
export function _resetMockOrders(): void {
  MOCK_ORDERS.clear();
}
