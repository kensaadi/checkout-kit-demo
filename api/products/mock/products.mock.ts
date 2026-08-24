import type { ApiError } from '@api/_shared/error.types';
import { authStore } from '@shared/store/auth.store';
import { decodeJwtPayload } from '../../auth/jwt';
import type { ProductsProvider } from '../products.provider';
import type {
  CreateProductInput,
  Product,
  ProductList,
  ProductListQuery,
  UpdateProductInput,
} from '../products.types';
import { MOCK_DELAY_MS, MOCK_PRODUCTS } from './products.mock.data';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function makeError(
  code: ApiError['code'],
  message: string,
  status: number,
): ApiError {
  return { code, message, status };
}

function isCurrentSubjectAdmin(): boolean {
  const token = authStore.token;
  if (!token) return false;
  return decodeJwtPayload(token)?.roles?.includes('admin') ?? false;
}

function isCurrentSubjectStaff(): boolean {
  const token = authStore.token;
  if (!token) return false;
  const roles = decodeJwtPayload(token)?.roles ?? [];
  return roles.some((r) => r === 'admin' || r === 'sales');
}

function paginate(items: Product[], query?: ProductListQuery): ProductList {
  const page = query?.page ?? 1;
  const perPage = query?.perPage ?? 20;
  const start = (page - 1) * perPage;
  const slice = items.slice(start, start + perPage);
  return {
    data: slice,
    meta: { page, perPage, total: items.length },
  };
}

function findBySlug(slug: string): Product | undefined {
  for (const p of MOCK_PRODUCTS.values()) {
    if (p.slug === slug) return p;
  }
  return undefined;
}

function randomId(): string {
  const hex = Math.random().toString(16).slice(2, 14);
  return `prod-${hex}`;
}

// === Public ===

async function listProducts(query?: ProductListQuery): Promise<ProductList> {
  await delay(MOCK_DELAY_MS);
  // Active-only + newest first.
  const active = Array.from(MOCK_PRODUCTS.values())
    .filter((p) => p.active)
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  return paginate(active, query);
}

async function getBySlug(slug: string): Promise<Product> {
  await delay(MOCK_DELAY_MS);
  const product = findBySlug(slug);
  // Hide drafts from public — same response as not found
  // (matches BE behaviour: no draft existence disclosure).
  if (!product || !product.active) {
    throw makeError('NOT_FOUND', 'product not found', 404);
  }
  return { ...product };
}

// === Admin ===

function requireStaff(): void {
  if (!isCurrentSubjectStaff()) {
    throw makeError('FORBIDDEN', 'staff only', 403);
  }
}

function requireAdmin(): void {
  if (!isCurrentSubjectAdmin()) {
    throw makeError('FORBIDDEN', 'admin only', 403);
  }
}

async function adminListProducts(
  query?: ProductListQuery,
): Promise<ProductList> {
  await delay(MOCK_DELAY_MS);
  requireStaff();
  // Drafts visible. Newest first.
  const all = Array.from(MOCK_PRODUCTS.values()).sort((a, b) =>
    a.createdAt > b.createdAt ? -1 : 1,
  );
  return paginate(all, query);
}

async function adminGetById(id: string): Promise<Product> {
  await delay(MOCK_DELAY_MS);
  requireStaff();
  const product = MOCK_PRODUCTS.get(id);
  if (!product) throw makeError('NOT_FOUND', 'product not found', 404);
  return { ...product };
}

async function adminCreate(input: CreateProductInput): Promise<Product> {
  await delay(MOCK_DELAY_MS);
  requireAdmin();

  // Slug uniqueness — mirrors BE Mongo index.
  if (findBySlug(input.slug)) {
    throw makeError(
      'CONFLICT',
      `slug "${input.slug}" already exists`,
      409,
    );
  }

  const now = new Date().toISOString();
  const product: Product = {
    id: randomId(),
    slug: input.slug,
    name: input.name,
    description: input.description ?? '',
    price: input.price,
    currency: input.currency,
    active: input.active,
    coverUrl: null,
    galleryUrls: [],
    createdAt: now,
    updatedAt: now,
  };
  MOCK_PRODUCTS.set(product.id, product);
  return { ...product };
}

