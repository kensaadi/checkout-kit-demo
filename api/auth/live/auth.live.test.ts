import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import axiosClient from '@api/_shared/axios.client';
import authLiveProvider from './auth.live';

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(axiosClient);
});

afterEach(() => {
  mock.restore();
});

describe('authLiveProvider.loginStaff', () => {
  it('POSTs /v1/auth/login with the input and returns the token', async () => {
    mock.onPost('/v1/auth/login').reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({
        email: 'admin@checkout-kit.local',
        password: 'AdminPass!2026',
      });
      return [200, { token: 'jwt-staff' }];
    });
    const result = await authLiveProvider.loginStaff({
      email: 'admin@checkout-kit.local',
      password: 'AdminPass!2026',
    });
    expect(result.token).toBe('jwt-staff');
  });

  it('throws UNAUTHORIZED on a 401, without triggering the auto-logout redirect', async () => {
    mock.onPost('/v1/auth/login').reply(401, { error: 'invalid credentials' });
    await expect(
      authLiveProvider.loginStaff({
        email: 'wrong@example.com',
        password: 'wrongpass',
      }),
    ).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      message: 'invalid credentials',
    });
  });

  it('throws CONTRACT_MISMATCH when the response body lacks the token', async () => {
    mock.onPost('/v1/auth/login').reply(200, { not_token: 'oops' });
    await expect(
      authLiveProvider.loginStaff({
        email: 'admin@checkout-kit.local',
        password: 'AdminPass!2026',
      }),
    ).rejects.toMatchObject({ code: 'CONTRACT_MISMATCH' });
  });
});

describe('authLiveProvider.loginCustomer', () => {
  it('POSTs /v1/auth/customer-login (not /v1/auth/login)', async () => {
    let staffHit = false;
    mock.onPost('/v1/auth/login').reply(() => {
      staffHit = true;
      return [200, { token: 'jwt-x' }];
    });
    mock.onPost('/v1/auth/customer-login').reply(200, { token: 'jwt-cust' });

    const result = await authLiveProvider.loginCustomer({
      email: 'bob.buyer@example.com',
      password: 'BuyerPass!2026',
    });
    expect(staffHit).toBe(false);
    expect(result.token).toBe('jwt-cust');
  });
});
