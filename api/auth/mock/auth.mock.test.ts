import { describe, expect, it } from 'vitest';
import { decodeJwtPayload } from '../jwt';
import authMockProvider from './auth.mock';

describe('authMockProvider.loginStaff', () => {
  it('returns a token for valid admin credentials', async () => {
    const r = await authMockProvider.loginStaff({
      email: 'admin@checkout-kit.local',
      password: 'AdminPass!2026',
    });
    expect(r.token).toMatch(/\..+\..+/);
  });

  it('returns a token whose JWT claims carry the admin role', async () => {
    const r = await authMockProvider.loginStaff({
      email: 'admin@checkout-kit.local',
      password: 'AdminPass!2026',
    });
    const claims = decodeJwtPayload(r.token);
    expect(claims?.roles).toEqual(['admin']);
  });

  it('returns a token for valid sales credentials', async () => {
    const r = await authMockProvider.loginStaff({
      email: 'sales@checkout-kit.local',
      password: 'SalesPass!2026',
    });
    const claims = decodeJwtPayload(r.token);
    expect(claims?.roles).toEqual(['sales']);
  });

  it('throws UNAUTHORIZED on wrong password', async () => {
    await expect(
      authMockProvider.loginStaff({
        email: 'admin@checkout-kit.local',
        password: 'wrong-pass',
      }),
    ).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      status: 401,
    });
  });

  it('throws UNAUTHORIZED on unknown email', async () => {
    await expect(
      authMockProvider.loginStaff({
        email: 'nobody@example.com',
        password: 'anypassword',
      }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('does not let a customer log in via the staff endpoint', async () => {
    await expect(
      authMockProvider.loginStaff({
        email: 'bob.buyer@example.com',
        password: 'BuyerPass!2026',
      }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });
});

describe('authMockProvider.loginCustomer', () => {
  it('returns a token for valid customer credentials', async () => {
    const r = await authMockProvider.loginCustomer({
      email: 'bob.buyer@example.com',
      password: 'BuyerPass!2026',
    });
    const claims = decodeJwtPayload(r.token);
    expect(claims?.roles).toEqual(['customer']);
  });

  it('throws UNAUTHORIZED on wrong password', async () => {
    await expect(
      authMockProvider.loginCustomer({
        email: 'bob.buyer@example.com',
        password: 'wrong-pass',
      }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('does not let a staff user log in via the customer endpoint', async () => {
    await expect(
      authMockProvider.loginCustomer({
        email: 'admin@checkout-kit.local',
        password: 'AdminPass!2026',
      }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });
});
