import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import axiosClient from '@api/_shared/axios.client';
import cartLiveProvider from './cart.live';

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(axiosClient);
});

afterEach(() => {
  mock.restore();
});

// Helper: a minimal BE-shaped cart view. Mirrors the JSON the Go
// server actually emits (service.CartView) — coverImage, priceCents,
// lineTotalCents, subtotalCents, itemCount.
function backendCart(overrides: Record<string, unknown> = {}) {
  return {
    id: 'c1',
    customerId: 'cust1',
    items: [
      {
        productId: 'p1',
        slug: 'gold',
        name: 'Gold',
        coverImage: 'https://cdn/gold.jpg',
        priceCents: 4900,
        currency: 'USD',
        quantity: 2,
        lineTotalCents: 9800,
      },
    ],
    subtotalCents: 9800,
    currency: 'USD',
    itemCount: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('cartLiveProvider.getCart', () => {
  it('maps BE shape → FE shape (renames coverImage/priceCents/lineTotalCents + subtotalCents → itemsTotal)', async () => {
    mock.onGet('/v1/cart').reply(200, backendCart());
    const result = await cartLiveProvider.getCart();
    expect(result.id).toBe('c1');
    expect(result.itemsTotal).toBe(9800);
    expect(result.items[0]!.price).toBe(4900);
    expect(result.items[0]!.lineTotal).toBe(9800);
    expect(result.items[0]!.coverUrl).toBe('https://cdn/gold.jpg');
  });

  it('treats empty cart (no currency, no items) as currency=""', async () => {
    mock.onGet('/v1/cart').reply(200, {
      id: 'c1',
      customerId: 'cust1',
      items: [],
      subtotalCents: 0,
      itemCount: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    const result = await cartLiveProvider.getCart();
    expect(result.currency).toBe('');
    expect(result.items).toEqual([]);
    expect(result.itemsTotal).toBe(0);
  });

  it('treats absent coverImage as coverUrl: null', async () => {
    const noCover = {
      ...backendCart(),
      items: [
        {
          productId: 'p1',
          slug: 'gold',
          name: 'Gold',
          priceCents: 4900,
          currency: 'USD',
          quantity: 1,
          lineTotalCents: 4900,
        },
      ],
    };
    mock.onGet('/v1/cart').reply(200, noCover);
    const result = await cartLiveProvider.getCart();
    expect(result.items[0]!.coverUrl).toBeNull();
  });

  it('throws CONTRACT_MISMATCH when the response body does not match the BE schema', async () => {
    mock.onGet('/v1/cart').reply(200, { unexpected: 'shape' });
    await expect(cartLiveProvider.getCart()).rejects.toMatchObject({
      code: 'CONTRACT_MISMATCH',
    });
  });
});

describe('cartLiveProvider.addItem', () => {
  it('POSTs /v1/cart/items with FE pass-through body', async () => {
    mock.onPost('/v1/cart/items').reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({
        productId: 'p1',
        quantity: 2,
      });
      return [200, backendCart()];
    });
    const result = await cartLiveProvider.addItem({
      productId: 'p1',
      quantity: 2,
    });
    expect(result.items[0]!.price).toBe(4900);
  });
});

describe('cartLiveProvider.updateItem', () => {
  it('PATCHes /v1/cart/items/:productId with absolute quantity', async () => {
    mock.onPatch('/v1/cart/items/p1').reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({ quantity: 3 });
      return [200, backendCart()];
    });
    await cartLiveProvider.updateItem('p1', { quantity: 3 });
  });

  it('URL-encodes the productId to handle special characters', async () => {
    mock.onPatch('/v1/cart/items/p%2F1').reply(200, backendCart());
    await cartLiveProvider.updateItem('p/1', { quantity: 3 });
  });
});

describe('cartLiveProvider.removeItem', () => {
  it('DELETEs and returns the mapped cart', async () => {
    mock.onDelete('/v1/cart/items/p1').reply(200, backendCart());
    const result = await cartLiveProvider.removeItem('p1');
    expect(result.itemsTotal).toBe(9800);
  });
});

describe('cartLiveProvider.clearCart', () => {
  it('DELETEs /v1/cart and returns the mapped empty cart', async () => {
    mock.onDelete('/v1/cart').reply(200, {
      ...backendCart(),
      items: [],
      subtotalCents: 0,
      itemCount: 0,
    });
    const result = await cartLiveProvider.clearCart();
    expect(result.items).toEqual([]);
    expect(result.itemsTotal).toBe(0);
  });
});
