import { attempt } from '@api/_shared/attempt';
import type { Result } from '@api/_shared/result.types';
import { checkoutProvider } from './checkout.provider';
import type {
  ConfirmPaymentInput,
  ConfirmPaymentResult,
  PaymentMethodsList,
  SetupIntentResult,
} from './checkout.types';

/**
 * GET /v1/checkout/payment-methods — saved cards for the
 * signed-in customer. Triggers lazy Stripe Customer provisioning
 * on the BE side on the first call.
 */
export async function list_payment_methods(): Promise<
  Result<PaymentMethodsList>
> {
  const provider = await checkoutProvider();
  return attempt(provider.listPaymentMethods());
}

/**
 * POST /v1/checkout/setup-intent — kicks off the "attach a new
 * card" flow. Returns a `clientSecret` the FE feeds to
 * `stripe.confirmCardSetup(clientSecret, { payment_method: { card } })`.
 */
export async function create_setup_intent(): Promise<
  Result<SetupIntentResult>
> {
  const provider = await checkoutProvider();
  return attempt(provider.createSetupIntent());
}

/**
 * POST /v1/checkout/confirm — creates the Order, confirms the
 * Stripe PaymentIntent off-session against the supplied
 * `paymentMethodId`, and returns the new order id with
 * `status: pending_payment`.
 *
 * The Stripe webhook later flips status to `paid` or `failed`.
 * The caller polls `GET /v1/orders/:id` via the
 * checkout `CompleteStep` until the transition lands.
 */
export async function confirm_payment(
  input: ConfirmPaymentInput,
): Promise<Result<ConfirmPaymentResult>> {
  const provider = await checkoutProvider();
  return attempt(provider.confirmPayment(input));
}
