import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockProvider } = vi.hoisted(() => ({
  mockProvider: {
    listPaymentMethods: vi.fn(),
    createSetupIntent: vi.fn(),
    confirmPayment: vi.fn(),
  },
}));

vi.mock('./checkout.provider', () => ({
  checkoutProvider: () => Promise.resolve(mockProvider),
}));

import {
  confirm_payment,
  create_setup_intent,
  list_payment_methods,
} from './checkout.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('list_payment_methods', () => {
  it('returns the list on success', async () => {
    mockProvider.listPaymentMethods.mockResolvedValueOnce({ data: [] });
    const r = await list_payment_methods();
    expect(r.data?.data).toEqual([]);
  });
});

describe('create_setup_intent', () => {
  it('returns the client secret on success', async () => {
    mockProvider.createSetupIntent.mockResolvedValueOnce({
      clientSecret: 'seti_x_secret',
    });
    const r = await create_setup_intent();
    expect(r.data?.clientSecret).toBe('seti_x_secret');
  });
});

describe('confirm_payment', () => {
  it('forwards the paymentMethodId', async () => {
    mockProvider.confirmPayment.mockResolvedValueOnce({
      orderId: 'o1',
      stripePaymentIntentId: 'pi_x',
      status: 'pending_payment',
    });
    await confirm_payment({ paymentMethodId: 'pm_x' });
    expect(mockProvider.confirmPayment).toHaveBeenCalledWith({
      paymentMethodId: 'pm_x',
    });
  });

  it('returns pending_payment status (webhook flips later)', async () => {
    mockProvider.confirmPayment.mockResolvedValueOnce({
      orderId: 'o1',
      stripePaymentIntentId: 'pi_x',
      status: 'pending_payment',
    });
    const r = await confirm_payment({ paymentMethodId: 'pm_x' });
    expect(r.data?.status).toBe('pending_payment');
  });

  it('surfaces CONFLICT on empty-cart attempt', async () => {
    mockProvider.confirmPayment.mockRejectedValueOnce({
      code: 'CONFLICT' as const,
      message: 'cart is empty',
      status: 409,
    });
    const r = await confirm_payment({ paymentMethodId: 'pm_x' });
    expect(r.error?.code).toBe('CONFLICT');
  });
});
