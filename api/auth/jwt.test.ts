import { describe, expect, it } from 'vitest';
import { decodeJwtPayload, encodeMockJwt } from './jwt';

describe('encodeMockJwt + decodeJwtPayload — round trip', () => {
  it('encodes a payload to a 3-segment token', () => {
    const token = encodeMockJwt({ sub: 'user-1', roles: ['admin'] });
    expect(token.split('.')).toHaveLength(3);
  });

  it('decodes back to the original claims', () => {
    const original = { sub: 'user-1', roles: ['admin', 'sales'] };
    const token = encodeMockJwt(original);
    const decoded = decodeJwtPayload(token);
    expect(decoded).toEqual(original);
  });

  it('preserves an `exp` claim through encode/decode', () => {
    const exp = 1735689600;
    const token = encodeMockJwt({ sub: 'u', roles: [], exp });
    expect(decodeJwtPayload(token)?.exp).toBe(exp);
  });
});

describe('decodeJwtPayload — defensive paths', () => {
  it('returns null for a non-JWT string', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
  });

  it('returns null for a token with the wrong number of segments', () => {
    expect(decodeJwtPayload('a.b')).toBeNull();
    expect(decodeJwtPayload('a.b.c.d')).toBeNull();
  });

  it('returns null for an empty payload segment', () => {
    expect(decodeJwtPayload('a..c')).toBeNull();
  });

  it('returns null when payload is not valid base64', () => {
    expect(decodeJwtPayload('a.@@@@.c')).toBeNull();
  });

  it('returns null when payload is base64 but not valid JSON', () => {
    // base64 of "not json" → "bm90IGpzb24="; without padding "bm90IGpzb24"
    expect(decodeJwtPayload('a.bm90IGpzb24.c')).toBeNull();
  });

  it('returns null when payload is JSON but not an object', () => {
    // base64url of "42" → "NDI"
    expect(decodeJwtPayload('a.NDI.c')).toBeNull();
  });

  it('handles missing optional claims without throwing', () => {
    const token = encodeMockJwt({});
    const decoded = decodeJwtPayload(token);
    expect(decoded).toEqual({});
  });
});