async function adminUpdate(
  id: string,
  input: UpdateProductInput,
): Promise<Product> {
  await delay(MOCK_DELAY_MS);
  requireAdmin();

  const existing = MOCK_PRODUCTS.get(id);
  if (!existing) throw makeError('NOT_FOUND', 'product not found', 404);

  // Slug uniqueness check if changing slug.
  if (input.slug && input.slug !== existing.slug) {
    if (findBySlug(input.slug)) {
      throw makeError(
        'CONFLICT',
        `slug "${input.slug}" already exists`,
        409,
      );
    }
  }

  const updated: Product = {
    ...existing,
    ...input,
    description: input.description ?? existing.description,
    updatedAt: new Date().toISOString(),
  };
  MOCK_PRODUCTS.set(id, updated);
  return { ...updated };
}

async function adminDelete(id: string): Promise<void> {
  await delay(MOCK_DELAY_MS);
  requireAdmin();
  if (!MOCK_PRODUCTS.has(id)) {
    throw makeError('NOT_FOUND', 'product not found', 404);
  }
  MOCK_PRODUCTS.delete(id);
}

// === Image ops ===

/**
 * Mocks an S3 upload by reading the file as a data URL — gives a
 * real (long) URL the FE can render inline. No network involved.
 *
 * Two execution paths because the test environment is Node (no
 * `FileReader`) while the browser has no `Buffer`:
 *   - Browser → FileReader.readAsDataURL
 *   - Node    → File.arrayBuffer() + Buffer.toString('base64')
 */
async function readFileAsDataUrl(file: File): Promise<string> {
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

async function adminUploadCover(id: string, file: File): Promise<Product> {
  await delay(MOCK_DELAY_MS);
  requireAdmin();
  const existing = MOCK_PRODUCTS.get(id);
  if (!existing) throw makeError('NOT_FOUND', 'product not found', 404);

  const dataUrl = await readFileAsDataUrl(file);
  const updated: Product = {
    ...existing,
    coverUrl: dataUrl,
    updatedAt: new Date().toISOString(),
  };
  MOCK_PRODUCTS.set(id, updated);
  return { ...updated };
}

async function adminClearCover(id: string): Promise<Product> {
  await delay(MOCK_DELAY_MS);
  requireAdmin();
  const existing = MOCK_PRODUCTS.get(id);
  if (!existing) throw makeError('NOT_FOUND', 'product not found', 404);

  const updated: Product = {
    ...existing,
    coverUrl: null,
    updatedAt: new Date().toISOString(),
  };
  MOCK_PRODUCTS.set(id, updated);
  return { ...updated };
}

async function adminAddGalleryImage(
  id: string,
  file: File,
): Promise<Product> {
  await delay(MOCK_DELAY_MS);
  requireAdmin();
  const existing = MOCK_PRODUCTS.get(id);
  if (!existing) throw makeError('NOT_FOUND', 'product not found', 404);

  const dataUrl = await readFileAsDataUrl(file);
  const updated: Product = {
    ...existing,
    galleryUrls: [...(existing.galleryUrls ?? []), dataUrl],
    updatedAt: new Date().toISOString(),
  };
  MOCK_PRODUCTS.set(id, updated);
  return { ...updated };
}

async function adminRemoveGalleryImage(
  id: string,
  url: string,
): Promise<Product> {
  await delay(MOCK_DELAY_MS);
  requireAdmin();
  const existing = MOCK_PRODUCTS.get(id);
  if (!existing) throw makeError('NOT_FOUND', 'product not found', 404);

  const updated: Product = {
    ...existing,
    galleryUrls: (existing.galleryUrls ?? []).filter((u) => u !== url),
    updatedAt: new Date().toISOString(),
  };
  MOCK_PRODUCTS.set(id, updated);
  return { ...updated };
}

const productsMockProvider: ProductsProvider = {
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
export default productsMockProvider;
