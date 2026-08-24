import { subscribe } from 'valtio';

/**
 * Persists a subset of a Valtio proxy store to localStorage,
 * granularly per-key.
 *
 *   - On mount: reads `storageKey` from localStorage, hydrates the
 *     listed `keys` into the store (broken JSON is ignored silently).
 *   - On every change: writes back ONLY the listed keys.
 *
 * Keep the key list minimal. Anything ephemeral (loading flags,
 * computed cache, runtime status) should NOT be persisted — only
 * facts that must survive a page reload (auth token, user profile,
 * UI preferences).
 *
 *   persistStore(authStore, 'auth', ['token'] as const);
 *   persistStore(userStore, 'user', ['user'] as const);
 *
 * The `as const` on the keys array narrows the literal types so
 * the persisted payload is fully type-safe.
 */
export function persistStore<
  T extends Record<string, unknown>,
  K extends readonly (keyof T)[],
>(store: T, storageKey: string, keys: K) {
  // --- Restore on boot ---
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    try {
      const parsed: Partial<Pick<T, K[number]>> = JSON.parse(raw);
      for (const k of keys) {
        if (k in parsed && parsed[k] !== undefined) {
          store[k] = parsed[k] as T[typeof k];
        }
      }
    } catch {
      // Broken storage — ignore and let the store start fresh.
    }
  }

  // --- Persist on every change ---
  subscribe(store, () => {
    const snapshot: Pick<T, K[number]> = {} as Pick<T, K[number]>;
    for (const k of keys) {
      snapshot[k] = store[k];
    }
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
  });
}
