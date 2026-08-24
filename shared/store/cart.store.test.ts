import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartView } from '@api/cart/cart.types';

// `vi.mock` is hoisted to the top of the file by Vitest, so any
// helper it references must also be hoisted via `vi.hoisted`.
// Plain `const` declarations at module scope would be hoisted
// AFTER the mock and fail with "cannot access before init".
const { SAMPLE_CART, mockGetCart } = vi.hoisted(() => {
  const SAMPLE_CART: CartView = {
    id: 'c1',
    customerId: 'cust1',
    currency: 'usd',
    items: [
      {
        productId: 'p1',
        quantity: 2,
        name: 'Gold',
        slug: 'gold',
        coverUrl: null,
        price: 4900,
        lineTotal: 9800,
      },
      {
        productId: 'p2',
        quantity: 3,
        name: 'Silver',
        slug: 'silver',
        coverUrl: null,
        price: 1900,
        lineTotal: 5700,
      },
    ],
    itemsTotal: 15500,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
  return { SAMPLE_CART, mockGetCart: vi.fn() };
});

vi.mock('@api/cart/cart.service', () => ({
  get_cart: mockGetCart,
}));

import {
  cartStore,
  refreshCart,
  resetCartStore,
} from './cart.store';

beforeEach(() => {
  resetCartStore();
  vi.clearAllMocks();
});

describe('refreshCart', () => {
  it('populates the store on success', async () => {
    mockGetCart.mockResolvedValueOnce({ data: SAMPLE_CART, error: null });
    await refreshCart();
    expect(cartStore.cart).toEqual(SAMPLE_CART);
    expect(cartStore.loaded).toBe(true);
  });

  it('does NOT mutate the store on failure (preserves last good state)', async () => {
    // First call populates the store
    mockGetCart.mockResolvedValueOnce({ data: SAMPLE_CART, error: null });
    await refreshCart();

    // Second call fails — the store should keep the previous cart
    mockGetCart.mockResolvedValueOnce({
      data: null,
      error: { code: 'NETWORK_ERROR', message: 'offline' },
    });
    await refreshCart();
    expect(cartStore.cart).toEqual(SAMPLE_CART);
    expect(cartStore.loaded).toBe(true);
  });
});

describe('resetCartStore', () => {
  it('clears the store back to initial state', async () => {
    mockGetCart.mockResolvedValueOnce({ data: SAMPLE_CART, error: null });
    await refreshCart();
    expect(cartStore.cart).not.toBeNull();

    resetCartStore();
    expect(cartStore.cart).toBeNull();
    expect(cartStore.loaded).toBe(false);
  });
});
