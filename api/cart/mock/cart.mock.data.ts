import type { CartView } from '../cart.types';
import { MOCK_PRODUCTS as PRODUCTS_CATALOG } from '../../products/mock/products.mock.data';

export const MOCK_DELAY_MS = 200;

/**
 * Empty cart shape used as the initial state of the mock provider.
 * `currency` is empty until the first item sets the lock.
 */
export const MOCK_EMPTY_CART: CartView = {
  id: 'mock-cart-001',
  customerId: 'mock-customer-001',
  currency: '',
  items: [],
  itemsTotal: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

/**
 * Subset of product fields the cart mock needs to enrich items.
 * Sourced from `products/mock/products.mock.data.ts` so the two
 * domains can NEVER drift — one canonical catalog.
 *
 * The cart-specific tests still expect an EUR product for the
 * currency-lock check; we add it here without polluting the
 * products catalog (no draft EUR product needed in the
 * storefront).
 */
export const MOCK_PRODUCTS: Record<
  string,
  {
    name: string;
    slug: string;
    coverUrl: string | null;
    price: number;
    currency: string;
  }
> = {
  ...Object.fromEntries(
    Array.from(PRODUCTS_CATALOG.values()).map((p) => [
      p.id,
      {
        name: p.name,
        slug: p.slug,
        coverUrl: p.coverUrl ?? null,
        price: p.price,
        currency: p.currency,
      },
    ]),
  ),
  // Extra EUR product used by the cart's currency-lock test —
  // intentionally not in the products catalog (no use-case for
  // it in the storefront demo).
  'prod-eur-platinum': {
    name: 'Platinum Plan (EUR)',
    slug: 'platinum-plan-eur',
    coverUrl: null,
    price: 9900,
    currency: 'eur',
  },
};
