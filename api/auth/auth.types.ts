import { z } from 'zod';

/**
 * Input accepted by both staff and customer login endpoints.
 * Same shape for both — the destination URL is decided by the
 * service function (login_staff vs login_customer), not by the
 * payload.
 */
export const LoginInputSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

/**
 * Successful login response.
 *
 * The BE returns only the JWT. Role + user id are encoded in the
 * JWT claims; the FE decodes them via `decodeJwtPayload` from
 * `./jwt`. Full profile data lives behind `/v1/me` /
 * `/v1/customer/me` and is fetched lazily when needed.
 */
export const LoginResultSchema = z.object({
  token: z.string().min(1),
});
export type LoginResult = z.infer<typeof LoginResultSchema>;
