import { z } from 'zod';

/**
 * Wire shapes the BE actually serializes. These mirror the Go
 * structs in `server/internal/model/{user,customer,person}.go` —
 * NOT the FE-facing types in `me.types.ts`.
 *
 * Two reasons they live here:
 *   1. Co-located with the live adapter that consumes them — the
 *      mock provider speaks FE shape directly and never touches
 *      these schemas.
 *   2. Validated by axios's `responseSchema` interceptor on the
 *      wire, then handed to `me.live.mapper.ts` which translates
 *      BE shape → FE shape (the type the rest of the kit consumes).
 *
 * Differences from the FE shape, summarised:
 *   - `profile.{firstName,lastName,phone,avatar,address}` nested
 *     instead of flat at the root.
 *   - Staff carries `role: string` (singular); FE expects
 *     `roles: string[]`.
 *   - Both carry `status` and `lastLoginAt` that the FE does not
 *     currently surface.
 */

export const BackendAddressSchema = z.object({
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
});

export const BackendPersonSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  address: BackendAddressSchema.optional(),
});

/**
 * Staff (admin/sales) record from `GET /v1/me`. Mirrors `model.User`.
 * `passwordHash` is `json:"-"` BE-side so it never reaches us.
 */
export const BackendStaffMeSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.string(),
  profile: BackendPersonSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  lastLoginAt: z.string().optional(),
});
export type BackendStaffMe = z.infer<typeof BackendStaffMeSchema>;

/**
 * Customer record from `GET /v1/customer/me` and the response of
 * `PATCH /v1/customer/me`. Mirrors `model.Customer`.
 */
export const BackendCustomerMeSchema = z.object({
  id: z.string(),
  email: z.string(),
  status: z.string(),
  profile: BackendPersonSchema,
  stripeCustomerId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastLoginAt: z.string().optional(),
});
export type BackendCustomerMe = z.infer<typeof BackendCustomerMeSchema>;

/**
 * Wire shape for `POST /v1/customer/change-password`.
 *
 * The BE handler field is `confirmPassword`, NOT `confirmNewPassword`
 * — the FE input schema uses the latter. The mapper renames at the
 * boundary so neither side has to know about the other's vocabulary.
 */
export type BackendChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
