import { proxy, useSnapshot } from 'valtio';
import { persistStore } from './persist';

/**
 * Snapshot of the currently logged-in subject.
 *
 * Carries the union of staff and customer fields. The `roles` array
 * is the discriminator the rest of the FE uses to gate routes and
 * features:
 *
 *   - `['admin']`    → back-office, full
 *   - `['sales']`    → back-office, restricted
 *   - `['customer']` → public storefront + own orders/cart
 *
 * The concrete shape is mirrored from the BE `/v1/me` (staff) and
 * `/v1/customer/me` (customer) responses. Both endpoints feed this
 * single store after login.
 */
export type UserSnapshot = {
  id: string;
  email: string;
  roles: string[];
  // Staff fields
  name?: string;
  // Customer fields
  firstName?: string;
  lastName?: string;
};

export const userStore = proxy<{
  user: UserSnapshot | null;
}>({
  user: null,
});

/**
 * React-side accessor. Reads the snapshot inside a component and
 * exposes a convenience `isAuthenticated` flag.
 *
 * Cast back to `typeof userStore` is the standard Valtio idiom to
 * avoid the readonly conversion of `useSnapshot`.
 */
export function useUser() {
  const snap = useSnapshot(userStore) as typeof userStore;
  return {
    user: snap.user,
    isAuthenticated: snap.user !== null,
  };
}

/**
 * Clears the user. Called by `logout()` in auth.store so that token
 * and user clear together — there should never be an "user but no
 * token" state.
 */
export function resetUserStore() {
  userStore.user = null;
}

persistStore(userStore, 'user', ['user'] as const);
