import type { ConfirmPaymentResult } from '../checkout.types';
import type { BackendConfirmPaymentResponse } from './checkout.live.types';

/**
 * BE → FE: confirm-payment response.
 *
 * The BE returns the full Order entity; the FE only needs three
 * fields to drive the checkout completion screen:
 *
 *   - `id`                   → `orderId`   (rename)
 *   - `stripePaymentIntentId` (forwarded — always present on a 200)
 *   - `status`                (forwarded)
 *
 * `stripePaymentIntentId` is `omitempty` BE-side but is guaranteed
 * to exist on a successful confirm (the BE creates the PaymentIntent
 * BEFORE returning 200 — see `CheckoutService.ConfirmPayment`).
 * We fall back to `''` to keep the type total and surface the
 * impossible case as a visible empty string rather than `undefined`.
 */
export function mapConfirmPaymentResult(
  input: BackendConfirmPaymentResponse,
): ConfirmPaymentResult {
  return {
    orderId: input.id,
    stripePaymentIntentId: input.stripePaymentIntentId ?? '',
    status: input.status,
  };
}
