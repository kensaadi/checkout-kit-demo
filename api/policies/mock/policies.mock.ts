import type { PoliciesProvider } from '../policies.provider';
import type { RbacPolicy } from '../policies.types';
import { MOCK_DELAY_MS, MOCK_POLICY } from './policies.mock.data';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getPolicies(): Promise<RbacPolicy> {
  await delay(MOCK_DELAY_MS);
  // Return a defensive copy so consumers cannot mutate the seed.
  return JSON.parse(JSON.stringify(MOCK_POLICY)) as RbacPolicy;
}

const policiesMockProvider: PoliciesProvider = { getPolicies };
export default policiesMockProvider;
