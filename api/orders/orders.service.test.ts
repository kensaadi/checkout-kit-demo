import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Order, OrderList } from './orders.types';

const { SAMPLE_ORDER, SAMPLE_LIST, mockProvider } = vi.hoisted(() => {
  const SAMPLE_ORDER: Order = {
    id: 'o1',
    customerId: 'c1',
    currency: 'usd',
    items: [],
    itemsTotal: 0,
    status: 'paid',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
  const SAMPLE_LIST: OrderList = {
    data: [SAMPLE_ORDER],
    meta: { page: 1, perPage: 20, total: 1 },
  };
  return {
    SAMPLE_ORDER,
    SAMPLE_LIST,
    mockProvider: {
      getMyOrderById: vi.fn(),
      listMyOrders: vi.fn(),
      getOrderByIdAdmin: vi.fn(),
      listOrdersAdmin: vi.fn(),
    },
  };
});

vi.mock('./orders.provider', () => ({
  ordersProvider: () => Promise.resolve(mockProvider),
}));

import {
  admin_get_order_by_id,
  admin_list_orders,
  get_my_order_by_id,
  list_my_orders,
} from './orders.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('get_my_order_by_id', () => {
  it('returns the order on success', async () => {
    mockProvider.getMyOrderById.mockResolvedValueOnce(SAMPLE_ORDER);
    const r = await get_my_order_by_id('o1');
    expect(r.data).toEqual(SAMPLE_ORDER);
  });

  it('forwards the id', async () => {
    mockProvider.getMyOrderById.mockResolvedValueOnce(SAMPLE_ORDER);
    await get_my_order_by_id('o-special');
    expect(mockProvider.getMyOrderById).toHaveBeenCalledWith('o-special');
  });

  it('returns 404 as Result.error', async () => {
    mockProvider.getMyOrderById.mockRejectedValueOnce({
      code: 'NOT_FOUND' as const,
      message: 'order not found',
      status: 404,
    });
    const r = await get_my_order_by_id('o1');
    expect(r.error?.code).toBe('NOT_FOUND');
  });
});

describe('list_my_orders', () => {
  it('forwards pagination params', async () => {
    mockProvider.listMyOrders.mockResolvedValueOnce(SAMPLE_LIST);
    await list_my_orders({ page: 2, perPage: 10 });
    expect(mockProvider.listMyOrders).toHaveBeenCalledWith({
      page: 2,
      perPage: 10,
    });
  });
});

describe('admin_get_order_by_id', () => {
  it('uses the admin path (not the customer path)', async () => {
    mockProvider.getOrderByIdAdmin.mockResolvedValueOnce(SAMPLE_ORDER);
    await admin_get_order_by_id('o1');
    expect(mockProvider.getOrderByIdAdmin).toHaveBeenCalledTimes(1);
    expect(mockProvider.getMyOrderById).not.toHaveBeenCalled();
  });
});

describe('admin_list_orders', () => {
  it('uses the admin path', async () => {
    mockProvider.listOrdersAdmin.mockResolvedValueOnce(SAMPLE_LIST);
    await admin_list_orders();
    expect(mockProvider.listOrdersAdmin).toHaveBeenCalled();
  });
});
