import { proxy, useSnapshot } from 'valtio';
import { persistStore } from './persist';
import { resetUserStore } from './user.store';

/**
 * Holds the JWT bearer token for the current session.
 *
 * Read directly (no React) by the axios request interceptor, which
 * cannot be a hook. React components use `useAuth()` instead.
 *
 * Persisted to localStorage under the 'auth' key so a page reload
 * keeps the session.
 */
export const authStore = proxy<{
  token: string | null;
}>({
  token: null,
});

/**
 * React-side accessor. Returns a stable snapshot plus a derived
 * `hasToken` flag.
 */
export function useAuth() {
  const snap = useSnapshot(authStore) as typeof authStore;
  return {
    token: snap.token,
    hasToken: snap.token !== null,
  };
}

/**
 * Single-call session reset. Clears the token AND the user store so
 * the app can never be in a "token but no user" or "user but no
 * token" state.
 *
 * Called from:
 *   - the axios 401 interceptor (cross-cutting auto-logout)
 *   - the topbar / avatar menu "Sign out" action
 *   - login screens after a successful login of a different account
 */
export function logout() {
  authStore.token = null;
  resetUserStore();
}

persistStore(authStore, 'auth', ['token'] as const);
