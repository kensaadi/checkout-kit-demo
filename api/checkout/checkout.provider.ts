import { PROVIDER } from '@api/_shared/config';
import type {
  ConfirmPaymentInput,
  ConfirmPaymentResult,
  PaymentMethodsList,
  SetupIntentResult,
} from './checkout.types';

/**
 * Contract every checkout provider must implement.
 *
 * Three operations, one per BE endpoint:
 *   - listPaymentMethods → list saved cards for the signed-in customer
 *   - createSetupIntent  → start "save a new card" flow
 *   - confirmPayment     → create order + Stripe PaymentIntent
 *
 * The actual Stripe Elements integration lives client-side in
 * `mui/src/features/checkout/stripe/`. The BE never sees raw card
 * data — only the resulting `pm_...` id after Stripe.js attaches
 * the card via the SetupIntent.
 */
export interface CheckoutProvider {
  listPaymentMethods(): Promise<PaymentMethodsList>;
  createSetupIntent(): Promise<SetupIntentResult>;
  confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult>;
}

const checkoutProviderMapping: Record<
  string,
  () => Promise<CheckoutProvider>
> = {
  live: () =>
    import('./live/checkout.live').then(
      (m) => m.default as CheckoutProvider,
    ),
  mock: () =>
    import('./mock/checkout.mock').then(
      (m) => m.default as CheckoutProvider,
    ),
};

export async function checkoutProvider(): Promise<CheckoutProvider> {
  const loader = checkoutProviderMapping[PROVIDER];
  if (!loader) {
    throw new Error(`[checkout] provider "${PROVIDER}" not supported`);
  }
  return loader();
}
