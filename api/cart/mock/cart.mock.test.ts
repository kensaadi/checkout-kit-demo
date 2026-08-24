import { beforeEach, describe, expect, it } from 'vitest';
import cartMockProvider, { _resetMockCart } from './cart.mock';

beforeEach(() => {
  _resetMockCart();
});

describe('cartMockProvider.getCart', () => {
  it('returns an empty cart initially', async () => {
    const cart = await cartMockProvider.getCart();
    expect(cart.items).toEqual([]);
    expect(cart.itemsTotal).toBe(0);
    expect(cart.currency).toBe('');
  });
});

describe('cartMockProvider.addItem', () => {
  it('adds a new line and locks the currency', async () => {
    const cart = await cartMockProvider.addItem({
      productId: 'prod-pro-annual',
      quantity: 1,
    });
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({
      productId: 'prod-pro-annual',
      quantity: 1,
      name: 'DashForge Pro — Annual',
      price: 49900,
      lineTotal: 49900,
    });
    expect(cart.currency).toBe('usd');
    expect(cart.itemsTotal).toBe(49900);
  });

  it('merges quantity when the same product is added again', async () => {
    await cartMockProvider.addItem({ productId: 'prod-pro-annual', quantity: 1 });
    const cart = await cartMockProvider.addItem({
      productId: 'prod-pro-annual',
      quantity: 2,
    });
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]?.quantity).toBe(3);
    expect(cart.items[0]?.lineTotal).toBe(49900 * 3);
    expect(cart.itemsTotal).toBe(49900 * 3);
  });

  it('appends a new line for a different product', async () => {
    await cartMockProvider.addItem({ productId: 'prod-pro-annual', quantity: 1 });
    const cart = await cartMockProvider.addItem({
      productId: 'prod-starter-monthly',
      quantity: 1,
    });
    expect(cart.items).toHaveLength(2);
    expect(cart.itemsTotal).toBe(49900 + 1900);
  });

  it('throws when the product does not exist in the catalog', async () => {
    await expect(
      cartMockProvider.addItem({ productId: 'nonexistent', quantity: 1 }),
    ).rejects.toThrow('product not found');
  });

  it('throws when adding an item with a different currency', async () => {
    await cartMockProvider.addItem({ productId: 'prod-pro-annual', quantity: 1 });
    await expect(
      cartMockProvider.addItem({
        productId: 'prod-eur-platinum',
        quantity: 1,
      }),
    ).rejects.toThrow(/currency mismatch/);
  });
});

describe('cartMockProvider.updateItem', () => {
  it('sets ABSOLUTE quantity, not merged', async () => {
    await cartMockProvider.addItem({ productId: 'prod-pro-annual', quantity: 3 });
    const cart = await cartMockProvider.updateItem('prod-pro-annual', {
      quantity: 5,
    });
    expect(cart.items[0]?.quantity).toBe(5);
    expect(cart.itemsTotal).toBe(49900 * 5);
  });

  it('throws when the item is not in the cart', async () => {
    await expect(
      cartMockProvider.updateItem('prod-pro-annual', { quantity: 5 }),
    ).rejects.toThrow(/not in cart/);
  });
});

describe('cartMockProvider.removeItem', () => {
  it('removes an existing line', async () => {
    await cartMockProvider.addItem({ productId: 'prod-pro-annual', quantity: 1 });
    await cartMockProvider.addItem({ productId: 'prod-starter-monthly', quantity: 1 });
    const cart = await cartMockProvider.removeItem('prod-pro-annual');
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]?.productId).toBe('prod-starter-monthly');
    expect(cart.itemsTotal).toBe(1900);
  });

  it('is idempotent — removing a missing productId is a no-op success', async () => {
    await cartMockProvider.addItem({ productId: 'prod-pro-annual', quantity: 1 });
    const cart = await cartMockProvider.removeItem('nonexistent');
    expect(cart.items).toHaveLength(1);
  });

  it('resets the currency lock when the cart becomes empty', async () => {
    await cartMockProvider.addItem({ productId: 'prod-pro-annual', quantity: 1 });
    const cart = await cartMockProvider.removeItem('prod-pro-annual');
    expect(cart.items).toEqual([]);
    expect(cart.currency).toBe('');
  });
});

describe('cartMockProvider.clearCart', () => {
  it('empties the cart and resets the currency lock', async () => {
    await cartMockProvider.addItem({ productId: 'prod-pro-annual', quantity: 1 });
    const cart = await cartMockProvider.clearCart();
    expect(cart.items).toEqual([]);
    expect(cart.itemsTotal).toBe(0);
    expect(cart.currency).toBe('');
  });

  it('is idempotent — clearing an empty cart still succeeds', async () => {
    const cart = await cartMockProvider.clearCart();
    expect(cart.items).toEqual([]);
    expect(cart.itemsTotal).toBe(0);
  });

  it('allows mixing a different currency after clear', async () => {
    await cartMockProvider.addItem({ productId: 'prod-pro-annual', quantity: 1 });
    await cartMockProvider.clearCart();
    const cart = await cartMockProvider.addItem({
      productId: 'prod-eur-platinum',
      quantity: 1,
    });
    expect(cart.currency).toBe('eur');
  });
});

describe('cartMockProvider — total recalculation', () => {
  it('itemsTotal is the sum of all line totals', async () => {
    await cartMockProvider.addItem({ productId: 'prod-pro-annual', quantity: 2 });
    const cart = await cartMockProvider.addItem({
      productId: 'prod-starter-monthly',
      quantity: 3,
    });
    expect(cart.itemsTotal).toBe(49900 * 2 + 1900 * 3);
  });
});
