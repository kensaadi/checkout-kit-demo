import { describe, expect, it } from 'vitest';
import {
  ChangePasswordInputSchema,
  CustomerProfileSchema,
  StaffProfileSchema,
  UpdateCustomerInputSchema,
} from './me.types';

describe('StaffProfileSchema', () => {
  it('accepts a well-formed profile', () => {
    const r = StaffProfileSchema.safeParse({
      id: 'u1',
      email: 'admin@checkout-kit.local',
      name: 'Admin',
      roles: ['admin'],
    });
    expect(r.success).toBe(true);
  });

  it('accepts optional createdAt / updatedAt', () => {
    expect(
      StaffProfileSchema.safeParse({
        id: 'u1',
        email: 'admin@checkout-kit.local',
        name: 'Admin',
        roles: ['admin'],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }).success,
    ).toBe(true);
  });

  it('rejects an invalid email', () => {
    expect(
      StaffProfileSchema.safeParse({
        id: 'u1',
        email: 'not-an-email',
        name: 'Admin',
        roles: ['admin'],
      }).success,
    ).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(StaffProfileSchema.safeParse({}).success).toBe(false);
  });
});

describe('CustomerProfileSchema', () => {
  it('accepts a well-formed customer', () => {
    expect(
      CustomerProfileSchema.safeParse({
        id: 'c1',
        email: 'bob@example.com',
        firstName: 'Bob',
        lastName: 'Buyer',
      }).success,
    ).toBe(true);
  });

  it('accepts optional stripeCustomerId', () => {
    expect(
      CustomerProfileSchema.safeParse({
        id: 'c1',
        email: 'bob@example.com',
        firstName: 'Bob',
        lastName: 'Buyer',
        stripeCustomerId: 'cus_test_x',
      }).success,
    ).toBe(true);
  });
});

describe('UpdateCustomerInputSchema', () => {
  it('accepts valid first + last name', () => {
    expect(
      UpdateCustomerInputSchema.safeParse({
        firstName: 'Bob',
        lastName: 'Buyer',
      }).success,
    ).toBe(true);
  });

  it('rejects empty firstName', () => {
    expect(
      UpdateCustomerInputSchema.safeParse({
        firstName: '',
        lastName: 'Buyer',
      }).success,
    ).toBe(false);
  });

  it('rejects empty lastName', () => {
    expect(
      UpdateCustomerInputSchema.safeParse({
        firstName: 'Bob',
        lastName: '',
      }).success,
    ).toBe(false);
  });
});

describe('ChangePasswordInputSchema', () => {
  it('accepts valid input with matching passwords', () => {
    expect(
      ChangePasswordInputSchema.safeParse({
        currentPassword: 'oldpass-123',
        newPassword: 'newpass-456',
        confirmNewPassword: 'newpass-456',
      }).success,
    ).toBe(true);
  });

  it('rejects mismatched new + confirm passwords', () => {
    const r = ChangePasswordInputSchema.safeParse({
      currentPassword: 'oldpass-123',
      newPassword: 'newpass-456',
      confirmNewPassword: 'something-else',
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      // The error must be attached to confirmNewPassword so the form
      // pins it under the right field.
      expect(
        r.error.issues.some((i) => i.path.includes('confirmNewPassword')),
      ).toBe(true);
    }
  });

  it('rejects new password shorter than 8 chars', () => {
    expect(
      ChangePasswordInputSchema.safeParse({
        currentPassword: 'oldpass-123',
        newPassword: 'short',
        confirmNewPassword: 'short',
      }).success,
    ).toBe(false);
  });
});
