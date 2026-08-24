import { attempt } from '@api/_shared/attempt';
import type { Result } from '@api/_shared/result.types';
import { productsProvider } from './products.provider';
import type {
  CreateProductInput,
  Product,
  ProductList,
  ProductListQuery,
  UpdateProductInput,
} from './products.types';

// === Public (active-only) ===

export async function list_products(
  query?: ProductListQuery,
): Promise<Result<ProductList>> {
  const provider = await productsProvider();
  return attempt(provider.listProducts(query));
}

export async function get_product_by_slug(
  slug: string,
): Promise<Result<Product>> {
  const provider = await productsProvider();
  return attempt(provider.getBySlug(slug));
}

// === Admin (drafts visible, mutations allowed) ===

export async function admin_list_products(
  query?: ProductListQuery,
): Promise<Result<ProductList>> {
  const provider = await productsProvider();
  return attempt(provider.adminListProducts(query));
}

export async function admin_get_product_by_id(
  id: string,
): Promise<Result<Product>> {
  const provider = await productsProvider();
  return attempt(provider.adminGetById(id));
}

export async function admin_create_product(
  input: CreateProductInput,
): Promise<Result<Product>> {
  const provider = await productsProvider();
  return attempt(provider.adminCreate(input));
}

export async function admin_update_product(
  id: string,
  input: UpdateProductInput,
): Promise<Result<Product>> {
  const provider = await productsProvider();
  return attempt(provider.adminUpdate(id, input));
}

export async function admin_delete_product(
  id: string,
): Promise<Result<void>> {
  const provider = await productsProvider();
  return attempt(provider.adminDelete(id));
}

// === Image ops ===

export async function admin_upload_cover(
  id: string,
  file: File,
): Promise<Result<Product>> {
  const provider = await productsProvider();
  return attempt(provider.adminUploadCover(id, file));
}

export async function admin_clear_cover(
  id: string,
): Promise<Result<Product>> {
  const provider = await productsProvider();
  return attempt(provider.adminClearCover(id));
}

export async function admin_add_gallery_image(
  id: string,
  file: File,
): Promise<Result<Product>> {
  const provider = await productsProvider();
  return attempt(provider.adminAddGalleryImage(id, file));
}

export async function admin_remove_gallery_image(
  id: string,
  url: string,
): Promise<Result<Product>> {
  const provider = await productsProvider();
  return attempt(provider.adminRemoveGalleryImage(id, url));
}
