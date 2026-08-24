import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LoginResult } from './auth.types';

const { SAMPLE_RESULT, mockProvider } = vi.hoisted(() => {
  const SAMPLE_RESULT: LoginResult = { token: 'jwt-sample' };
  return {
    SAMPLE_RESULT,
    mockProvider: {
      loginStaff: vi.fn(),
      loginCustomer: vi.fn(),
    },
  };
});

vi.mock('./auth.provider', () => ({
  authProvider: () => Promise.resolve(mockProvider),
}));

import { login_customer, login_staff } from './auth.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('login_staff', () => {
  it('returns Result.data on success', async () => {
    mockProvider.loginStaff.mockResolvedValueOnce(SAMPLE_RESULT);
    const r = await login_staff({
      email: 'admin@checkout-kit.local',
      password: 'AdminPass!2026',
    });
    expect(r.error).toBeNull();
    expect(r.data).toEqual(SAMPLE_RESULT);
  });

  it('forwards the input to provider.loginStaff', async () => {
    mockProvider.loginStaff.mockResolvedValueOnce(SAMPLE_RESULT);
    const input = {
      email: 'admin@checkout-kit.local',
      password: 'AdminPass!2026',
    };
    await login_staff(input);
    expect(mockProvider.loginStaff).toHaveBeenCalledWith(input);
  });

  it('returns ApiError unchanged when provider rejects with one', async () => {
    const apiError = {
      code: 'UNAUTHORIZED' as const,
      message: 'invalid credentials',
      status: 401,
    };
    mockProvider.loginStaff.mockRejectedValueOnce(apiError);
    const r = await login_staff({
      email: 'x@example.com',
      password: 'abcdefgh',
    });
    expect(r.data).toBeNull();
    expect(r.error).toEqual(apiError);
  });
});

describe('login_customer', () => {
  it('routes to provider.loginCustomer (not loginStaff)', async () => {
    mockProvider.loginCustomer.mockResolvedValueOnce(SAMPLE_RESULT);
    await login_customer({
      email: 'bob.buyer@example.com',
      password: 'BuyerPass!2026',
    });
    expect(mockProvider.loginCustomer).toHaveBeenCalledTimes(1);
    expect(mockProvider.loginStaff).not.toHaveBeenCalled();
  });
});
