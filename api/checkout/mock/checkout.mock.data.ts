import type { PaymentMethod } from '../checkout.types';

export const MOCK_DELAY_MS = 250;

/**
 * Time before the mock flips a confirmed order from
 * `pending_payment` to `paid`, simulating the Stripe webhook
 * arriving async. Tunable to demo the CompleteStep polling UX.
 */
export const MOCK_WEBHOOK_DELAY_MS = 2500;

/**
 * Saved payment methods returned by the mock, keyed by customer
 * id. Starts empty for the seeded customer — the first checkout
 * uses the "Add new card" path.
 *
 * Mutated by `confirmPayment` in the mock when the customer adds
 * a new card (so subsequent listPaymentMethods returns it).
 */
export const MOCK_PAYMENT_METHODS: Map<string, PaymentMethod[]> = new Map();

export function _resetMockCheckoutData(): void {
  MOCK_PAYMENT_METHODS.clear();
}
