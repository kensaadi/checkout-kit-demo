import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { authStore } from '@shared/store/auth.store';
import { encodeMockJwt } from '../../auth/jwt';
import meMockProvider from './me.mock';

const ADMIN_TOKEN = encodeMockJwt({
  sub: 'mock-admin-001',
  roles: ['admin'],
});
const SALES_TOKEN = encodeMockJwt({
  sub: 'mock-sales-001',
  roles: ['sales'],
});
const CUSTOMER_TOKEN = encodeMockJwt({
  sub: 'mock-customer-001',
  roles: ['customer'],
});

beforeEach(() => {
  authStore.token = null;
});

afterEach(() => {
  authStore.token = null;
});

describe('meMockProvider.getStaffMe', () => {
  it('returns the admin profile when admin JWT is in authStore', async () => {
    authStore.token = ADMIN_TOKEN;
    const profile = await meMockProvider.getStaffMe();
    expect(profile.email).toBe('admin@checkout-kit.local');
    expect(profile.roles).toEqual(['admin']);
  });

  it('returns the sales profile when sales JWT is in authStore', async () => {
    authStore.token = SALES_TOKEN;
    const profile = await meMockProvider.getStaffMe();
    expect(profile.email).toBe('sales@checkout-kit.local');
  });

  it('throws UNAUTHORIZED when no token is present', async () => {
    await expect(meMockProvider.getStaffMe()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  it('throws FORBIDDEN when the token belongs to a customer', async () => {
    authStore.token = CUSTOMER_TOKEN;
    await expect(meMockProvider.getStaffMe()).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});

describe('meMockProvider.getCustomerMe', () => {
  it('returns the customer profile when customer JWT is in authStore', async () => {
    authStore.token = CUSTOMER_TOKEN;
    const profile = await meMockProvider.getCustomerMe();
    expect(profile.email).toBe('bob.buyer@example.com');
    expect(profile.firstName).toBe('Bob');
  });

  it('throws FORBIDDEN when the token belongs to staff', async () => {
    authStore.token = ADMIN_TOKEN;
    await expect(meMockProvider.getCustomerMe()).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});

describe('meMockProvider.updateCustomerMe', () => {
  it('persists the new values for subsequent reads', async () => {
    authStore.token = CUSTOMER_TOKEN;
    await meMockProvider.updateCustomerMe({
      firstName: 'Robert',
      lastName: 'Buyer',
    });
    const after = await meMockProvider.getCustomerMe();
    expect(after.firstName).toBe('Robert');
  });

  it('updates updatedAt timestamp', async () => {
    authStore.token = CUSTOMER_TOKEN;
    const before = await meMockProvider.getCustomerMe();
    // Wait a millisecond so the timestamp actually changes
    await new Promise((r) => setTimeout(r, 5));
    const updated = await meMockProvider.updateCustomerMe({
      firstName: before.firstName,
      lastName: before.lastName,
    });
    expect(updated.updatedAt).not.toBe(before.updatedAt);
  });
});

describe('meMockProvider.changeCustomerPassword', () => {
  it('succeeds when current password is correct', async () => {
    authStore.token = CUSTOMER_TOKEN;
    const r = await meMockProvider.changeCustomerPassword({
      currentPassword: 'BuyerPass!2026',
      newPassword: 'newpass-456',
      confirmNewPassword: 'newpass-456',
    });
    expect(r.ok).toBe(true);

    // Restore for subsequent tests in this file
    await meMockProvider.changeCustomerPassword({
      currentPassword: 'newpass-456',
      newPassword: 'BuyerPass!2026',
      confirmNewPassword: 'BuyerPass!2026',
    });
  });

  it('throws VALIDATION_ERROR with field details when current is wrong', async () => {
    authStore.token = CUSTOMER_TOKEN;
    await expect(
      meMockProvider.changeCustomerPassword({
        currentPassword: 'wrong',
        newPassword: 'newpass-789',
        confirmNewPassword: 'newpass-789',
      }),
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      details: { currentPassword: expect.any(String) },
    });
  });

  it('throws UNAUTHORIZED when no token is in authStore', async () => {
    await expect(
      meMockProvider.changeCustomerPassword({
        currentPassword: 'old',
        newPassword: 'newpass-999',
        confirmNewPassword: 'newpass-999',
      }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });
});
