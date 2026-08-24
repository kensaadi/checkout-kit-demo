import { z } from 'zod';

/**
 * Product as returned by every catalog endpoint:
 *
 *   - GET /v1/products             (public, Active=true only)
 *   - GET /v1/products/:slug       (public, by slug)
 *   - GET /v1/admin/products       (staff, drafts visible)
 *   - GET /v1/admin/products/:id   (staff, by ObjectID)
 *   - POST /v1/admin/products      (staff, returns created)
 *   - PATCH /v1/admin/products/:id (staff, returns updated)
 *   - POST /v1/admin/products/:id/{cover,gallery} (staff, returns updated)
 *
 * Same shape across all of them — the differences are access
 * control and the visibility filter (public hides drafts).
 *
 * Prices are in MINOR UNITS (cents). Multiply by 100 → display
 * in major units via `formatPrice` from
 * `mui/src/features/cart/format.ts`.
 */
export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().optional().default(''),
  price: z.number().int().nonnegative(),
  currency: z.string(),
  active: z.boolean(),
  coverUrl: z.string().nullable().optional(),
  galleryUrls: z.array(z.string()).optional().default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Product = z.infer<typeof ProductSchema>;

/**
 * Pagination envelope used by `GET /v1/products` and
 * `GET /v1/admin/products`. Same shape as orders.
 */
export const ProductListMetaSchema = z.object({
  page: z.number().int().nonnegative(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type ProductListMeta = z.infer<typeof ProductListMetaSchema>;

export const ProductListSchema = z.object({
  data: z.array(ProductSchema),
  meta: ProductListMetaSchema,
});
export type ProductList = z.infer<typeof ProductListSchema>;

export type ProductListQuery = {
  page?: number;
  perPage?: number;
};

/**
 * Input for `POST /v1/admin/products`. Slug must be unique
 * (BE enforces via Mongo index — duplicate → 409 CONFLICT).
 */
export const CreateProductInputSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, digits and dashes only'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional().default(''),
  // `coerce` because HTML number inputs (and the form bridge) hand the
  // value through as a STRING ("4900"); coercion turns it into the
  // number the BE contract + `.int()` require. Without it, a perfectly
  // valid price fails validation with "expected number, received string".
  price: z.coerce.number().int().nonnegative('Price cannot be negative'),
  currency: z.string().min(1, 'Currency is required'),
  active: z.boolean().default(true),
});
export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;

/**
 * Input for `PATCH /v1/admin/products/:id`. Every field is
 * optional — the BE applies only the present ones (partial
 * update semantics).
 */
export const UpdateProductInputSchema = CreateProductInputSchema.partial();
export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>;
