import { z } from 'zod';

/**
 * Wire shapes the BE actually serializes — mirror
 * `server/internal/model/product.go` (NOT the FE shape in
 * `products.types.ts`).
 *
 * Differences from the FE shape, summarised:
 *   - `priceCents: int64`  ←→  FE `price: number`
 *   - `media.coverImage`   ←→  FE `coverUrl`
 *   - `media.gallery`      ←→  FE `galleryUrls`
 *   - extra BE fields (`stripePriceId`, `createdBy`, `updatedBy`)
 *     are dropped on the way to FE; zod's default stripping policy
 *     handles them — we just don't model them here.
 *
 * The cover/gallery fields are `omitempty` BE-side: an unset cover
 * is ABSENT from the JSON, not present as `""`. The schema marks
 * `coverImage` optional and the mapper turns absent → `null` to
 * match the FE contract.
 */

export const BackendProductMediaSchema = z.object({
  // `null` for products without a cover — the BE explicitly serializes a
  // missing cover as `null` (its model documents "a product without a
  // cover is normal"), not as an absent key. Tolerate null + absent
  // (same as `gallery` below); the mapper normalizes to `coverUrl`.
  coverImage: z.string().nullable().optional(),
  // Tolerate `null` for legacy product docs whose `gallery` was
  // never initialised to `[]` (Go's zero-value nil slice serializes
  // as JSON null because the BSON tag has no omitempty). Newly-
  // created products always carry `[]`. Either way we normalize to
  // an array before handing off to the mapper.
  gallery: z
    .array(z.string())
    .nullable()
    .optional()
    .transform((v) => v ?? []),
});

export const BackendProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().optional().default(''),
  priceCents: z.number().int().nonnegative(),
  currency: z.string(),
  active: z.boolean(),
  media: BackendProductMediaSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type BackendProduct = z.infer<typeof BackendProductSchema>;

export const BackendProductListMetaSchema = z.object({
  page: z.number().int().nonnegative(),
  perPage: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export const BackendProductListSchema = z.object({
  data: z.array(BackendProductSchema),
  meta: BackendProductListMetaSchema,
});
export type BackendProductList = z.infer<typeof BackendProductListSchema>;

/**
 * Wire shape for `POST /v1/admin/products`. The Go handler's
 * `createProductRequest` carries `priceCents` (FE→BE rename of
 * the `price` input field).
 */
export type BackendCreateProductRequest = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  active: boolean;
};

/**
 * Wire shape for `PATCH /v1/admin/products/:id`. Every field is
 * optional — only the present ones are persisted. `active` is
 * intentionally NOT optional in this type when set, because the BE
 * uses `*bool` to distinguish absent from explicit-false; we
 * preserve that distinction by omitting the key when the FE didn't
 * supply one.
 */
export type BackendUpdateProductRequest = {
  slug?: string;
  name?: string;
  description?: string;
  priceCents?: number;
  currency?: string;
  active?: boolean;
};
