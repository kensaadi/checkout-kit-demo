import axiosClient from '@api/_shared/axios.client';
import type { OrdersProvider } from '../orders.provider';
import type { Order, OrderList, OrderListQuery } from '../orders.types';
import { mapOrder, mapOrderList } from './orders.live.mapper';
import {
  BackendOrderListSchema,
  BackendOrderSchema,
  type BackendOrder,
  type BackendOrderList,
} from './orders.live.types';

function toParams(q?: OrderListQuery): Record<string, number> | undefined {
  if (!q) return undefined;
  const params: Record<string, number> = {};
  if (q.page !== undefined) params.page = q.page;
  if (q.perPage !== undefined) params.perPage = q.perPage;
  return Object.keys(params).length > 0 ? params : undefined;
}

async function getMyOrderById(id: string): Promise<Order> {
  const { data } = await axiosClient.get<BackendOrder>(
    `/v1/orders/${encodeURIComponent(id)}`,
    { responseSchema: BackendOrderSchema },
  );
  return mapOrder(data);
}

async function listMyOrders(query?: OrderListQuery): Promise<OrderList> {
  const { data } = await axiosClient.get<BackendOrderList>('/v1/orders', {
    params: toParams(query),
    responseSchema: BackendOrderListSchema,
  });
  return mapOrderList(data);
}

async function getOrderByIdAdmin(id: string): Promise<Order> {
  const { data } = await axiosClient.get<BackendOrder>(
    `/v1/admin/orders/${encodeURIComponent(id)}`,
    { responseSchema: BackendOrderSchema },
  );
  return mapOrder(data);
}

async function listOrdersAdmin(query?: OrderListQuery): Promise<OrderList> {
  const { data } = await axiosClient.get<BackendOrderList>(
    '/v1/admin/orders',
    {
      params: toParams(query),
      responseSchema: BackendOrderListSchema,
    },
  );
  return mapOrderList(data);
}

const ordersLiveProvider: OrdersProvider = {
  getMyOrderById,
  listMyOrders,
  getOrderByIdAdmin,
  listOrdersAdmin,
};
export default ordersLiveProvider;
