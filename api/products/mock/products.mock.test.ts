import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { authStore } from '@shared/store/auth.store';
import { encodeMockJwt } from '../../auth/jwt';
import productsMockProvider from './products.mock';
import { _resetMockProducts } from './products.mock.data';

const ANON_TOKEN = '';
const CUSTOMER_TOKEN = encodeMockJwt({
  sub: 'mock-customer-001',
  roles: ['customer'],
});
const SALES_TOKEN = encodeMockJwt({
  sub: 'mock-sales-001',
  roles: ['sales'],
});
const ADMIN_TOKEN = encodeMockJwt({
  sub: 'mock-admin-001',
  roles: ['admin'],
});

beforeEach(() => {
  _resetMockProducts();
  authStore.token = ANON_TOKEN || null;
});

afterEach(() => {
  _resetMockProducts();
  authStore.token = null;
});

describe('productsMockProvider — public reads', () => {
  it('listProducts hides drafts (active=false)', async () => {
    const list = await productsMockProvider.listProducts();
    expect(list.data.every((p) => p.active)).toBe(true);
    // Seed has 6 products total, 5 active + 1 draft.
    expect(list.data).toHaveLength(5);
  });

  it('getBySlug returns an active product', async () => {
    const product = await productsMockProvider.getBySlug(
      'dashforge-pro-annual',
    );
    expect(product.name).toBe('DashForge Pro — Annual');
  });

  it('getBySlug returns 404 for a draft slug', async () => {
    await expect(
      productsMockProvider.getBySlug('enterprise-coming-soon'),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('getBySlug returns 404 for an unknown slug', async () => {
    await expect(
      productsMockProvider.getBySlug('nonexistent'),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('productsMockProvider — admin reads', () => {
  it('adminListProducts shows drafts', async () => {
    authStore.token = SALES_TOKEN;
    const list = await productsMockProvider.adminListProducts();
    expect(list.data).toHaveLength(6);
    expect(list.data.some((p) => !p.active)).toBe(true);
  });

  it('adminListProducts denies a customer (FORBIDDEN)', async () => {
    authStore.token = CUSTOMER_TOKEN;
    await expect(
      productsMockProvider.adminListProducts(),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('adminGetById finds drafts by id', async () => {
    authStore.token = ADMIN_TOKEN;
    const product =
      await productsMockProvider.adminGetById('prod-enterprise-draft');
    expect(product.active).toBe(false);
  });
});

describe('productsMockProvider — admin create', () => {
  it('creates a new product', async () => {
    authStore.token = ADMIN_TOKEN;
    const created = await productsMockProvider.adminCreate({
      slug: 'platinum-plan',
      name: 'Platinum',
      description: '',
      price: 99900,
      currency: 'usd',
      active: true,
    });
    expect(created.slug).toBe('platinum-plan');
    expect(created.id).toMatch(/^prod-/);

    const after = await productsMockProvider.adminListProducts();
    expect(after.data).toHaveLength(7);
  });

  it('rejects a duplicate slug with CONFLICT', async () => {
    authStore.token = ADMIN_TOKEN;
    await expect(
      productsMockProvider.adminCreate({
        slug: 'dashforge-pro-annual', // already seeded
        name: 'x',
        description: '',
        price: 100,
        currency: 'usd',
        active: true,
      }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('denies a sales user (admin-only)', async () => {
    authStore.token = SALES_TOKEN;
    await expect(
      productsMockProvider.adminCreate({
        slug: 'x',
        name: 'x',
        description: '',
        price: 1,
        currency: 'usd',
        active: true,
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

describe('productsMockProvider — admin update + delete', () => {
  it('updates an existing product', async () => {
    authStore.token = ADMIN_TOKEN;
    const updated = await productsMockProvider.adminUpdate(
      'prod-pro-annual',
      { price: 5900 },
    );
    expect(updated.price).toBe(5900);
    expect(updated.name).toBe('DashForge Pro — Annual'); // other fields preserved
  });

  it('rejects updating to a duplicate slug', async () => {
    authStore.token = ADMIN_TOKEN;
    await expect(
      productsMockProvider.adminUpdate('prod-pro-annual', {
        slug: 'starter-monthly',
      }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('deletes a product', async () => {
    authStore.token = ADMIN_TOKEN;
    await productsMockProvider.adminDelete('prod-pro-annual');
    await expect(
      productsMockProvider.adminGetById('prod-pro-annual'),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('productsMockProvider — image ops', () => {
  function tinyPng(): File {
    // Minimal 1x1 transparent PNG.
    const bytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    return new File([bytes], 'pixel.png', { type: 'image/png' });
  }

  it('adminUploadCover stores a data URL on coverUrl', async () => {
    authStore.token = ADMIN_TOKEN;
    const updated = await productsMockProvider.adminUploadCover(
      'prod-starter-monthly',
      tinyPng(),
    );
    expect(updated.coverUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('adminClearCover sets coverUrl to null', async () => {
    authStore.token = ADMIN_TOKEN;
    await productsMockProvider.adminUploadCover('prod-starter-monthly', tinyPng());
    const updated = await productsMockProvider.adminClearCover(
      'prod-starter-monthly',
    );
    expect(updated.coverUrl).toBeNull();
  });

  it('adminAddGalleryImage appends to galleryUrls', async () => {
    authStore.token = ADMIN_TOKEN;
    const updated = await productsMockProvider.adminAddGalleryImage(
      'prod-starter-monthly',
      tinyPng(),
    );
    expect(updated.galleryUrls).toHaveLength(1);
  });

  it('adminRemoveGalleryImage removes the matching URL', async () => {
    authStore.token = ADMIN_TOKEN;
    const after = await productsMockProvider.adminAddGalleryImage(
      'prod-starter-monthly',
      tinyPng(),
    );
    const url = after.galleryUrls![0]!;
    const removed = await productsMockProvider.adminRemoveGalleryImage(
      'prod-starter-monthly',
      url,
    );
    expect(removed.galleryUrls).toHaveLength(0);
  });
});
