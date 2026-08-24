import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from './products.types';

const { SAMPLE_PRODUCT, mockProvider } = vi.hoisted(() => {
  const SAMPLE_PRODUCT: Product = {
    id: 'p1',
    slug: 'g',
    name: 'Gold',
    description: '',
    price: 4900,
    currency: 'usd',
    active: true,
    coverUrl: null,
    galleryUrls: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
  return {
    SAMPLE_PRODUCT,
    mockProvider: {
      listProducts: vi.fn(),
      getBySlug: vi.fn(),
      adminListProducts: vi.fn(),
      adminGetById: vi.fn(),
      adminCreate: vi.fn(),
      adminUpdate: vi.fn(),
      adminDelete: vi.fn(),
      adminUploadCover: vi.fn(),
      adminClearCover: vi.fn(),
      adminAddGalleryImage: vi.fn(),
      adminRemoveGalleryImage: vi.fn(),
    },
  };
});

vi.mock('./products.provider', () => ({
  productsProvider: () => Promise.resolve(mockProvider),
}));

import {
  admin_add_gallery_image,
  admin_clear_cover,
  admin_create_product,
  admin_delete_product,
  admin_get_product_by_id,
  admin_list_products,
  admin_remove_gallery_image,
  admin_update_product,
  admin_upload_cover,
  get_product_by_slug,
  list_products,
} from './products.service';

beforeEach(() => vi.clearAllMocks());

describe('public reads', () => {
  it('list_products forwards pagination', async () => {
    mockProvider.listProducts.mockResolvedValueOnce({
      data: [SAMPLE_PRODUCT],
      meta: { page: 1, perPage: 12, total: 1 },
    });
    await list_products({ page: 1, perPage: 12 });
    expect(mockProvider.listProducts).toHaveBeenCalledWith({
      page: 1,
      perPage: 12,
    });
  });

  it('get_product_by_slug forwards the slug', async () => {
    mockProvider.getBySlug.mockResolvedValueOnce(SAMPLE_PRODUCT);
    await get_product_by_slug('gold-plan');
    expect(mockProvider.getBySlug).toHaveBeenCalledWith('gold-plan');
  });

  it('get_product_by_slug returns 404 for drafts', async () => {
    mockProvider.getBySlug.mockRejectedValueOnce({
      code: 'NOT_FOUND' as const,
      message: 'product not found',
      status: 404,
    });
    const r = await get_product_by_slug('enterprise-plan');
    expect(r.error?.code).toBe('NOT_FOUND');
  });
});

describe('admin reads', () => {
  it('admin_list_products goes to the admin path', async () => {
    mockProvider.adminListProducts.mockResolvedValueOnce({
      data: [],
      meta: { page: 1, perPage: 20, total: 0 },
    });
    await admin_list_products();
    expect(mockProvider.adminListProducts).toHaveBeenCalled();
    expect(mockProvider.listProducts).not.toHaveBeenCalled();
  });

  it('admin_get_product_by_id forwards the id', async () => {
    mockProvider.adminGetById.mockResolvedValueOnce(SAMPLE_PRODUCT);
    await admin_get_product_by_id('p1');
    expect(mockProvider.adminGetById).toHaveBeenCalledWith('p1');
  });
});

describe('admin mutations', () => {
  it('admin_create_product forwards the input', async () => {
    mockProvider.adminCreate.mockResolvedValueOnce(SAMPLE_PRODUCT);
    const input = {
      slug: 'g',
      name: 'G',
      description: '',
      price: 100,
      currency: 'usd',
      active: true,
    };
    await admin_create_product(input);
    expect(mockProvider.adminCreate).toHaveBeenCalledWith(input);
  });

  it('admin_update_product passes id and partial input separately', async () => {
    mockProvider.adminUpdate.mockResolvedValueOnce(SAMPLE_PRODUCT);
    await admin_update_product('p1', { price: 5000 });
    expect(mockProvider.adminUpdate).toHaveBeenCalledWith('p1', {
      price: 5000,
    });
  });

  it('admin_delete_product forwards the id', async () => {
    mockProvider.adminDelete.mockResolvedValueOnce(undefined);
    await admin_delete_product('p1');
    expect(mockProvider.adminDelete).toHaveBeenCalledWith('p1');
  });
});

describe('image ops', () => {
  it('admin_upload_cover passes id + file', async () => {
    mockProvider.adminUploadCover.mockResolvedValueOnce(SAMPLE_PRODUCT);
    const file = new File(['x'], 'cover.png', { type: 'image/png' });
    await admin_upload_cover('p1', file);
    expect(mockProvider.adminUploadCover).toHaveBeenCalledWith('p1', file);
  });

  it('admin_clear_cover passes id', async () => {
    mockProvider.adminClearCover.mockResolvedValueOnce(SAMPLE_PRODUCT);
    await admin_clear_cover('p1');
    expect(mockProvider.adminClearCover).toHaveBeenCalledWith('p1');
  });

  it('admin_add_gallery_image passes id + file', async () => {
    mockProvider.adminAddGalleryImage.mockResolvedValueOnce(SAMPLE_PRODUCT);
    const file = new File(['x'], 'g.png', { type: 'image/png' });
    await admin_add_gallery_image('p1', file);
    expect(mockProvider.adminAddGalleryImage).toHaveBeenCalledWith('p1', file);
  });

  it('admin_remove_gallery_image passes id + url', async () => {
    mockProvider.adminRemoveGalleryImage.mockResolvedValueOnce(SAMPLE_PRODUCT);
    await admin_remove_gallery_image('p1', 'https://x/a.png');
    expect(mockProvider.adminRemoveGalleryImage).toHaveBeenCalledWith(
      'p1',
      'https://x/a.png',
    );
  });
});
