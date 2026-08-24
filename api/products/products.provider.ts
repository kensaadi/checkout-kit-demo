import { PROVIDER } from '@api/_shared/config';
import type {
  CreateProductInput,
  Product,
  ProductList,
  ProductListQuery,
  UpdateProductInput,
} from './products.types';

/**
 * Contract every products provider must implement.
 *
 * Six read/write operations + four image operations:
 *
 *   Public:
 *     - listProducts   → GET /v1/products       (active-only)
 *     - getBySlug      → GET /v1/products/:slug (active-only)
 *
 *   Admin:
 *     - adminListProducts   → GET    /v1/admin/products
 *     - adminGetById        → GET    /v1/admin/products/:id
 *     - adminCreate         → POST   /v1/admin/products
 *     - adminUpdate         → PATCH  /v1/admin/products/:id
 *     - adminDelete         → DELETE /v1/admin/products/:id
 *     - adminUploadCover    → POST   /v1/admin/products/:id/cover
 *     - adminClearCover     → DELETE /v1/admin/products/:id/cover
 *     - adminAddGallery     → POST   /v1/admin/products/:id/gallery
 *     - adminRemoveGallery  → DELETE /v1/admin/products/:id/gallery
 *
 * The image ops return the updated Product so the caller can
 * sync local state without a re-fetch.
 */
export interface ProductsProvider {
  listProducts(query?: ProductListQuery): Promise<ProductList>;
  getBySlug(slug: string): Promise<Product>;

  adminListProducts(query?: ProductListQuery): Promise<ProductList>;
  adminGetById(id: string): Promise<Product>;
  adminCreate(input: CreateProductInput): Promise<Product>;
  adminUpdate(id: string, input: UpdateProductInput): Promise<Product>;
  adminDelete(id: string): Promise<void>;

  adminUploadCover(id: string, file: File): Promise<Product>;
  adminClearCover(id: string): Promise<Product>;
  adminAddGalleryImage(id: string, file: File): Promise<Product>;
  adminRemoveGalleryImage(id: string, url: string): Promise<Product>;
}

const productsProviderMapping: Record<
  string,
  () => Promise<ProductsProvider>
> = {
  live: () =>
    import('./live/products.live').then(
      (m) => m.default as ProductsProvider,
    ),
  mock: () =>
    import('./mock/products.mock').then(
      (m) => m.default as ProductsProvider,
    ),
};

export async function productsProvider(): Promise<ProductsProvider> {
  const loader = productsProviderMapping[PROVIDER];
  if (!loader) {
    throw new Error(`[products] provider "${PROVIDER}" not supported`);
  }
  return loader();
}
