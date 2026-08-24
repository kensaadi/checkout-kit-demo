import { PROVIDER } from '@api/_shared/config';
import type { Order, OrderList, OrderListQuery } from './orders.types';

/**
 * Contract every orders provider must implement.
 *
 * Reads only — orders are mutated only by the Stripe webhook on
 * the BE side. The FE never has a write path against orders.
 */
export interface OrdersProvider {
  /** GET /v1/orders/:id — customer view (own orders only). */
  getMyOrderById(id: string): Promise<Order>;

  /** GET /v1/orders — customer view, paginated. */
  listMyOrders(query?: OrderListQuery): Promise<OrderList>;

  /** GET /v1/admin/orders/:id — staff view. */
  getOrderByIdAdmin(id: string): Promise<Order>;

  /** GET /v1/admin/orders — staff view, paginated. */
  listOrdersAdmin(query?: OrderListQuery): Promise<OrderList>;
}

const ordersProviderMapping: Record<string, () => Promise<OrdersProvider>> = {
  live: () =>
    import('./live/orders.live').then((m) => m.default as OrdersProvider),
  mock: () =>
    import('./mock/orders.mock').then((m) => m.default as OrdersProvider),
};

export async function ordersProvider(): Promise<OrdersProvider> {
  const loader = ordersProviderMapping[PROVIDER];
  if (!loader) {
    throw new Error(`[orders] provider "${PROVIDER}" not supported`);
  }
  return loader();
}
