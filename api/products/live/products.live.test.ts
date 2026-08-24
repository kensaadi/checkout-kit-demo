import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import axiosClient from '@api/_shared/axios.client';
import productsLiveProvider from './products.live';

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(axiosClient);
});

afterEach(() => {
  mock.restore();
});

// Helper: a minimal BE-shaped product. Mirrors `model.Product` —
// `priceCents`, nested `media.{coverImage,gallery}`, the audit
// fields the FE will strip.
function backendProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'p1',
    slug: 'gold',
    name: 'Gold',
    description: 'shiny',
    priceCents: 4900,
    currency: 'USD',
    active: true,
    media: { coverImage: 'https://cdn/gold.jpg', gallery: ['https://cdn/g1.jpg'] },
    stripePriceId: 'price_x',
    createdBy: 'staff1',
    updatedBy: 'staff1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('productsLiveProvider.listProducts', () => {
  it('maps each item priceCents → price and media → flat URLs', async () => {
    mock.onGet('/v1/products').reply(200, {
      data: [backendProduct()],
      meta: { page: 1, perPage: 20, total: 1 },
    });
    const r = await productsLiveProvider.listProducts();
    expect(r.data).toHaveLength(1);
    expect(r.data[0]!.price).toBe(4900);
    expect(r.data[0]!.coverUrl).toBe('https://cdn/gold.jpg');
    expect(r.data[0]!.galleryUrls).toEqual(['https://cdn/g1.jpg']);
  });

  it('forwards pagination params', async () => {
    mock.onGet('/v1/products').reply((config) => {
      expect(config.params).toEqual({ page: 2, perPage: 5 });
      return [200, { data: [], meta: { page: 2, perPage: 5, total: 0 } }];
    });
    await productsLiveProvider.listProducts({ page: 2, perPage: 5 });
  });
});

describe('productsLiveProvider.getBySlug', () => {
  it('GETs /v1/products/:slug and returns FE shape', async () => {
    mock.onGet('/v1/products/gold').reply(200, backendProduct());
    const r = await productsLiveProvider.getBySlug('gold');
    expect(r.id).toBe('p1');
    expect(r.price).toBe(4900);
  });

  it('treats missing coverImage as coverUrl: null', async () => {
    mock
      .onGet('/v1/products/gold')
      .reply(200, backendProduct({ media: { gallery: [] } }));
    const r = await productsLiveProvider.getBySlug('gold');
    expect(r.coverUrl).toBeNull();
  });

  it('treats empty coverImage string as coverUrl: null', async () => {
    mock
      .onGet('/v1/products/gold')
      .reply(200, backendProduct({ media: { coverImage: '', gallery: [] } }));
    const r = await productsLiveProvider.getBySlug('gold');
    expect(r.coverUrl).toBeNull();
  });

  it('throws CONTRACT_MISMATCH on shape that does not match the BE schema', async () => {
    mock.onGet('/v1/products/gold').reply(200, { unexpected: 'shape' });
    await expect(productsLiveProvider.getBySlug('gold')).rejects.toMatchObject({
      code: 'CONTRACT_MISMATCH',
    });
  });
});

describe('productsLiveProvider.adminCreate', () => {
  it('renames price → priceCents on the request body', async () => {
    mock.onPost('/v1/admin/products').reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({
        slug: 'gold',
        name: 'Gold',
        description: 'shiny',
        priceCents: 4900,
        currency: 'USD',
        active: true,
      });
      return [201, backendProduct()];
    });
    const r = await productsLiveProvider.adminCreate({
      slug: 'gold',
      name: 'Gold',
      description: 'shiny',
      price: 4900,
      currency: 'USD',
      active: true,
    });
    expect(r.price).toBe(4900);
  });
});

describe('productsLiveProvider.adminUpdate', () => {
  it('only emits the fields the FE supplied (preserves absent vs explicit-false)', async () => {
    mock.onPatch('/v1/admin/products/p1').reply((config) => {
      // FE supplied only { price, active: false } — the body must
      // carry priceCents + active, NOT the other fields with empty
      // strings (the BE would interpret those as "clear it").
      expect(JSON.parse(config.data as string)).toEqual({
        priceCents: 5500,
        active: false,
      });
      return [200, backendProduct({ priceCents: 5500, active: false })];
    });
    const r = await productsLiveProvider.adminUpdate('p1', {
      price: 5500,
      active: false,
    });
    expect(r.price).toBe(5500);
    expect(r.active).toBe(false);
  });
});

describe('productsLiveProvider.adminUploadCover', () => {
  it('POSTs multipart and returns mapped product', async () => {
    mock.onPost('/v1/admin/products/p1/cover').reply(200, backendProduct());
    const file = new File(['x'], 'cover.png', { type: 'image/png' });
    const r = await productsLiveProvider.adminUploadCover('p1', file);
    expect(r.coverUrl).toBe('https://cdn/gold.jpg');
  });
});

describe('productsLiveProvider.adminRemoveGalleryImage', () => {
  it('sends the URL in the JSON body (not as a query param)', async () => {
    mock.onDelete('/v1/admin/products/p1/gallery').reply((config) => {
      expect(config.params).toBeUndefined();
      expect(JSON.parse(config.data as string)).toEqual({
        url: 'https://cdn/g1.jpg',
      });
      return [200, backendProduct()];
    });
    await productsLiveProvider.adminRemoveGalleryImage('p1', 'https://cdn/g1.jpg');
  });
});

describe('productsLiveProvider.adminDelete', () => {
  it('DELETEs and resolves to void on 204', async () => {
    mock.onDelete('/v1/admin/products/p1').reply(204);
    await expect(
      productsLiveProvider.adminDelete('p1'),
    ).resolves.toBeUndefined();
  });
});
