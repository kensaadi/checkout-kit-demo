import { z } from 'zod';

/**
 * Single enriched item as it appears in the cart view returned by
 * the BE. The BE re-prices the line at read time, so `price` and
 * `lineTotal` reflect the catalog's CURRENT price for the product
 * — they are not snapshots.
 *
 * Prices are in MINOR UNITS (cents). Format with the appropriate
 * locale/currency at render time.
 */
export const CartItemViewSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  name: z.string(),
  slug: z.string(),
  coverUrl: z.string().nullable().optional(),
  price: z.number().int().nonnegative(),
  lineTotal: z.number().int().nonnegative(),
});
export type CartItemView = z.infer<typeof CartItemViewSchema>;

/**
 * Cart shape returned by every cart endpoint
 * (GET /v1/cart, POST /items, PATCH /items/:id, DELETE /items/:id,
 * DELETE /v1/cart). The BE auto-creates an empty cart on first GET
 * so the FE never has to branch on "cart exists vs not".
 *
 * `currency` is empty string when the cart is empty (no first item
 * has set the lock yet). Adding an item with a different currency
 * later returns a 422 from the BE.
 */
export const CartViewSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  currency: z.string(),
  items: z.array(CartItemViewSchema),
  itemsTotal: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CartView = z.infer<typeof CartViewSchema>;

/**
 * Input for POST /v1/cart/items.
 *
 * Quantity is MERGED when the productId is already in the cart —
 * passing { productId: X, quantity: 1 } twice results in qty 2.
 * Use UpdateItem to set an absolute quantity instead.
 */
export const AddItemInputSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  quantity: z.number().int().positive('quantity must be at least 1'),
});
export type AddItemInput = z.infer<typeof AddItemInputSchema>;

/**
 * Input for PATCH /v1/cart/items/:productId.
 *
 * Sets the ABSOLUTE quantity (no merge). To remove an item, use
 * removeItem — quantity 0 here is rejected by both this schema and
 * the BE.
 */
export const UpdateItemInputSchema = z.object({
  quantity: z.number().int().positive('quantity must be at least 1'),
});
export type UpdateItemInput = z.infer<typeof UpdateItemInputSchema>;
