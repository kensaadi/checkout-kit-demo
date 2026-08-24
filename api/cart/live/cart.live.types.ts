import { z } from 'zod';

/**
 * Wire shapes the BE actually serializes — mirror
 * `service.CartItemView` and `service.CartView` in
 * `server/internal/service/cart_service.go` (NOT the FE shape in
 * `cart.types.ts`).
 *
 * Differences from the FE shape, summarised:
 *   - item: `coverImage`     ←→  FE `coverUrl`
 *   - item: `priceCents`     ←→  FE `price`
 *   - item: `lineTotalCents` ←→  FE `lineTotal`
 *   - cart: `subtotalCents`  ←→  FE `itemsTotal`
 *   - cart: `currency`       — BE marks `omitempty` (empty cart);
 *                              FE shape requires the field, mapper
 *                              normalizes absent → `''`.
 *   - cart: `itemCount`      — emitted by BE, not used by FE.
 *
 * The order of items is meaningful (BE preserves it) — we forward
 * it verbatim.
 */

export const BackendCartItemViewSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  name: z.string(),
  coverImage: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  currency: z.string(),
  quantity: z.number().int().positive(),
  lineTotalCents: z.number().int().nonnegative(),
});

export const BackendCartViewSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  items: z.array(BackendCartItemViewSchema),
  subtotalCents: z.number().int().nonnegative(),
  currency: z.string().optional(),
  itemCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type BackendCartView = z.infer<typeof BackendCartViewSchema>;
