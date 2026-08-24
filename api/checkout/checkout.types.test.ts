import { describe, expect, it } from 'vitest';
import {
  ConfirmPaymentInputSchema,
  ConfirmPaymentResultSchema,
  PaymentMethodSchema,
  PaymentMethodsListSchema,
  SetupIntentResultSchema,
} from './checkout.types';

describe('PaymentMethodSchema', () => {
  it('accepts a well-formed card', () => {
    expect(
      PaymentMethodSchema.safeParse({
        id: 'pm_x',
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2030,
      }).success,
    ).toBe(true);
  });

  it('rejects expMonth out of range', () => {
    expect(
      PaymentMethodSchema.safeParse({
        id: 'pm_x',
        brand: 'visa',
        last4: '4242',
        expMonth: 13,
        expYear: 2030,
      }).success,
    ).toBe(false);
  });

  it('rejects expYear before 2000', () => {
    expect(
      PaymentMethodSchema.safeParse({
        id: 'pm_x',
        brand: 'visa',
        last4: '4242',
        expMonth: 6,
        expYear: 1999,
      }).success,
    ).toBe(false);
  });
});

describe('PaymentMethodsListSchema', () => {
  it('accepts an empty list', () => {
    expect(PaymentMethodsListSchema.safeParse({ data: [] }).success).toBe(
      true,
    );
  });
});

describe('SetupIntentResultSchema', () => {
  it('rejects an empty client secret', () => {
    expect(SetupIntentResultSchema.safeParse({ clientSecret: '' }).success).toBe(
      false,
    );
  });
});

describe('ConfirmPaymentInputSchema', () => {
  it('rejects an empty paymentMethodId', () => {
    expect(
      ConfirmPaymentInputSchema.safeParse({ paymentMethodId: '' }).success,
    ).toBe(false);
  });
});

describe('ConfirmPaymentResultSchema', () => {
  it('accepts pending_payment status', () => {
    expect(
      ConfirmPaymentResultSchema.safeParse({
        orderId: 'o1',
        stripePaymentIntentId: 'pi_x',
        status: 'pending_payment',
      }).success,
    ).toBe(true);
  });

  it('rejects an unknown status', () => {
    expect(
      ConfirmPaymentResultSchema.safeParse({
        orderId: 'o1',
        stripePaymentIntentId: 'pi_x',
        status: 'processing',
      }).success,
    ).toBe(false);
  });
});
