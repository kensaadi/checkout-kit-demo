import type { CartItemView, CartView } from '../cart.types';
import type { BackendCartView } from './cart.live.types';

/**
 * BE → FE: cart view (+ items).
 *
 * Renames:
 *   - item.coverImage     → item.coverUrl  (absent BE-side → `null`)
 *   - item.priceCents     → item.price
 *   - item.lineTotalCents → item.lineTotal
 *   - subtotalCents       → itemsTotal
 *
 * Drops `itemCount` — the FE recomputes from `items` when it needs
 * the badge count, and persisting it twice in the wire envelope
 * just invites the two numbers to drift.
 *
 * Normalizes the empty-cart case: the BE marks `currency` as
 * `omitempty`, so a brand-new empty cart arrives without the field.
 * The FE schema requires `currency`, so we emit `''` — components
 * already treat empty string as "no currency lock yet".
 */
export function mapCartView(input: BackendCartView): CartView {
  const items: CartItemView[] = input.items.map((it) => ({
    productId: it.productId,
    quantity: it.quantity,
    name: it.name,
    slug: it.slug,
    coverUrl: it.coverImage ? it.coverImage : null,
    price: it.priceCents,
    lineTotal: it.lineTotalCents,
  }));

  return {
    id: input.id,
    customerId: input.customerId,
    currency: input.currency ?? '',
    items,
    itemsTotal: input.subtotalCents,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}
