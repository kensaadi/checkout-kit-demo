import { describe, expect, it } from 'vitest';
import { attempt } from './attempt';

describe('attempt', () => {
  it('returns { data, error: null } on success', async () => {
    const result = await attempt(Promise.resolve(42));
    expect(result.data).toBe(42);
    expect(result.error).toBeNull();
  });

  it('preserves complex success payloads', async () => {
    const payload = { id: 'x', items: [1, 2, 3] };
    const result = await attempt(Promise.resolve(payload));
    expect(result.data).toEqual(payload);
  });

  it('returns the ApiError unchanged when the promise rejects with one', async () => {
    const apiError = {
      code: 'UNAUTHORIZED' as const,
      message: 'no token',
      status: 401,
    };
    const result = await attempt(Promise.reject(apiError));
    expect(result.data).toBeNull();
    expect(result.error).toEqual(apiError);
  });

  it('wraps a plain Error into UNKNOWN ApiError', async () => {
    const result = await attempt(Promise.reject(new Error('boom')));
    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('UNKNOWN');
    expect(result.error?.message).toBe('boom');
  });

  it('wraps a non-Error, non-ApiError rejection into UNKNOWN', async () => {
    const result = await attempt(Promise.reject('a string'));
    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('UNKNOWN');
  });
});
