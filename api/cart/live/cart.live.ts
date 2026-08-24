import axiosClient from '@api/_shared/axios.client';
import type { CartProvider } from '../cart.provider';
import type {
  AddItemInput,
  CartView,
  UpdateItemInput,
} from '../cart.types';
import { mapCartView } from './cart.live.mapper';
import {
  BackendCartViewSchema,
  type BackendCartView,
} from './cart.live.types';

async function getCart(): Promise<CartView> {
  const { data } = await axiosClient.get<BackendCartView>('/v1/cart', {
    responseSchema: BackendCartViewSchema,
  });
  return mapCartView(data);
}

async function addItem(input: AddItemInput): Promise<CartView> {
  // FE → BE: input shape `{ productId, quantity }` matches the Go
  // handler's `addCartItemRequest` exactly — pass-through.
  const { data } = await axiosClient.post<BackendCartView>(
    '/v1/cart/items',
    input,
    { responseSchema: BackendCartViewSchema },
  );
  return mapCartView(data);
}

async function updateItem(
  productId: string,
  input: UpdateItemInput,
): Promise<CartView> {
  const { data } = await axiosClient.patch<BackendCartView>(
    `/v1/cart/items/${encodeURIComponent(productId)}`,
    input,
    { responseSchema: BackendCartViewSchema },
  );
  return mapCartView(data);
}

async function removeItem(productId: string): Promise<CartView> {
  const { data } = await axiosClient.delete<BackendCartView>(
    `/v1/cart/items/${encodeURIComponent(productId)}`,
    { responseSchema: BackendCartViewSchema },
  );
  return mapCartView(data);
}

async function clearCart(): Promise<CartView> {
  const { data } = await axiosClient.delete<BackendCartView>('/v1/cart', {
    responseSchema: BackendCartViewSchema,
  });
  return mapCartView(data);
}

const cartLiveProvider: CartProvider = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};

export default cartLiveProvider;
