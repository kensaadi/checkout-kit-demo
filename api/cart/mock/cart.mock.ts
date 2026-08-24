import type { CartProvider } from '../cart.provider';
import type {
  AddItemInput,
  CartItemView,
  CartView,
  UpdateItemInput,
} from '../cart.types';
import {
  MOCK_DELAY_MS,
  MOCK_EMPTY_CART,
  MOCK_PRODUCTS,
} from './cart.mock.data';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Returns a fresh empty cart with newly-allocated `items` array.
 *
 * Why this exists: `MOCK_EMPTY_CART` is a shared constant. A naive
 * `{ ...MOCK_EMPTY_CART }` is a shallow copy — `items` would still
 * point at the constant's array, and `_cart.items.push(...)` would
 * mutate the template. `freshCart` allocates new internals so each
 * reset truly starts from scratch.
 */
function freshCart(): CartView {
  return {
    id: MOCK_EMPTY_CART.id,
    customerId: MOCK_EMPTY_CART.customerId,
    currency: '',
    items: [],
    itemsTotal: 0,
    createdAt: MOCK_EMPTY_CART.createdAt,
    updatedAt: MOCK_EMPTY_CART.updatedAt,
  };
}

function recalcTotal(items: CartItemView[]): number {
  return items.reduce((sum, item) => sum + item.lineTotal, 0);
}

function enrichItem(productId: string, quantity: number): CartItemView {
  const product = MOCK_PRODUCTS[productId];
  if (!product) {
    throw new Error(`[cart.mock] unknown productId: ${productId}`);
  }
  return {
    productId,
    quantity,
    name: product.name,
    slug: product.slug,
    coverUrl: product.coverUrl,
    price: product.price,
    lineTotal: product.price * quantity,
  };
}

function touchTimestamp(): void {
  _cart.updatedAt = new Date().toISOString();
}

/**
 * In-memory cart state for the mock provider. Lives at module
 * scope: the mock "remembers" between consecutive service calls,
 * which is what makes it a useful local-dev / demo-mode swap-in.
 *
 * Tests should call `_resetMockCart()` in `beforeEach` to start
 * from a clean state.
 */
let _cart: CartView = freshCart();

async function getCart(): Promise<CartView> {
  await delay(MOCK_DELAY_MS);
  return { ..._cart, items: [..._cart.items] };
}

async function addItem(input: AddItemInput): Promise<CartView> {
  await delay(MOCK_DELAY_MS);

  const product = MOCK_PRODUCTS[input.productId];
  if (!product) {
    throw new Error('product not found');
  }

  // Currency lock: first item sets the cart currency; later items
  // must match. Mirrors the real BE behavior.
  if (_cart.currency === '') {
    _cart.currency = product.currency;
  } else if (_cart.currency !== product.currency) {
    throw new Error(
      `currency mismatch: cart is ${_cart.currency}, item is ${product.currency}`,
    );
  }

  // Merge semantics: existing productId increments, new productId
  // becomes a new line.
  const existingIdx = _cart.items.findIndex(
    (i) => i.productId === input.productId,
  );

  if (existingIdx >= 0) {
    const existing = _cart.items[existingIdx]!;
    _cart.items[existingIdx] = enrichItem(
      input.productId,
      existing.quantity + input.quantity,
    );
  } else {
    _cart.items.push(enrichItem(input.productId, input.quantity));
  }

  _cart.itemsTotal = recalcTotal(_cart.items);
  touchTimestamp();
  return { ..._cart, items: [..._cart.items] };
}

async function updateItem(
  productId: string,
  input: UpdateItemInput,
): Promise<CartView> {
  await delay(MOCK_DELAY_MS);

  const idx = _cart.items.findIndex((i) => i.productId === productId);
  if (idx < 0) {
    throw new Error(`item ${productId} not in cart`);
  }

  _cart.items[idx] = enrichItem(productId, input.quantity);
  _cart.itemsTotal = recalcTotal(_cart.items);
  touchTimestamp();
  return { ..._cart, items: [..._cart.items] };
}

async function removeItem(productId: string): Promise<CartView> {
  await delay(MOCK_DELAY_MS);

  // Idempotent: removing a non-existent productId is a no-op
  // success, matching the BE behavior.
  _cart.items = _cart.items.filter((i) => i.productId !== productId);
  _cart.itemsTotal = recalcTotal(_cart.items);
  if (_cart.items.length === 0) {
    _cart.currency = '';
  }
  touchTimestamp();
  return { ..._cart, items: [..._cart.items] };
}

async function clearCart(): Promise<CartView> {
  await delay(MOCK_DELAY_MS);
  _cart = freshCart();
  _cart.updatedAt = new Date().toISOString();
  return { ..._cart, items: [..._cart.items] };
}

/**
 * Test helper that resets the in-memory cart to its initial empty
 * state. Tests call this in `beforeEach` so each case starts from
 * a known baseline.
 *
 * NOT part of the public `CartProvider` interface — tests import
 * it as a named export, while consumer code imports the default
 * `cartMockProvider`.
 */
export function _resetMockCart(): void {
  _cart = freshCart();
}

const cartMockProvider: CartProvider = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};

export default cartMockProvider;
