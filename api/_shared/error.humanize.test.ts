import { describe, expect, it } from 'vitest';
import { humanize } from './error.humanize';

describe('humanize', () => {
  it('uses the BE-provided rawMessage when non-empty', () => {
    expect(
      humanize({ rawMessage: 'token expired', code: 'UNAUTHORIZED' }),
    ).toBe('token expired');
  });

  it('falls back to the code default when rawMessage is undefined', () => {
    expect(humanize({ code: 'NETWORK_ERROR' })).toBe(
      'Cannot reach the server. Check your connection.',
    );
  });

  it('falls back to the code default when rawMessage is empty', () => {
    expect(humanize({ rawMessage: '', code: 'UNAUTHORIZED' })).toBe(
      'Please sign in again.',
    );
  });

  it('falls back to the code default when rawMessage is only whitespace', () => {
    expect(humanize({ rawMessage: '   ', code: 'UNAUTHORIZED' })).toBe(
      'Please sign in again.',
    );
  });

  it('returns UNKNOWN default for unrecognised codes', () => {
    expect(humanize({ code: 'NONEXISTENT' as never })).toBe(
      'Something went wrong.',
    );
  });

  it('returns a defined message for every documented ApiErrorCode', () => {
    const codes = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'VALIDATION_ERROR',
      'SERVER_ERROR',
      'CONTRACT_MISMATCH',
      'BUSINESS_ERROR',
      'UNKNOWN',
    ] as const;
    for (const code of codes) {
      const result = humanize({ code });
      expect(result, `code=${code}`).toMatch(/.+/);
    }
  });
});
