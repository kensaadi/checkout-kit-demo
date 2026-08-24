import { attempt } from '@api/_shared/attempt';
import type { Result } from '@api/_shared/result.types';
import { ordersProvider } from './orders.provider';
import type { Order, OrderList, OrderListQuery } from './orders.types';

/**
 * Fetches one order by id from the customer-scoped endpoint.
 * Returns 404 if the order does not belong to the signed-in
 * customer (the BE deliberately doesn't leak existence — same
 * 404 for "does not exist" and "exists but not yours").
 *
 * Used by the checkout `CompleteStep` to poll for the
 * `pending_payment → paid/failed` transition driven by the
 * Stripe webhook.
 */
export async function get_my_order_by_id(
  id: string,
): Promise<Result<Order>> {
  const provider = await ordersProvider();
  return attempt(provider.getMyOrderById(id));
}

/** GET /v1/orders — customer view, paginated. */
export async function list_my_orders(
  query?: OrderListQuery,
): Promise<Result<OrderList>> {
  const provider = await ordersProvider();
  return attempt(provider.listMyOrders(query));
}

/** GET /v1/admin/orders/:id — staff view. */
export async function admin_get_order_by_id(
  id: string,
): Promise<Result<Order>> {
  const provider = await ordersProvider();
  return attempt(provider.getOrderByIdAdmin(id));
}

/** GET /v1/admin/orders — staff view, paginated. */
export async function admin_list_orders(
  query?: OrderListQuery,
): Promise<Result<OrderList>> {
  const provider = await ordersProvider();
  return attempt(provider.listOrdersAdmin(query));
}
