import { proxy, useSnapshot } from 'valtio';
import { get_cart } from '@api/cart/cart.service';
import type { CartView } from '@api/cart/cart.types';
import type { Result } from '@api/_shared/result.types';

/**
 * Cached cart view. The server is the source of truth — this store
 * mirrors what `GET /v1/cart` returned last. After every mutation
 * (add_item, update_item, remove_item, clear_cart) the consumer
 * calls `refreshCart()` to bring the store back in sync.
 *
 * NOT persisted: at boot the cart is re-fetched from the server.
 * The brief render before fetch completes shows `cart: null` /
 * `loaded: false`, which the layout treats as "loading".
 */
export const cartStore = proxy<{
  cart: CartView | null;
  loaded: boolean;
}>({
  cart: null,
  loaded: false,
});

/**
 * React-side accessor with a derived `count`. The topbar Cart
 * button renders the count badge from this hook so it stays in
 * sync with every cart mutation across the app.
 */
export function useCart() {
  const snap = useSnapshot(cartStore) as typeof cartStore;
  const count = snap.cart
    ? snap.cart.items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;
  return {
    cart: snap.cart,
    loaded: snap.loaded,
    count,
  };
}

/**
 * Re-fetches the cart from the BE and updates the store.
 *
 * On error the store is intentionally NOT cleared — a network blip
 * shouldn't make the cart appear empty in the topbar. The caller
 * decides what to do with the ApiError (toast, retry, ignore).
 *
 * Returns the underlying `Result<CartView>` so a caller that mounts
 * the cart UI (e.g. CartPage) can surface fetch failures instead of
 * spinning a skeleton forever. Fire-and-forget callers (post-login
 * pre-warm) can keep ignoring the return value.
 */
export async function refreshCart(): Promise<Result<CartView>> {
  const r = await get_cart();
  if (!r.error) {
    cartStore.cart = r.data;
    cartStore.loaded = true;
  }
  return r;
}

/**
 * Clears the cart store. Called as part of a session reset; never
 * call directly from a component — go through `logout()` in
 * auth.store so all session state clears together.
 */
export function resetCartStore(): void {
  cartStore.cart = null;
  cartStore.loaded = false;
}
