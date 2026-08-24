import { describe, expect, it } from 'vitest';
import { RbacPolicySchema } from '../policies.types';
import policiesMockProvider from './policies.mock';
import { MOCK_POLICY } from './policies.mock.data';

describe('policiesMockProvider.getPolicies', () => {
  it('returns a policy matching the schema', async () => {
    const policy = await policiesMockProvider.getPolicies();
    const result = RbacPolicySchema.safeParse(policy);
    expect(result.success).toBe(true);
  });

  it('returns a defensive copy (mutating the result does not affect the seed)', async () => {
    const a = await policiesMockProvider.getPolicies();
    a.roles[0]!.name = 'tampered';
    const b = await policiesMockProvider.getPolicies();
    expect(b.roles[0]?.name).not.toBe('tampered');
  });

  it('returns the same kit policy as the seed', async () => {
    const policy = await policiesMockProvider.getPolicies();
    expect(policy).toEqual(MOCK_POLICY);
  });

  it('includes the three kit-defined roles', async () => {
    const policy = await policiesMockProvider.getPolicies();
    const roleNames = policy.roles.map((r) => r.name).sort();
    expect(roleNames).toEqual(['admin', 'customer', 'sales']);
  });
});
