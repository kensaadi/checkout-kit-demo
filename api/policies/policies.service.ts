import { attempt } from '@api/_shared/attempt';
import type { Result } from '@api/_shared/result.types';
import { policiesProvider } from './policies.provider';
import type { RbacPolicy } from './policies.types';

/**
 * Fetches the RBAC policy from the BE. Called ONCE at app boot
 * (in `PolicyBootstrap`) and the result is cached in
 * `policies.store`. UI components do not call this directly —
 * they read the policy from the store via `useSnapshot`.
 */
export async function get_policies(): Promise<Result<RbacPolicy>> {
  const provider = await policiesProvider();
  return attempt(provider.getPolicies());
}
