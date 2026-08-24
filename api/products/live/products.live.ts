import axiosClient from '@api/_shared/axios.client';
import type { ProductsProvider } from '../products.provider';
import type {
  CreateProductInput,
  Product,
  ProductList,
  ProductListQuery,
  UpdateProductInput,
} from '../products.types';
import {
  mapCreateProductRequest,
  mapProduct,
  mapProductList,
  mapUpdateProductRequest,
} from './products.live.mapper';
import {
  BackendProductListSchema,
  BackendProductSchema,
  type BackendProduct,
  type BackendProductList,
} from './products.live.types';

function toParams(q?: ProductListQuery): Record<string, number> | undefined {
  if (!q) return undefined;
  const params: Record<string, number> = {};
  if (q.page !== undefined) params.page = q.page;
  if (q.perPage !== undefined) params.perPage = q.perPage;
  return Object.keys(params).length > 0 ? params : undefined;
}

// === Public ===

async function listProducts(query?: ProductListQuery): Promise<ProductList> {
  const { data } = await axiosClient.get<BackendProductList>('/v1/products', {
    params: toParams(query),
    responseSchema: BackendProductListSchema,
  });
  return mapProductList(data);
}

async function getBySlug(slug: string): Promise<Product> {
  const { data } = await axiosClient.get<BackendProduct>(
    `/v1/products/${encodeURIComponent(slug)}`,
    { responseSchema: BackendProductSchema },
  );
  return mapProduct(data);
}

// === Admin ===

async function adminListProducts(
  query?: ProductListQuery,
): Promise<ProductList> {
  const { data } = await axiosClient.get<BackendProductList>(
    '/v1/admin/products',
    {
      params: toParams(query),
      responseSchema: BackendProductListSchema,
    },
  );
  return mapProductList(data);
}

async function adminGetById(id: string): Promise<Product> {
  const { data } = await axiosClient.get<BackendProduct>(
    `/v1/admin/products/${encodeURIComponent(id)}`,
    { responseSchema: BackendProductSchema },
  );
  return mapProduct(data);
}

async function adminCreate(input: CreateProductInput): Promise<Product> {
  const { data } = await axiosClient.post<BackendProduct>(
    '/v1/admin/products',
    mapCreateProductRequest(input),
    { responseSchema: BackendProductSchema },
  );
  return mapProduct(data);
}

async function adminUpdate(
  id: string,
  input: UpdateProductInput,
): Promise<Product> {
  const { data } = await axiosClient.patch<BackendProduct>(
    `/v1/admin/products/${encodeURIComponent(id)}`,
    mapUpdateProductRequest(input),
    { responseSchema: BackendProductSchema },
  );
  return mapProduct(data);
}

async function adminDelete(id: string): Promise<void> {
  await axiosClient.delete(`/v1/admin/products/${encodeURIComponent(id)}`);
}

// === Image ops ===

async function adminUploadCover(id: string, file: File): Promise<Product> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await axiosClient.post<BackendProduct>(
    `/v1/admin/products/${encodeURIComponent(id)}/cover`,
    form,
    {
      responseSchema: BackendProductSchema,
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return mapProduct(data);
}

async function adminClearCover(id: string): Promise<Product> {
  const { data } = await axiosClient.delete<BackendProduct>(
    `/v1/admin/products/${encodeURIComponent(id)}/cover`,
    { responseSchema: BackendProductSchema },
  );
  return mapProduct(data);
}

async function adminAddGalleryImage(
  id: string,
  file: File,
): Promise<Product> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await axiosClient.post<BackendProduct>(
    `/v1/admin/products/${encodeURIComponent(id)}/gallery`,
    form,
    {
      responseSchema: BackendProductSchema,
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return mapProduct(data);
}

async function adminRemoveGalleryImage(
  id: string,
  url: string,
): Promise<Product> {
  // BE handler reads the URL from the JSON body (not the query
  // string) — axios's `data` option on DELETE puts the payload
  // there.
  const { data } = await axiosClient.delete<BackendProduct>(
    `/v1/admin/products/${encodeURIComponent(id)}/gallery`,
    {
      data: { url },
      responseSchema: BackendProductSchema,
    },
  );
  return mapProduct(data);
}

const productsLiveProvider: ProductsProvider = {
  listProducts,
  getBySlug,
  adminListProducts,
  adminGetById,
  adminCreate,
  adminUpdate,
  adminDelete,
  adminUploadCover,
  adminClearCover,
  adminAddGalleryImage,
  adminRemoveGalleryImage,
};
export default productsLiveProvider;
