import { z } from 'zod';

/**
 * Order lifecycle states. State transitions happen ONLY via the
 * Stripe webhook (server-side); the FE only reads.
 *
 *   pending_payment → paid       (payment_intent.succeeded)
 *   pending_payment → failed     (payment_intent.payment_failed)
 *   paid            → refunded   (charge.refunded)
 */
export const OrderStatusSchema = z.union([
  z.literal('pending_payment'),
  z.literal('paid'),
  z.literal('failed'),
  z.literal('refunded'),
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

/**
 * Single line item in an order. SNAPSHOT — `name`, `slug`, `price`
 * reflect the catalog at the time of checkout, not the current
 * catalog. Changing a product later does NOT rewrite this.
 */
export const OrderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  slug: z.string(),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  lineTotal: z.number().int().nonnegative(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

/**
 * Full order shape returned by `GET /v1/orders/:id` (customer
 * view) and `GET /v1/admin/orders/:id` (admin view). Same shape
 * for both — the difference is access control, not payload.
 */
export const OrderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  currency: z.string(),
  items: z.array(OrderItemSchema),
  itemsTotal: z.number().int().nonnegative(),
  stripePaymentIntentId: z.string().optional(),
  stripeChargeId: z.string().optional(),
  status: OrderStatusSchema,
  failureReason: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Order = z.infer<typeof OrderSchema>;

/**
 * Pagination envelope for `GET /v1/orders` (customer) and
 * `GET /v1/admin/orders` (admin). Kit-standard
 * `{data, meta: {page, perPage, total}}` shape.
 */
export const OrderListMetaSchema = z.object({
  page: z.number().int().nonnegative(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type OrderListMeta = z.infer<typeof OrderListMetaSchema>;

export const OrderListSchema = z.object({
  data: z.array(OrderSchema),
  meta: OrderListMetaSchema,
});
export type OrderList = z.infer<typeof OrderListSchema>;

/**
 * Query params for list endpoints. Optional — BE defaults to
 * page=1, perPage=20.
 */
export type OrderListQuery = {
  page?: number;
  perPage?: number;
};
