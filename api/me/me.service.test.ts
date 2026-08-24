import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ChangePasswordResult,
  CustomerProfile,
  StaffProfile,
} from './me.types';

const { SAMPLE_STAFF, SAMPLE_CUSTOMER, mockProvider } = vi.hoisted(() => {
  const SAMPLE_STAFF: StaffProfile = {
    id: 'u1',
    email: 'admin@checkout-kit.local',
    name: 'Admin',
    roles: ['admin'],
  };
  const SAMPLE_CUSTOMER: CustomerProfile = {
    id: 'c1',
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Buyer',
  };
  return {
    SAMPLE_STAFF,
    SAMPLE_CUSTOMER,
    mockProvider: {
      getStaffMe: vi.fn(),
      getCustomerMe: vi.fn(),
      updateCustomerMe: vi.fn(),
      changeCustomerPassword: vi.fn(),
    },
  };
});

vi.mock('./me.provider', () => ({
  meProvider: () => Promise.resolve(mockProvider),
}));

import {
  change_customer_password,
  get_customer_me,
  get_staff_me,
  update_customer_me,
} from './me.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('get_staff_me', () => {
  it('returns the staff profile on success', async () => {
    mockProvider.getStaffMe.mockResolvedValueOnce(SAMPLE_STAFF);
    const r = await get_staff_me();
    expect(r.data).toEqual(SAMPLE_STAFF);
  });
});

describe('get_customer_me', () => {
  it('routes to provider.getCustomerMe (not getStaffMe)', async () => {
    mockProvider.getCustomerMe.mockResolvedValueOnce(SAMPLE_CUSTOMER);
    await get_customer_me();
    expect(mockProvider.getCustomerMe).toHaveBeenCalledTimes(1);
    expect(mockProvider.getStaffMe).not.toHaveBeenCalled();
  });
});

describe('update_customer_me', () => {
  it('forwards the input to provider.updateCustomerMe', async () => {
    mockProvider.updateCustomerMe.mockResolvedValueOnce(SAMPLE_CUSTOMER);
    await update_customer_me({ firstName: 'Bob', lastName: 'B' });
    expect(mockProvider.updateCustomerMe).toHaveBeenCalledWith({
      firstName: 'Bob',
      lastName: 'B',
    });
  });

  it('returns the refreshed profile', async () => {
    mockProvider.updateCustomerMe.mockResolvedValueOnce(SAMPLE_CUSTOMER);
    const r = await update_customer_me({ firstName: 'Bob', lastName: 'B' });
    expect(r.data).toEqual(SAMPLE_CUSTOMER);
  });
});

describe('change_customer_password', () => {
  it('forwards the input verbatim', async () => {
    const ok: ChangePasswordResult = { ok: true };
    mockProvider.changeCustomerPassword.mockResolvedValueOnce(ok);
    await change_customer_password({
      currentPassword: 'old',
      newPassword: 'newpass-123',
      confirmNewPassword: 'newpass-123',
    });
    expect(mockProvider.changeCustomerPassword).toHaveBeenCalledWith({
      currentPassword: 'old',
      newPassword: 'newpass-123',
      confirmNewPassword: 'newpass-123',
    });
  });

  it('returns ApiError on VALIDATION_ERROR (wrong current pw)', async () => {
    const apiError = {
      code: 'VALIDATION_ERROR' as const,
      message: 'Current password is incorrect',
      status: 422,
      details: { currentPassword: 'Current password is incorrect' },
    };
    mockProvider.changeCustomerPassword.mockRejectedValueOnce(apiError);
    const r = await change_customer_password({
      currentPassword: 'wrong',
      newPassword: 'newpass-123',
      confirmNewPassword: 'newpass-123',
    });
    expect(r.error).toEqual(apiError);
  });
});
