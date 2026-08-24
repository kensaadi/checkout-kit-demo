import { describe, expect, it } from 'vitest';
import {
  CreateProductInputSchema,
  ProductListSchema,
  ProductSchema,
  UpdateProductInputSchema,
} from './products.types';

describe('ProductSchema', () => {
  it('accepts a fully-populated product', () => {
    expect(
      ProductSchema.safeParse({
        id: 'p1',
        slug: 'gold-plan',
        name: 'Gold',
        description: 'Premium',
        price: 4900,
        currency: 'usd',
        active: true,
        coverUrl: 'https://x/y.png',
        galleryUrls: ['https://x/a.png'],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }).success,
    ).toBe(true);
  });

  it('accepts a null coverUrl', () => {
    expect(
      ProductSchema.safeParse({
        id: 'p1',
        slug: 'g',
        name: 'G',
        price: 100,
        currency: 'usd',
        active: true,
        coverUrl: null,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }).success,
    ).toBe(true);
  });

  it('rejects negative price', () => {
    expect(
      ProductSchema.safeParse({
        id: 'p1',
        slug: 'g',
        name: 'G',
        price: -100,
        currency: 'usd',
        active: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }).success,
    ).toBe(false);
  });
});

describe('CreateProductInputSchema', () => {
  it('accepts valid input', () => {
    expect(
      CreateProductInputSchema.safeParse({
        slug: 'gold-plan',
        name: 'Gold',
        price: 4900,
        currency: 'usd',
        active: true,
      }).success,
    ).toBe(true);
  });

  it('rejects an invalid slug (uppercase / spaces)', () => {
    expect(
      CreateProductInputSchema.safeParse({
        slug: 'Gold Plan',
        name: 'Gold',
        price: 4900,
        currency: 'usd',
        active: true,
      }).success,
    ).toBe(false);
  });

  it('rejects a slug with underscores', () => {
    expect(
      CreateProductInputSchema.safeParse({
        slug: 'gold_plan',
        name: 'G',
        price: 100,
        currency: 'usd',
        active: true,
      }).success,
    ).toBe(false);
  });

  it('rejects negative price', () => {
    expect(
      CreateProductInputSchema.safeParse({
        slug: 'g',
        name: 'G',
        price: -1,
        currency: 'usd',
        active: true,
      }).success,
    ).toBe(false);
  });

  it('rejects empty name', () => {
    expect(
      CreateProductInputSchema.safeParse({
        slug: 'g',
        name: '',
        price: 100,
        currency: 'usd',
        active: true,
      }).success,
    ).toBe(false);
  });
});

describe('UpdateProductInputSchema', () => {
  it('accepts a partial update', () => {
    expect(
      UpdateProductInputSchema.safeParse({ price: 5000 }).success,
    ).toBe(true);
  });

  it('accepts an empty patch (all fields optional)', () => {
    expect(UpdateProductInputSchema.safeParse({}).success).toBe(true);
  });

  it('still rejects an invalid slug', () => {
    expect(
      UpdateProductInputSchema.safeParse({ slug: 'BAD SLUG' }).success,
    ).toBe(false);
  });
});

describe('ProductListSchema', () => {
  it('accepts an empty list', () => {
    expect(
      ProductListSchema.safeParse({
        data: [],
        meta: { page: 1, perPage: 20, total: 0 },
      }).success,
    ).toBe(true);
  });
});
