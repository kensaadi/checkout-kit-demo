import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RbacPolicy } from './policies.types';

const { SAMPLE_POLICY, mockProvider } = vi.hoisted(() => {
  const SAMPLE_POLICY: RbacPolicy = {
    roles: [
      {
        name: 'admin',
        permissions: [{ action: '*', resource: '*', effect: 'allow' }],
      },
    ],
  };
  return {
    SAMPLE_POLICY,
    mockProvider: { getPolicies: vi.fn() },
  };
});

vi.mock('./policies.provider', () => ({
  policiesProvider: () => Promise.resolve(mockProvider),
}));

import { get_policies } from './policies.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('get_policies', () => {
  it('returns Result.data on success', async () => {
    mockProvider.getPolicies.mockResolvedValueOnce(SAMPLE_POLICY);
    const r = await get_policies();
    expect(r.error).toBeNull();
    expect(r.data).toEqual(SAMPLE_POLICY);
  });

  it('returns Result.error on rejection', async () => {
    const apiError = {
      code: 'SERVER_ERROR' as const,
      message: 'BE down',
      status: 503,
    };
    mockProvider.getPolicies.mockRejectedValueOnce(apiError);
    const r = await get_policies();
    expect(r.data).toBeNull();
    expect(r.error).toEqual(apiError);
  });
});
