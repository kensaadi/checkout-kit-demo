import { z } from 'zod';

/**
 * Wire shapes the BE actually serializes — mirror
 * `model.Order` + `model.OrderItem` in
 * `server/internal/model/order.go` (NOT the FE shape in
 * `orders.types.ts`).
 *
 * Differences from the FE shape, summarised:
 *   - item: `priceCents`     ←→  FE `price`
 *   - item: `lineTotalCents` ←→  FE `lineTotal`
 *   - order: `subtotalCents` ←→  FE `itemsTotal`
 *   - order: `paidAt`, `refundedAt` — emitted by BE on terminal
 *     transitions; the FE has no surface for them today (mapper
 *     drops them on the way out).
 *
 * `failureReason`, `stripePaymentIntentId`, `stripeChargeId` are
 * `omitempty` BE-side, so they may be absent — the schema marks
 * them optional and the mapper forwards `undefined` cleanly.
 */

export const BackendOrderStatusSchema = z.union([
  z.literal('pending_payment'),
  z.literal('paid'),
  z.literal('failed'),
  z.literal('refunded'),
]);

export const BackendOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  name: z.string(),
  priceCents: z.number().int().nonnegative(),
  currency: z.string(),
  quantity: z.number().int().positive(),
  lineTotalCents: z.number().int().nonnegative(),
});

export const BackendOrderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  items: z.array(BackendOrderItemSchema),
  subtotalCents: z.number().int().nonnegative(),
  currency: z.string(),
  status: BackendOrderStatusSchema,
  failureReason: z.string().optional(),
  stripePaymentIntentId: z.string().optional(),
  stripeChargeId: z.string().optional(),
  paidAt: z.string().optional(),
  refundedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type BackendOrder = z.infer<typeof BackendOrderSchema>;

export const BackendOrderListMetaSchema = z.object({
  page: z.number().int().nonnegative(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export const BackendOrderListSchema = z.object({
  data: z.array(BackendOrderSchema),
  meta: BackendOrderListMetaSchema,
});
export type BackendOrderList = z.infer<typeof BackendOrderListSchema>;
