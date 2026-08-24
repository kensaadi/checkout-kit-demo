import { PROVIDER } from '@api/_shared/config';
import type {
  AddItemInput,
  CartView,
  UpdateItemInput,
} from './cart.types';

/**
 * Contract every cart provider must implement.
 *
 * Two implementations exist:
 *   - `live`  — backed by axios + the BE (api/cart/live/cart.live.ts)
 *   - `mock`  — in-memory stateful (api/cart/mock/cart.mock.ts)
 *
 * The service layer talks to a `CartProvider` instance, never
 * directly to axios or to the mock. This lets the kit run against
 * a fake BE in demo mode without touching the components.
 */
export interface CartProvider {
  getCart(): Promise<CartView>;
  addItem(input: AddItemInput): Promise<CartView>;
  updateItem(productId: string, input: UpdateItemInput): Promise<CartView>;
  removeItem(productId: string): Promise<CartView>;
  clearCart(): Promise<CartView>;
}

/**
 * Lazy resolver. The `live` and `mock` modules are loaded via
 * dynamic import so a production build with PROVIDER=live does
 * NOT include the mock implementation in its bundle (and vice
 * versa). Tree-shaking confirmed by Vite's chunk splitting.
 */
const cartProviderMapping: Record<string, () => Promise<CartProvider>> = {
  live: () =>
    import('./live/cart.live').then((m) => m.default as CartProvider),
  mock: () =>
    import('./mock/cart.mock').then((m) => m.default as CartProvider),
};

export async function cartProvider(): Promise<CartProvider> {
  const loader = cartProviderMapping[PROVIDER];
  if (!loader) {
    throw new Error(`[cart] provider "${PROVIDER}" not supported`);
  }
  return loader();
}
