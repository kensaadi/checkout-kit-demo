import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { normalizeAxiosError } from './error.normalize';
import type { ApiError } from './error.types';

/**
 * Helper that crafts an AxiosError shape close enough to what axios
 * produces at runtime, without going through a real HTTP request.
 */
function makeAxiosError(opts: {
  status?: number;
  data?: unknown;
  code?: string;
  url?: string;
}): AxiosError {
  const err = new AxiosError('boom');
  if (opts.code) err.code = opts.code;
  if (opts.url) {
    err.config = {
      url: opts.url,
      headers: new AxiosHeaders(),
    };
  }
  if (opts.status !== undefined) {
    err.response = {
      data: opts.data,
      status: opts.status,
      statusText: '',
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
  }
  return err;
}

describe('normalizeAxiosError — pass-through for already-normalized errors', () => {
  it('returns the ApiError unchanged when input is already an ApiError', () => {
    const existing: ApiError = {
      code: 'CONTRACT_MISMATCH',
      message: 'bad shape',
    };
    const result = normalizeAxiosError(existing);
    expect(result).toBe(existing);
  });
});

describe('normalizeAxiosError — network failures (no response)', () => {
  it('classifies ECONNABORTED as TIMEOUT', () => {
    const result = normalizeAxiosError(makeAxiosError({ code: 'ECONNABORTED' }));
    expect(result.code).toBe('TIMEOUT');
    expect(result.message).toBe('The request took too long. Please retry.');
  });

  it('classifies any other code without response as NETWORK_ERROR', () => {
    const result = normalizeAxiosError(makeAxiosError({}));
    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.message).toContain('Cannot reach the server');
  });

  it('keeps the original error in `cause`', () => {
    const original = makeAxiosError({});
    const result = normalizeAxiosError(original);
    expect(result.cause).toBe(original);
  });
});

describe('normalizeAxiosError — HTTP status classification', () => {
  it.each([
    [401, 'UNAUTHORIZED'],
    [403, 'FORBIDDEN'],
    [404, 'NOT_FOUND'],
    [409, 'CONFLICT'],
    [422, 'VALIDATION_ERROR'],
    [500, 'SERVER_ERROR'],
    [502, 'SERVER_ERROR'],
    [503, 'SERVER_ERROR'],
    [400, 'BUSINESS_ERROR'],
    [410, 'BUSINESS_ERROR'],
    [418, 'BUSINESS_ERROR'],
  ] as const)('HTTP %i → code %s', (status, expectedCode) => {
    const result = normalizeAxiosError(makeAxiosError({ status }));
    expect(result.code).toBe(expectedCode);
    expect(result.status).toBe(status);
  });
});

describe('normalizeAxiosError — server message extraction', () => {
  it('reads from `{ error: "string" }` (checkout-kit BE shape)', () => {
    const result = normalizeAxiosError(
      makeAxiosError({ status: 401, data: { error: 'invalid credentials' } }),
    );
    expect(result.message).toBe('invalid credentials');
  });

  it('reads from `{ error: { message: "..." } }`', () => {
    const result = normalizeAxiosError(
      makeAxiosError({
        status: 401,
        data: { error: { message: 'token expired' } },
      }),
    );
    expect(result.message).toBe('token expired');
  });

  it('falls back to humanize default when body has no error field', () => {
    const result = normalizeAxiosError(
      makeAxiosError({ status: 401, data: {} }),
    );
    expect(result.message).toBe('Please sign in again.');
  });

  it('falls back to humanize default when body is missing entirely', () => {
    const result = normalizeAxiosError(makeAxiosError({ status: 500 }));
    expect(result.message).toBe(
      'A server error occurred. Please retry in a moment.',
    );
  });
});

describe('normalizeAxiosError — server code extraction', () => {
  it('reads top-level `code`', () => {
    const result = normalizeAxiosError(
      makeAxiosError({
        status: 400,
        data: { error: 'card declined', code: 'CARD_DECLINED' },
      }),
    );
    expect(result.serverCode).toBe('CARD_DECLINED');
  });

  it('reads nested `error.code`', () => {
    const result = normalizeAxiosError(
      makeAxiosError({
        status: 400,
        data: { error: { message: 'card declined', code: 'CARD_DECLINED' } },
      }),
    );
    expect(result.serverCode).toBe('CARD_DECLINED');
  });

  it('returns undefined when no server code present', () => {
    const result = normalizeAxiosError(
      makeAxiosError({ status: 400, data: { error: 'oops' } }),
    );
    expect(result.serverCode).toBeUndefined();
  });
});

describe('normalizeAxiosError — validation details extraction', () => {
  it('extracts field-level details when body shape matches', () => {
    const result = normalizeAxiosError(
      makeAxiosError({
        status: 422,
        data: {
          error: 'validation',
          details: { email: 'invalid', password: 'too short' },
        },
      }),
    );
    expect(result.details).toEqual({
      email: 'invalid',
      password: 'too short',
    });
  });

  it('silently drops non-string detail values', () => {
    const result = normalizeAxiosError(
      makeAxiosError({
        status: 422,
        data: {
          error: 'v',
          details: { email: 'bad', count: 123, flag: true },
        },
      }),
    );
    expect(result.details).toEqual({ email: 'bad' });
  });

  it('returns undefined when all detail values are non-string', () => {
    const result = normalizeAxiosError(
      makeAxiosError({
        status: 422,
        data: { error: 'v', details: { count: 123, flag: true } },
      }),
    );
    expect(result.details).toBeUndefined();
  });

  it('returns undefined when details field is absent', () => {
    const result = normalizeAxiosError(
      makeAxiosError({ status: 422, data: { error: 'v' } }),
    );
    expect(result.details).toBeUndefined();
  });
});

describe('normalizeAxiosError — non-axios errors', () => {
  it('wraps a plain Error as UNKNOWN', () => {
    const err = new Error('boom');
    const result = normalizeAxiosError(err);
    expect(result.code).toBe('UNKNOWN');
    expect(result.message).toBe('boom');
    expect(result.cause).toBe(err);
  });

  it('uses default message when Error has empty message', () => {
    const result = normalizeAxiosError(new Error(''));
    expect(result.code).toBe('UNKNOWN');
    expect(result.message).toBe('Something went wrong.');
  });

  it('handles raw strings as UNKNOWN', () => {
    const result = normalizeAxiosError('a string');
    expect(result.code).toBe('UNKNOWN');
    expect(result.message).toBe('Something went wrong.');
  });

  it('handles null gracefully', () => {
    expect(normalizeAxiosError(null).code).toBe('UNKNOWN');
  });

  it('handles undefined gracefully', () => {
    expect(normalizeAxiosError(undefined).code).toBe('UNKNOWN');
  });
});
