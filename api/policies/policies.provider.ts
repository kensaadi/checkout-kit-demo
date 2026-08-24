import { PROVIDER } from '@api/_shared/config';
import type { RbacPolicy } from './policies.types';

export interface PoliciesProvider {
  getPolicies(): Promise<RbacPolicy>;
}

const policiesProviderMapping: Record<string, () => Promise<PoliciesProvider>> =
  {
    live: () =>
      import('./live/policies.live').then(
        (m) => m.default as PoliciesProvider,
      ),
    mock: () =>
      import('./mock/policies.mock').then(
        (m) => m.default as PoliciesProvider,
      ),
  };

export async function policiesProvider(): Promise<PoliciesProvider> {
  const loader = policiesProviderMapping[PROVIDER];
  if (!loader) {
    throw new Error(`[policies] provider "${PROVIDER}" not supported`);
  }
  return loader();
}
