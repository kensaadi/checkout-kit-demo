import { describe, expect, it } from 'vitest';
import {
  AddItemInputSchema,
  CartItemViewSchema,
  CartViewSchema,
  UpdateItemInputSchema,
} from './cart.types';

describe('CartItemViewSchema', () => {
  it('accepts a well-formed item with all fields', () => {
    const result = CartItemViewSchema.safeParse({
      productId: 'p1',
      quantity: 2,
      name: 'Gold',
      slug: 'gold',
      coverUrl: 'https://example.com/g.png',
      price: 4900,
      lineTotal: 9800,
    });
    expect(result.success).toBe(true);
  });

  it('accepts a null coverUrl', () => {
    const result = CartItemViewSchema.safeParse({
      productId: 'p1',
      quantity: 1,
      name: 'Bronze',
      slug: 'bronze',
      coverUrl: null,
      price: 900,
      lineTotal: 900,
    });
    expect(result.success).toBe(true);
  });

  it('accepts an omitted coverUrl', () => {
    const result = CartItemViewSchema.safeParse({
      productId: 'p1',
      quantity: 1,
      name: 'Bronze',
      slug: 'bronze',
      price: 900,
      lineTotal: 900,
    });
    expect(result.success).toBe(true);
  });

  it('rejects quantity 0', () => {
    const result = CartItemViewSchema.safeParse({
      productId: 'p1',
      quantity: 0,
      name: 'x',
      slug: 'x',
      price: 100,
      lineTotal: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer quantity', () => {
    const result = CartItemViewSchema.safeParse({
      productId: 'p1',
      quantity: 1.5,
      name: 'x',
      slug: 'x',
      price: 100,
      lineTotal: 150,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = CartItemViewSchema.safeParse({
      productId: 'p1',
      quantity: 1,
      name: 'x',
      slug: 'x',
      price: -100,
      lineTotal: -100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing productId', () => {
    const result = CartItemViewSchema.safeParse({
      quantity: 1,
      name: 'x',
      slug: 'x',
      price: 100,
      lineTotal: 100,
    });
    expect(result.success).toBe(false);
  });
});

describe('AddItemInputSchema', () => {
  it('accepts valid input', () => {
    expect(
      AddItemInputSchema.safeParse({ productId: 'p1', quantity: 1 }).success,
    ).toBe(true);
  });

  it('rejects empty productId', () => {
    expect(
      AddItemInputSchema.safeParse({ productId: '', quantity: 1 }).success,
    ).toBe(false);
  });

  it('rejects quantity below 1', () => {
    expect(
      AddItemInputSchema.safeParse({ productId: 'p1', quantity: 0 }).success,
    ).toBe(false);
  });

  it('rejects negative quantity', () => {
    expect(
      AddItemInputSchema.safeParse({ productId: 'p1', quantity: -1 }).success,
    ).toBe(false);
  });

  it('rejects non-integer quantity', () => {
    expect(
      AddItemInputSchema.safeParse({ productId: 'p1', quantity: 1.5 }).success,
    ).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(AddItemInputSchema.safeParse({}).success).toBe(false);
  });
});

describe('UpdateItemInputSchema', () => {
  it('accepts valid quantity', () => {
    expect(UpdateItemInputSchema.safeParse({ quantity: 3 }).success).toBe(true);
  });

  it('rejects quantity 0 (use removeItem instead)', () => {
    expect(UpdateItemInputSchema.safeParse({ quantity: 0 }).success).toBe(
      false,
    );
  });
});

describe('CartViewSchema', () => {
  it('accepts an empty cart', () => {
    const result = CartViewSchema.safeParse({
      id: 'c1',
      customerId: 'cust1',
      currency: '',
      items: [],
      itemsTotal: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('accepts a populated cart', () => {
    const result = CartViewSchema.safeParse({
      id: 'c1',
      customerId: 'cust1',
      currency: 'usd',
      items: [
        {
          productId: 'p1',
          quantity: 2,
          name: 'Gold',
          slug: 'gold',
          coverUrl: null,
          price: 4900,
          lineTotal: 9800,
        },
      ],
      itemsTotal: 9800,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative itemsTotal', () => {
    const result = CartViewSchema.safeParse({
      id: 'c1',
      customerId: 'cust1',
      currency: 'usd',
      items: [],
      itemsTotal: -100,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });
    expect(result.success).toBe(false);
  });
});
