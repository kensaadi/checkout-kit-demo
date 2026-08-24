import { z } from 'zod';
import { OrderStatusSchema } from '@api/orders/orders.types';

/**
 * Saved card returned by `GET /v1/checkout/payment-methods`.
 *
 * The BE forwards only the fields the FE needs to render a
 * "choose a saved card" UI — it does NOT proxy the full Stripe
 * payload (PCI scope reduction).
 */
export const PaymentMethodSchema = z.object({
  id: z.string(),                    // pm_...
  brand: z.string(),                 // "visa" | "mastercard" | ...
  last4: z.string(),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int().min(2000),
});
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const PaymentMethodsListSchema = z.object({
  data: z.array(PaymentMethodSchema),
});
export type PaymentMethodsList = z.infer<typeof PaymentMethodsListSchema>;

/**
 * Returned by `POST /v1/checkout/setup-intent`. The client secret
 * is what `stripe.confirmCardSetup(clientSecret, {...})` consumes
 * to attach a new card to the customer's Stripe Customer.
 */
export const SetupIntentResultSchema = z.object({
  clientSecret: z.string().min(1),
});
export type SetupIntentResult = z.infer<typeof SetupIntentResultSchema>;

/**
 * Input for `POST /v1/checkout/confirm`. The BE looks up the
 * payment method, verifies it belongs to the signed-in customer,
 * creates an Order and a PaymentIntent (off-session,
 * confirm=true), then returns the new order id.
 */
export const ConfirmPaymentInputSchema = z.object({
  paymentMethodId: z.string().min(1, 'Payment method is required'),
});
export type ConfirmPaymentInput = z.infer<typeof ConfirmPaymentInputSchema>;

/**
 * Returned by `POST /v1/checkout/confirm`.
 *
 * `status` is ALWAYS `pending_payment` at this point — the actual
 * payment outcome arrives async via the Stripe webhook, which
 * flips the Order to `paid` / `failed`. The FE polls
 * `GET /v1/orders/:id` from the CompleteStep until status leaves
 * `pending_payment`.
 */
export const ConfirmPaymentResultSchema = z.object({
  orderId: z.string().min(1),
  stripePaymentIntentId: z.string().min(1),
  status: OrderStatusSchema,
});
export type ConfirmPaymentResult = z.infer<typeof ConfirmPaymentResultSchema>;
