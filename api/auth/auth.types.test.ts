import { describe, expect, it } from 'vitest';
import { LoginInputSchema, LoginResultSchema } from './auth.types';

describe('LoginInputSchema', () => {
  it('accepts valid email + password', () => {
    expect(
      LoginInputSchema.safeParse({
        email: 'user@example.com',
        password: 'abcdefgh',
      }).success,
    ).toBe(true);
  });

  it('rejects malformed email', () => {
    const r = LoginInputSchema.safeParse({
      email: 'not-an-email',
      password: 'abcdefgh',
    });
    expect(r.success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    expect(
      LoginInputSchema.safeParse({
        email: 'user@example.com',
        password: 'short',
      }).success,
    ).toBe(false);
  });

  it('rejects missing email', () => {
    expect(LoginInputSchema.safeParse({ password: 'abcdefgh' }).success).toBe(
      false,
    );
  });

  it('rejects missing password', () => {
    expect(
      LoginInputSchema.safeParse({ email: 'user@example.com' }).success,
    ).toBe(false);
  });
});

describe('LoginResultSchema', () => {
  it('accepts a non-empty token', () => {
    expect(LoginResultSchema.safeParse({ token: 'jwt-x' }).success).toBe(true);
  });

  it('rejects an empty token', () => {
    expect(LoginResultSchema.safeParse({ token: '' }).success).toBe(false);
  });

  it('rejects missing token', () => {
    expect(LoginResultSchema.safeParse({}).success).toBe(false);
  });
});
