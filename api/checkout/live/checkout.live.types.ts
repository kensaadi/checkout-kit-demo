import { BackendOrderSchema } from '@api/orders/live/orders.live.types';

/**
 * Wire shape returned by `POST /v1/checkout/confirm`.
 *
 * The BE handler emits the FULL `model.Order` (see
 * `server/internal/handler/checkout.go` — `c.JSON(http.StatusOK, order)`),
 * but the FE only consumes three fields. We reuse the shared
 * BackendOrderSchema so the schema stays in lock-step with the
 * orders mapper, and the mapper drops everything the FE doesn't
 * use.
 *
 * The other two checkout endpoints (`list-payment-methods` and
 * `setup-intent`) do not have a wire mismatch — their FE schemas
 * already match what the BE emits, with extra optional fields
 * stripped by zod's default policy. No backend types or mapper
 * needed for them.
 */
export const BackendConfirmPaymentResponseSchema = BackendOrderSchema;
export type BackendConfirmPaymentResponse = ReturnType<
  typeof BackendConfirmPaymentResponseSchema.parse
>;
