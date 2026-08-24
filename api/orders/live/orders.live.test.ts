import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import axiosClient from '@api/_shared/axios.client';
import ordersLiveProvider from './orders.live';

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(axiosClient);
});

afterEach(() => {
  mock.restore();
});

// Helper: a minimal BE-shaped order. Mirrors `model.Order` —
// nested `items` with `priceCents`/`lineTotalCents`, `subtotalCents`,
// and the audit timestamps `paidAt`/`refundedAt` the mapper drops.
function backendOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'o1',
    customerId: 'c1',
    items: [
      {
        productId: 'p1',
        slug: 'gold',
        name: 'Gold',
        priceCents: 4900,
        currency: 'USD',
        quantity: 2,
        lineTotalCents: 9800,
      },
    ],
    subtotalCents: 9800,
    currency: 'USD',
    status: 'paid' as const,
    stripePaymentIntentId: 'pi_x',
    stripeChargeId: 'ch_x',
    paidAt: '2026-01-01T00:00:01Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:01Z',
    ...overrides,
  };
}

describe('ordersLiveProvider.getMyOrderById', () => {
  it('GETs /v1/orders/:id and maps items/subtotal to FE shape', async () => {
    mock.onGet('/v1/orders/o1').reply(200, backendOrder());
    const r = await ordersLiveProvider.getMyOrderById('o1');
    expect(r.id).toBe('o1');
    expect(r.itemsTotal).toBe(9800);
    expect(r.items[0]!.price).toBe(4900);
    expect(r.items[0]!.lineTotal).toBe(9800);
  });

  it('URL-encodes the id', async () => {
    mock.onGet('/v1/orders/o%2F1').reply(200, backendOrder({ id: 'o/1' }));
    const r = await ordersLiveProvider.getMyOrderById('o/1');
    expect(r.id).toBe('o/1');
  });

  it('forwards NOT_FOUND on 404', async () => {
    mock.onGet('/v1/orders/missing').reply(404, { error: 'not found' });
    await expect(
      ordersLiveProvider.getMyOrderById('missing'),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('throws CONTRACT_MISMATCH when the response body does not match', async () => {
    mock.onGet('/v1/orders/o1').reply(200, { unexpected: 'shape' });
    await expect(
      ordersLiveProvider.getMyOrderById('o1'),
    ).rejects.toMatchObject({ code: 'CONTRACT_MISMATCH' });
  });
});

describe('ordersLiveProvider.listMyOrders', () => {
  it('GETs /v1/orders with pagination params and maps every item', async () => {
    mock.onGet('/v1/orders').reply((config) => {
      expect(config.params).toEqual({ page: 2, perPage: 5 });
      return [
        200,
        {
          data: [backendOrder()],
          meta: { page: 2, perPage: 5, total: 1 },
        },
      ];
    });
    const r = await ordersLiveProvider.listMyOrders({ page: 2, perPage: 5 });
    expect(r.data).toHaveLength(1);
    expect(r.data[0]!.itemsTotal).toBe(9800);
  });

  it('omits params when no query', async () => {
    mock.onGet('/v1/orders').reply((config) => {
      expect(config.params).toBeUndefined();
      return [200, { data: [], meta: { page: 1, perPage: 20, total: 0 } }];
    });
    await ordersLiveProvider.listMyOrders();
  });
});

describe('ordersLiveProvider admin endpoints', () => {
  it('getOrderByIdAdmin hits /v1/admin/orders/:id and maps', async () => {
    mock.onGet('/v1/admin/orders/o1').reply(200, backendOrder());
    const r = await ordersLiveProvider.getOrderByIdAdmin('o1');
    expect(r.id).toBe('o1');
    expect(r.itemsTotal).toBe(9800);
  });

  it('listOrdersAdmin hits /v1/admin/orders and returns empty list cleanly', async () => {
    mock.onGet('/v1/admin/orders').reply(200, {
      data: [],
      meta: { page: 1, perPage: 20, total: 0 },
    });
    const r = await ordersLiveProvider.listOrdersAdmin();
    expect(r.data).toEqual([]);
  });
});
