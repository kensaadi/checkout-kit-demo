import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import axiosClient from '@api/_shared/axios.client';
import meLiveProvider from './me.live';

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(axiosClient);
});

afterEach(() => {
  mock.restore();
});

// Helper: a minimal BE-shaped staff record. Mirrors the JSON the Go
// server actually emits (model.User) — nested profile, single role,
// status, lastLoginAt.
function backendStaff(overrides: Record<string, unknown> = {}) {
  return {
    id: 'u1',
    email: 'admin@checkout-kit.local',
    role: 'admin',
    status: 'active',
    profile: { firstName: 'Ada', lastName: 'Lovelace' },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

// Helper: a minimal BE-shaped customer record. Mirrors model.Customer
// — nested profile, status, optional stripeCustomerId.
function backendCustomer(overrides: Record<string, unknown> = {}) {
  return {
    id: 'c1',
    email: 'bob@example.com',
    status: 'active',
    profile: { firstName: 'Bob', lastName: 'Buyer' },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('meLiveProvider.getStaffMe', () => {
  it('GETs /v1/me and flattens profile + collapses role → roles[]', async () => {
    mock.onGet('/v1/me').reply(200, backendStaff());
    const result = await meLiveProvider.getStaffMe();
    expect(result.email).toBe('admin@checkout-kit.local');
    expect(result.name).toBe('Ada Lovelace');
    expect(result.roles).toEqual(['admin']);
  });

  it('falls back to email-local-part when profile name is empty', async () => {
    mock
      .onGet('/v1/me')
      .reply(200, backendStaff({ profile: {} }));
    const result = await meLiveProvider.getStaffMe();
    expect(result.name).toBe('admin');
  });

  it('throws CONTRACT_MISMATCH on unexpected BE shape', async () => {
    mock.onGet('/v1/me').reply(200, { unexpected: 'shape' });
    await expect(meLiveProvider.getStaffMe()).rejects.toMatchObject({
      code: 'CONTRACT_MISMATCH',
    });
  });
});

describe('meLiveProvider.getCustomerMe', () => {
  it('GETs /v1/customer/me (not /v1/me) and flattens profile', async () => {
    let staffHit = false;
    mock.onGet('/v1/me').reply(() => {
      staffHit = true;
      return [200, backendStaff()];
    });
    mock.onGet('/v1/customer/me').reply(200, backendCustomer());
    const result = await meLiveProvider.getCustomerMe();
    expect(staffHit).toBe(false);
    expect(result.firstName).toBe('Bob');
    expect(result.lastName).toBe('Buyer');
  });

  it('treats missing profile fields as empty strings', async () => {
    mock
      .onGet('/v1/customer/me')
      .reply(200, backendCustomer({ profile: {} }));
    const result = await meLiveProvider.getCustomerMe();
    expect(result.firstName).toBe('');
    expect(result.lastName).toBe('');
  });
});

describe('meLiveProvider.updateCustomerMe', () => {
  it('PATCHes /v1/customer/me and flattens the BE response', async () => {
    mock.onPatch('/v1/customer/me').reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({
        firstName: 'Bob',
        lastName: 'Buyer',
      });
      return [200, backendCustomer()];
    });
    const result = await meLiveProvider.updateCustomerMe({
      firstName: 'Bob',
      lastName: 'Buyer',
    });
    expect(result.firstName).toBe('Bob');
  });
});

describe('meLiveProvider.changeCustomerPassword', () => {
  it('POSTs with confirmNewPassword renamed to confirmPassword and returns ok on 204', async () => {
    mock.onPost('/v1/customer/change-password').reply((config) => {
      expect(JSON.parse(config.data as string)).toEqual({
        currentPassword: 'old',
        newPassword: 'newpass-123',
        confirmPassword: 'newpass-123',
      });
      // BE sends 204 No Content — no body.
      return [204];
    });
    const result = await meLiveProvider.changeCustomerPassword({
      currentPassword: 'old',
      newPassword: 'newpass-123',
      confirmNewPassword: 'newpass-123',
    });
    expect(result.ok).toBe(true);
  });

  it('surfaces VALIDATION_ERROR with field details on 422', async () => {
    mock.onPost('/v1/customer/change-password').reply(422, {
      error: 'validation failed',
      details: { currentPassword: 'incorrect' },
    });
    await expect(
      meLiveProvider.changeCustomerPassword({
        currentPassword: 'wrong',
        newPassword: 'newpass-123',
        confirmNewPassword: 'newpass-123',
      }),
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      details: { currentPassword: 'incorrect' },
    });
  });
});
