import type { Order, OrderItem, OrderList } from '../orders.types';
import type { BackendOrder, BackendOrderList } from './orders.live.types';

/**
 * BE → FE: single order (+ line items).
 *
 * Renames (same pattern as the cart mapper):
 *   - item.priceCents     → item.price
 *   - item.lineTotalCents → item.lineTotal
 *   - order.subtotalCents → order.itemsTotal
 *
 * The terminal-transition timestamps `paidAt` / `refundedAt` are
 * emitted by the BE but not consumed by the FE today — dropped
 * here so the FE shape stays lean.
 */
export function mapOrder(input: BackendOrder): Order {
  const items: OrderItem[] = input.items.map((it) => ({
    productId: it.productId,
    name: it.name,
    slug: it.slug,
    price: it.priceCents,
    quantity: it.quantity,
    lineTotal: it.lineTotalCents,
  }));

  return {
    id: input.id,
    customerId: input.customerId,
    currency: input.currency,
    items,
    itemsTotal: input.subtotalCents,
    stripePaymentIntentId: input.stripePaymentIntentId,
    stripeChargeId: input.stripeChargeId,
    status: input.status,
    failureReason: input.failureReason,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

export function mapOrderList(input: BackendOrderList): OrderList {
  return {
    data: input.data.map(mapOrder),
    meta: input.meta,
  };
}
