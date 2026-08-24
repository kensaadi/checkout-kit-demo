import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartView } from './cart.types';

const { SAMPLE_CART, mockProvider } = vi.hoisted(() => {
  const SAMPLE_CART: CartView = {
    id: 'mock-cart-001',
    customerId: 'mock-customer-001',
    currency: 'usd',
    items: [],
    itemsTotal: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
  return {
    SAMPLE_CART,
    mockProvider: {
      getCart: vi.fn(),
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
    },
  };
});

vi.mock('./cart.provider', () => ({
  cartProvider: () => Promise.resolve(mockProvider),
}));

import {
  add_item,
  clear_cart,
  get_cart,
  remove_item,
  update_item,
} from './cart.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('get_cart', () => {
  it('returns Result.data on success', async () => {
    mockProvider.getCart.mockResolvedValueOnce(SAMPLE_CART);
    const r = await get_cart();
    expect(r.error).toBeNull();
    expect(r.data).toEqual(SAMPLE_CART);
  });

  it('returns Result.error when the provider rejects with an ApiError', async () => {
    const apiError = {
      code: 'UNAUTHORIZED' as const,
      message: 'no token',
      status: 401,
    };
    mockProvider.getCart.mockRejectedValueOnce(apiError);
    const r = await get_cart();
    expect(r.data).toBeNull();
    expect(r.error).toEqual(apiError);
  });

  it('wraps a plain Error rejection into UNKNOWN', async () => {
    mockProvider.getCart.mockRejectedValueOnce(new Error('something broke'));
    const r = await get_cart();
    expect(r.data).toBeNull();
    expect(r.error?.code).toBe('UNKNOWN');
    expect(r.error?.message).toBe('something broke');
  });
});

describe('add_item', () => {
  it('forwards the input to provider.addItem', async () => {
    mockProvider.addItem.mockResolvedValueOnce(SAMPLE_CART);
    await add_item({ productId: 'p1', quantity: 2 });
    expect(mockProvider.addItem).toHaveBeenCalledWith({
      productId: 'p1',
      quantity: 2,
    });
  });

  it('returns the cart view on success', async () => {
    mockProvider.addItem.mockResolvedValueOnce(SAMPLE_CART);
    const r = await add_item({ productId: 'p1', quantity: 1 });
    expect(r.data).toEqual(SAMPLE_CART);
  });
});

describe('update_item', () => {
  it('passes productId and input separately', async () => {
    mockProvider.updateItem.mockResolvedValueOnce(SAMPLE_CART);
    await update_item('p1', { quantity: 3 });
    expect(mockProvider.updateItem).toHaveBeenCalledWith('p1', { quantity: 3 });
  });
});

describe('remove_item', () => {
  it('passes productId to provider.removeItem', async () => {
    mockProvider.removeItem.mockResolvedValueOnce(SAMPLE_CART);
    await remove_item('p1');
    expect(mockProvider.removeItem).toHaveBeenCalledWith('p1');
  });
});

describe('clear_cart', () => {
  it('calls provider.clearCart with no args', async () => {
    mockProvider.clearCart.mockResolvedValueOnce(SAMPLE_CART);
    await clear_cart();
    expect(mockProvider.clearCart).toHaveBeenCalledWith();
  });
});
