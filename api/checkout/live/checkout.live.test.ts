import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import axiosClient from '@api/_shared/axios.client';
import checkoutLiveProvider from './checkout.live';

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(axiosClient);
});

afterEach(() => {
  mock.restore();
});

describe('checkoutLiveProvider.listPaymentMethods', () => {
  it('GETs and strips BE extras (holderName, isDefault)', async () => {
    mock.onGet('/v1/checkout/payment-methods').reply(200, {
      data: [
        {
          id: 'pm_x',
          brand: 'visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2030,
          holderName: 'Bob Buyer',
          isDefault: true,
        },
      ],
    });
    const result = await checkoutLiveProvider.listPaymentMethods();
    expect(result.data).toHaveLength(1);
    expect(result.data[0]!.id).toBe('pm_x');
    // BE extras must not be present on the FE-typed object.
    expect(result.data[0] as Record<string, unknown>).not.toHaveProperty(
      'holderName',
    );
  });

  it('accepts an empty list', async () => {
    mock.onGet('/v1/checkout/payment-methods').reply(200, { data: [] });
    const result = await checkoutLiveProvider.listPaymentMethods();
    expect(result.data).toEqual([]);
  });
});

describe('checkoutLiveProvider.createSetupIntent', () => {
  it('POSTs with no body and forwards clientSecret', async () => {
    mock.onPost('/v1/checkout/setup-intent').reply((config) => {
      expect(config.data).toBeUndefined();
      return [200, { clientSecret: 'seti_x_secret' }];
    });
    const result = await checkoutLiveProvider.createSetupIntent();
    expect(result.clientSecret).toBe('seti_x_secret');
  });
});

describe('checkoutLiveProvider.confirmPayment', () => {
  it('POSTs paymentMethodId and maps BE full-Order response to {orderId, stripePaymentIntentId, status}', async () => {
    mock.onPost('/v1/checkout/confirm').reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({
        paymentMethodId: 'pm_x',
      });
      // BE serializes the entire model.Order on success.
      return [
        200,
        {
          id: 'o1',
          customerId: 'c1',
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
          subtotalCents: 4900,
          currency: 'USD',
          status: 'pending_payment',
          stripePaymentIntentId: 'pi_x',
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];
    });
    const result = await checkoutLiveProvider.confirmPayment({
      paymentMethodId: 'pm_x',
    });
    expect(result.orderId).toBe('o1');
    expect(result.stripePaymentIntentId).toBe('pi_x');
    expect(result.status).toBe('pending_payment');
  });

  it('surfaces CONFLICT on empty cart', async () => {
    mock
      .onPost('/v1/checkout/confirm')
      .reply(409, { error: 'cart is empty' });
    await expect(
      checkoutLiveProvider.confirmPayment({ paymentMethodId: 'pm_x' }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('throws CONTRACT_MISMATCH when BE returns a malformed body', async () => {
    mock
      .onPost('/v1/checkout/confirm')
      .reply(200, { unexpected: 'shape' });
    await expect(
      checkoutLiveProvider.confirmPayment({ paymentMethodId: 'pm_x' }),
    ).rejects.toMatchObject({ code: 'CONTRACT_MISMATCH' });
  });
});
