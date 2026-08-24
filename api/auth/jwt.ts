/**
 * Minimal JWT helpers for the FE.
 *
 * The BE signs and verifies tokens; the FE only needs to PEEK at
 * the payload to know the user's roles for routing decisions. We
 * decode the payload segment without verifying the signature —
 * trusting the BE not to send tokens it didn't sign, which is the
 * standard FE pattern.
 *
 * `encodeMockJwt` is provided for the mock provider and tests so
 * fake-but-decodable tokens can be generated without a crypto lib.
 * It produces tokens with a dummy signature ("mock-sig") that the
 * real BE would never accept — strictly for offline mocks.
 */

/**
 * Claims the FE reads from the BE-issued JWT. Other claims are
 * ignored (the FE only needs identity + roles for routing).
 */
export interface JwtClaims {
  /** Subject — typically the user id. */
  sub?: string;
  /** Role array, used by route guards. */
  roles?: string[];
  /** Unix expiration timestamp (seconds), optional. */
  exp?: number;
}

function base64UrlDecode(input: string): string {
  // base64url → base64, pad, decode.
  let b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  if (typeof atob !== 'undefined') return atob(b64);
  return Buffer.from(b64, 'base64').toString('utf-8');
}

function base64UrlEncode(str: string): string {
  const b64 =
    typeof btoa !== 'undefined'
      ? btoa(str)
      : Buffer.from(str, 'utf-8').toString('base64');
  return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Decodes the payload segment of a JWT.
 *
 * Returns `null` on any parse failure (malformed token, broken
 * base64, invalid JSON) so callers fall back gracefully without a
 * try/catch.
 */
export function decodeJwtPayload(token: string): JwtClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    if (!payload) return null;
    const json = base64UrlDecode(payload);
    const parsed = JSON.parse(json) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed as JwtClaims;
  } catch {
    return null;
  }
}

/**
 * Builds a fake-but-decodable JWT for the mock provider and tests.
 * The signature segment is the literal string "mock-sig" — the
 * real BE will reject it. Use ONLY for offline mocks.
 */
export function encodeMockJwt(payload: JwtClaims): string {
  const header = base64UrlEncode(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  );
  const body = base64UrlEncode(JSON.stringify(payload));
  return `${header}.${body}.mock-sig`;
}
