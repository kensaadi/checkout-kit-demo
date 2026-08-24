import type { ApiError } from '@api/_shared/error.types';
import { authStore } from '@shared/store/auth.store';
import { decodeJwtPayload } from '../../auth/jwt';
import type { OrdersProvider } from '../orders.provider';
import type { Order, OrderList, OrderListQuery } from '../orders.types';
import { MOCK_DELAY_MS, MOCK_ORDERS } from './orders.mock.data';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function makeError(
  code: ApiError['code'],
  message: string,
  status: number,
): ApiError {
  return { code, message, status };
}

/** Reads `sub` from the JWT in authStore. Returns null if missing. */
function currentSubjectId(): string | null {
  const token = authStore.token;
  if (!token) return null;
  return decodeJwtPayload(token)?.sub ?? null;
}

/** Returns true if the JWT carries an admin or sales role. */
function isCurrentSubjectStaff(): boolean {
  const token = authStore.token;
  if (!token) return false;
  const roles = decodeJwtPayload(token)?.roles ?? [];
  return roles.some((r) => r === 'admin' || r === 'sales');
}

async function getMyOrderById(id: string): Promise<Order> {
  await delay(MOCK_DELAY_MS);
  const sub = currentSubjectId();
  if (!sub) throw makeError('UNAUTHORIZED', 'not signed in', 401);

  const order = MOCK_ORDERS.get(id);
  // 404 covers both "does not exist" and "not yours" — same
  // response, no info-disclosure leak (matches BE behaviour).
  if (!order || order.customerId !== sub) {
    throw makeError('NOT_FOUND', 'order not found', 404);
  }
  return { ...order };
}

async function listMyOrders(query?: OrderListQuery): Promise<OrderList> {
  await delay(MOCK_DELAY_MS);
  const sub = currentSubjectId();
  if (!sub) throw makeError('UNAUTHORIZED', 'not signed in', 401);

  const all = Array.from(MOCK_ORDERS.values())
    .filter((o) => o.customerId === sub)
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  return paginate(all, query);
}

async function getOrderByIdAdmin(id: string): Promise<Order> {
  await delay(MOCK_DELAY_MS);
  if (!isCurrentSubjectStaff()) {
    throw makeError('FORBIDDEN', 'staff only', 403);
  }
  const order = MOCK_ORDERS.get(id);
  if (!order) throw makeError('NOT_FOUND', 'order not found', 404);
  return { ...order };
}

async function listOrdersAdmin(query?: OrderListQuery): Promise<OrderList> {
  await delay(MOCK_DELAY_MS);
  if (!isCurrentSubjectStaff()) {
    throw makeError('FORBIDDEN', 'staff only', 403);
  }
  const all = Array.from(MOCK_ORDERS.values()).sort((a, b) =>
    a.createdAt > b.createdAt ? -1 : 1,
  );
  return paginate(all, query);
}

function paginate(all: Order[], query?: OrderListQuery): OrderList {
  const page = query?.page ?? 1;
  const perPage = query?.perPage ?? 20;
  const start = (page - 1) * perPage;
  const items = all.slice(start, start + perPage);
  return {
    data: items,
    meta: { page, perPage, total: all.length },
  };
}

const ordersMockProvider: OrdersProvider = {
  getMyOrderById,
  listMyOrders,
  getOrderByIdAdmin,
  listOrdersAdmin,
};
export default ordersMockProvider;
