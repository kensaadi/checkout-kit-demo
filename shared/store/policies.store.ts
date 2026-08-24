import { proxy, useSnapshot } from 'valtio';
import { get_policies } from '@api/policies/policies.service';
import type { RbacPolicy } from '@api/policies/policies.types';

/**
 * The RBAC policy fetched at app boot from `GET /v1/policies`.
 *
 * `<RbacProvider>` reads `policy` from here. Every `<Can>`,
 * `useCan()` call, route guard, and field `access` prop in the
 * kit ultimately ends up consulting this object.
 *
 * Lifecycle:
 *   - `status` starts at `'loading'`
 *   - `loadPolicy()` is called once by `PolicyBootstrap` at mount
 *   - On success → `{ status: 'ready', policy }`
 *   - On failure → `{ status: 'error', error }`
 *
 * Not persisted: a stale policy in localStorage could grant
 * permissions the BE has since revoked. Better to pay one
 * round-trip per session than risk that drift.
 */
export type PoliciesStoreState =
  | { status: 'loading'; policy: null; error: null }
  | { status: 'ready'; policy: RbacPolicy; error: null }
  | { status: 'error'; policy: null; error: string };

export const policiesStore = proxy<PoliciesStoreState>({
  status: 'loading',
  policy: null,
  error: null,
});

/**
 * Fetches the policy and updates the store. Safe to call once
 * (typical) or to retry on failure. Idempotent on already-ready
 * state — re-fetches and re-publishes.
 */
export async function loadPolicy(): Promise<void> {
  // Reset to loading before re-fetch so the UI can show its
  // splash again if this was a retry.
  policiesStore.status = 'loading';
  policiesStore.policy = null;
  policiesStore.error = null;

  const r = await get_policies();
  if (r.error) {
    policiesStore.status = 'error';
    policiesStore.policy = null;
    policiesStore.error = r.error.message;
    return;
  }

  policiesStore.status = 'ready';
  policiesStore.policy = r.data;
  policiesStore.error = null;
}

/**
 * React accessor with derived helpers. Components branch on
 * `status` to render splash / app / error.
 */
export function usePolicies() {
  const snap = useSnapshot(policiesStore) as typeof policiesStore;
  return {
    status: snap.status,
    policy: snap.policy,
    error: snap.error,
    isLoading: snap.status === 'loading',
    isReady: snap.status === 'ready',
    isError: snap.status === 'error',
  };
}

/**
 * Test / session-reset helper. Returns the store to its initial
 * loading state.
 */
export function resetPoliciesStore(): void {
  policiesStore.status = 'loading';
  policiesStore.policy = null;
  policiesStore.error = null;
}
