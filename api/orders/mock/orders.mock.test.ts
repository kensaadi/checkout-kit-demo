import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { authStore } from '@shared/store/auth.store';
import { encodeMockJwt } from '../../auth/jwt';
import type { Order } from '../orders.types';
import ordersMockProvider from './orders.mock';
import { MOCK_ORDERS, _resetMockOrders } from './orders.mock.data';

const ADMIN_TOKEN = encodeMockJwt({
  sub: 'mock-admin-001',
  roles: ['admin'],
});
const CUSTOMER_TOKEN = encodeMockJwt({
  sub: 'mock-customer-001',
  roles: ['customer'],
});
const OTHER_CUSTOMER_TOKEN = encodeMockJwt({
  sub: 'mock-customer-002',
  roles: ['customer'],
});

function seed(order: Partial<Order> & { id: string; customerId: string }): Order {
  const defaults: Omit<Order, 'id' | 'customerId'> = {
    currency: 'usd',
    items: [],
    itemsTotal: 0,
    status: 'paid',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
  const full: Order = { ...defaults, ...order };
  MOCK_ORDERS.set(full.id, full);
  return full;
}

beforeEach(() => {
  _resetMockOrders();
  authStore.token = null;
});

afterEach(() => {
  authStore.token = null;
  _resetMockOrders();
});

describe('ordersMockProvider.getMyOrderById', () => {
  it('returns the order when it belongs to the signed-in customer', async () => {
    authStore.token = CUSTOMER_TOKEN;
    seed({ id: 'o1', customerId: 'mock-customer-001' });
    const order = await ordersMockProvider.getMyOrderById('o1');
    expect(order.id).toBe('o1');
  });

  it("returns 404 when the order belongs to a different customer (no info leak)", async () => {
    authStore.token = CUSTOMER_TOKEN;
    seed({ id: 'o2', customerId: 'mock-customer-002' });
    await expect(
      ordersMockProvider.getMyOrderById('o2'),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('returns 404 for a non-existent order id', async () => {
    authStore.token = CUSTOMER_TOKEN;
    await expect(
      ordersMockProvider.getMyOrderById('missing'),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('throws UNAUTHORIZED when no token is present', async () => {
    await expect(
      ordersMockProvider.getMyOrderById('o1'),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });
});

describe('ordersMockProvider.listMyOrders', () => {
  it('returns only orders belonging to the signed-in customer', async () => {
    authStore.token = CUSTOMER_TOKEN;
    seed({ id: 'mine-1', customerId: 'mock-customer-001' });
    seed({ id: 'mine-2', customerId: 'mock-customer-001' });
    seed({ id: 'other', customerId: 'mock-customer-002' });

    const result = await ordersMockProvider.listMyOrders();
    expect(result.data).toHaveLength(2);
    expect(result.data.map((o) => o.id).sort()).toEqual([
      'mine-1',
      'mine-2',
    ]);
  });

  it('respects pagination params', async () => {
    authStore.token = CUSTOMER_TOKEN;
    for (let i = 1; i <= 5; i++) {
      seed({
        id: `o${i}`,
        customerId: 'mock-customer-001',
        createdAt: `2026-01-0${i}T00:00:00Z`,
      });
    }
    const r = await ordersMockProvider.listMyOrders({ page: 2, perPage: 2 });
    expect(r.data).toHaveLength(2);
    expect(r.meta).toEqual({ page: 2, perPage: 2, total: 5 });
  });
});

describe('ordersMockProvider admin endpoints', () => {
  it('admin sees any order via getOrderByIdAdmin', async () => {
    authStore.token = ADMIN_TOKEN;
    seed({ id: 'somecust', customerId: 'mock-customer-001' });
    const order = await ordersMockProvider.getOrderByIdAdmin('somecust');
    expect(order.id).toBe('somecust');
  });

  it('listOrdersAdmin returns all customers orders', async () => {
    authStore.token = ADMIN_TOKEN;
    seed({ id: 'a', customerId: 'mock-customer-001' });
    seed({ id: 'b', customerId: 'mock-customer-002' });
    const r = await ordersMockProvider.listOrdersAdmin();
    expect(r.data).toHaveLength(2);
  });

  it('customer is FORBIDDEN from the admin endpoints', async () => {
    authStore.token = OTHER_CUSTOMER_TOKEN;
    seed({ id: 'o1', customerId: 'mock-customer-001' });
    await expect(
      ordersMockProvider.getOrderByIdAdmin('o1'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      ordersMockProvider.listOrdersAdmin(),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
