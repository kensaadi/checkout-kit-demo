import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { isApiError } from './error.types';

describe('isApiError', () => {
  it('returns true for a well-formed ApiError', () => {
    expect(isApiError({ code: 'UNKNOWN', message: 'oops' })).toBe(true);
  });

  it('returns true for a well-formed ApiError with optional fields', () => {
    expect(
      isApiError({
        code: 'VALIDATION_ERROR',
        message: 'check fields',
        status: 422,
        details: { email: 'invalid' },
      }),
    ).toBe(true);
  });

  it('returns false for null', () => {
    expect(isApiError(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isApiError(undefined)).toBe(false);
  });

  it('returns false for a plain string', () => {
    expect(isApiError('boom')).toBe(false);
  });

  it('returns false for a plain object missing code', () => {
    expect(isApiError({ message: 'oops' })).toBe(false);
  });

  it('returns false for a plain object missing message', () => {
    expect(isApiError({ code: 'UNKNOWN' })).toBe(false);
  });

  it('returns false when code is not a string', () => {
    expect(isApiError({ code: 42, message: 'oops' })).toBe(false);
  });

  it('returns false when message is not a string', () => {
    expect(isApiError({ code: 'UNKNOWN', message: 123 })).toBe(false);
  });

  it('returns false for a plain Error instance (no code prop)', () => {
    expect(isApiError(new Error('boom'))).toBe(false);
  });

  it('returns false for an AxiosError (has code/message but code is not an ApiErrorCode)', () => {
    const ax = new AxiosError('timeout');
    ax.code = 'ECONNABORTED';
    expect(isApiError(ax)).toBe(false);
  });

  it('returns false for an object with code outside the known set', () => {
    expect(isApiError({ code: 'CUSTOM_CODE', message: 'oops' })).toBe(false);
  });
});
