import type {
  CreateProductInput,
  Product,
  ProductList,
  UpdateProductInput,
} from '../products.types';
import type {
  BackendCreateProductRequest,
  BackendProduct,
  BackendProductList,
  BackendUpdateProductRequest,
} from './products.live.types';

/**
 * BE → FE: single product.
 *
 * Three non-trivial moves:
 *   1. `priceCents` → `price`. Same numeric value (cents); only
 *      the field name changes — see `products.types.ts` for the
 *      "prices are in minor units throughout" convention.
 *   2. `media.coverImage` (optional, omitempty BE-side) → `coverUrl`
 *      (`string | null` FE-side). Absent or empty becomes `null`.
 *   3. `media.gallery` → `galleryUrls`. The default `[]` from the
 *      BE schema means we never produce `undefined` here even if
 *      the BE omits the field entirely.
 *
 * Extra BE fields (stripePriceId, createdBy, updatedBy) are
 * dropped — the FE has no use for them today and they'd just be
 * dead weight in component props.
 */
export function mapProduct(input: BackendProduct): Product {
  return {
    id: input.id,
    slug: input.slug,
    name: input.name,
    description: input.description,
    price: input.priceCents,
    currency: input.currency,
    active: input.active,
    coverUrl: input.media.coverImage ? input.media.coverImage : null,
    galleryUrls: input.media.gallery,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

export function mapProductList(input: BackendProductList): ProductList {
  return {
    data: input.data.map(mapProduct),
    meta: input.meta,
  };
}

/**
 * FE → BE: create product request.
 *
 * Only one rename: `price` → `priceCents`. Description defaults to
 * the empty string at this boundary so the BE doesn't see
 * `undefined` (Go would treat it as the zero value either way, but
 * being explicit avoids a surprise if the FE schema ever loosens).
 */
export function mapCreateProductRequest(
  input: CreateProductInput,
): BackendCreateProductRequest {
  return {
    slug: input.slug,
    name: input.name,
    description: input.description ?? '',
    priceCents: input.price,
    currency: input.currency,
    active: input.active,
  };
}

/**
 * FE → BE: partial-update request.
 *
 * Preserves the "absent vs explicit-false" distinction the BE
 * relies on for `active` (it uses `*bool` server-side). Fields
 * the FE didn't supply are simply not emitted — the BE then
 * skips the update for them.
 */
export function mapUpdateProductRequest(
  input: UpdateProductInput,
): BackendUpdateProductRequest {
  const out: BackendUpdateProductRequest = {};
  if (input.slug !== undefined) out.slug = input.slug;
  if (input.name !== undefined) out.name = input.name;
  if (input.description !== undefined) out.description = input.description;
  if (input.price !== undefined) out.priceCents = input.price;
  if (input.currency !== undefined) out.currency = input.currency;
  if (input.active !== undefined) out.active = input.active;
  return out;
}
