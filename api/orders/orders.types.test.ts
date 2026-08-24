import { describe, expect, it } from 'vitest';
import {
  OrderListSchema,
  OrderSchema,
  OrderStatusSchema,
} from './orders.types';

describe('OrderStatusSchema', () => {
  it('accepts the four valid statuses', () => {
    for (const s of ['pending_payment', 'paid', 'failed', 'refunded']) {
      expect(OrderStatusSchema.safeParse(s).success).toBe(true);
    }
  });

  it('rejects an unknown status', () => {
    expect(OrderStatusSchema.safeParse('processing').success).toBe(false);
  });
});

describe('OrderSchema', () => {
  it('accepts a fully-populated order', () => {
    const r = OrderSchema.safeParse({
      id: 'o1',
      customerId: 'c1',
      currency: 'usd',
      items: [
        {
          productId: 'p1',
          name: 'Gold',
          slug: 'gold',
          price: 4900,
          quantity: 2,
          lineTotal: 9800,
        },
      ],
      itemsTotal: 9800,
      stripePaymentIntentId: 'pi_x',
      status: 'paid',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });
    expect(r.success).toBe(true);
  });

  it('accepts an order without optional stripe ids (pre-payment state)', () => {
    expect(
      OrderSchema.safeParse({
        id: 'o1',
        customerId: 'c1',
        currency: 'usd',
        items: [],
        itemsTotal: 0,
        status: 'pending_payment',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }).success,
    ).toBe(true);
  });
});

describe('OrderListSchema', () => {
  it('accepts a paginated envelope', () => {
    expect(
      OrderListSchema.safeParse({
        data: [],
        meta: { page: 1, perPage: 20, total: 0 },
      }).success,
    ).toBe(true);
  });

  it('rejects negative pagination values', () => {
    expect(
      OrderListSchema.safeParse({
        data: [],
        meta: { page: -1, perPage: 20, total: 0 },
      }).success,
    ).toBe(false);
  });
});
