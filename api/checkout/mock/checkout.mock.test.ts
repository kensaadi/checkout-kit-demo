import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { authStore } from '@shared/store/auth.store';
import { cartStore } from '@shared/store/cart.store';
import { encodeMockJwt } from '../../auth/jwt';
import {
  MOCK_ORDERS,
  _resetMockOrders,
} from '../../orders/mock/orders.mock.data';
import type { CartView } from '@api/cart/cart.types';
import checkoutMockProvider from './checkout.mock';
import {
  MOCK_PAYMENT_METHODS,
  _resetMockCheckoutData,
} from './checkout.mock.data';

const CUSTOMER_TOKEN = encodeMockJwt({
  sub: 'mock-customer-001',
  roles: ['customer'],
});

function seedCart(): CartView {
  const cart: CartView = {
    id: 'cart-1',
    customerId: 'mock-customer-001',
    currency: 'usd',
    items: [
      {
        productId: 'prod-gold',
        quantity: 2,
        name: 'Gold',
        slug: 'gold',
        coverUrl: null,
        price: 4900,
        lineTotal: 9800,
      },
    ],
    itemsTotal: 9800,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
  cartStore.cart = cart;
  cartStore.loaded = true;
  return cart;
}

beforeEach(() => {
  _resetMockCheckoutData();
  _resetMockOrders();
  authStore.token = null;
  cartStore.cart = null;
  cartStore.loaded = false;
});

afterEach(() => {
  _resetMockCheckoutData();
  _resetMockOrders();
  authStore.token = null;
  cartStore.cart = null;
  cartStore.loaded = false;
});

describe('checkoutMockProvider.listPaymentMethods', () => {
  it('returns an empty list initially', async () => {
    authStore.token = CUSTOMER_TOKEN;
    const r = await checkoutMockProvider.listPaymentMethods();
    expect(r.data).toEqual([]);
  });

  it('throws UNAUTHORIZED without a token', async () => {
    await expect(
      checkoutMockProvider.listPaymentMethods(),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });
});

describe('checkoutMockProvider.createSetupIntent', () => {
  it('returns a non-empty client secret', async () => {
    authStore.token = CUSTOMER_TOKEN;
    const r = await checkoutMockProvider.createSetupIntent();
    expect(r.clientSecret).toMatch(/^seti_mock_/);
  });
});

describe('checkoutMockProvider.confirmPayment', () => {
  it('throws CONFLICT on empty cart', async () => {
    authStore.token = CUSTOMER_TOKEN;
    await expect(
      checkoutMockProvider.confirmPayment({ paymentMethodId: 'pm_x' }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('returns pending_payment + a new order id', async () => {
    authStore.token = CUSTOMER_TOKEN;
    seedCart();
    const r = await checkoutMockProvider.confirmPayment({
      paymentMethodId: 'pm_x',
    });
    expect(r.status).toBe('pending_payment');
    expect(r.orderId).toMatch(/^order_/);
    expect(r.stripePaymentIntentId).toMatch(/^pi_/);
  });

  it('snapshots the cart into MOCK_ORDERS with status pending_payment', async () => {
    authStore.token = CUSTOMER_TOKEN;
    const cart = seedCart();
    const r = await checkoutMockProvider.confirmPayment({
      paymentMethodId: 'pm_x',
    });

    const order = MOCK_ORDERS.get(r.orderId);
    expect(order).toBeDefined();
    expect(order?.customerId).toBe('mock-customer-001');
    expect(order?.status).toBe('pending_payment');
    expect(order?.itemsTotal).toBe(cart.itemsTotal);
    expect(order?.items).toHaveLength(1);
    expect(order?.items[0]).toMatchObject({
      productId: 'prod-gold',
      name: 'Gold',
      price: 4900,
      quantity: 2,
      lineTotal: 9800,
    });
  });

  it('grows MOCK_PAYMENT_METHODS so the next list shows the card', async () => {
    authStore.token = CUSTOMER_TOKEN;
    seedCart();
    await checkoutMockProvider.confirmPayment({
      paymentMethodId: 'pm_first',
    });
    const r = await checkoutMockProvider.listPaymentMethods();
    expect(r.data.map((pm) => pm.id)).toContain('pm_first');
  });

  it('does not duplicate an existing paymentMethodId in saved cards', async () => {
    authStore.token = CUSTOMER_TOKEN;
    seedCart();
    await checkoutMockProvider.confirmPayment({
      paymentMethodId: 'pm_dup',
    });
    seedCart(); // re-seed since the previous confirm doesn't clear cart in mock
    await checkoutMockProvider.confirmPayment({
      paymentMethodId: 'pm_dup',
    });

    const saved = MOCK_PAYMENT_METHODS.get('mock-customer-001') ?? [];
    expect(saved.filter((pm) => pm.id === 'pm_dup')).toHaveLength(1);
  });
});
