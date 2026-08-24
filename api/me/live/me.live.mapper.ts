import type {
  ChangePasswordInput,
  CustomerProfile,
  StaffProfile,
} from '../me.types';
import type {
  BackendChangePasswordRequest,
  BackendCustomerMe,
  BackendStaffMe,
} from './me.live.types';

/**
 * BE → FE: staff profile.
 *
 * Two non-trivial moves:
 *   1. `profile.firstName + profile.lastName` → single `name`.
 *      Falls back to email-local-part if both are empty, so a
 *      freshly seeded admin doesn't render as an awkward blank
 *      label in the top-bar.
 *   2. `role: "admin"` (single string) → `roles: ["admin"]` (array).
 *      The FE was designed for multi-role staff from day one;
 *      collapsing to a one-element array preserves that contract
 *      without forcing the BE schema to grow.
 *
 * Empty profile sub-fields (the BE serializes them with
 * `omitempty`) are treated as empty strings — the FE schema
 * requires `name` to exist.
 */
export function mapStaffMe(input: BackendStaffMe): StaffProfile {
  const first = input.profile.firstName ?? '';
  const last = input.profile.lastName ?? '';
  const fullName = [first, last].filter((s) => s.length > 0).join(' ');
  const name = fullName.length > 0 ? fullName : input.email.split('@')[0]!;

  return {
    id: input.id,
    email: input.email,
    name,
    roles: [input.role],
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

/**
 * BE → FE: customer profile.
 *
 * Flattens the nested `profile.{firstName,lastName}` to top-level
 * fields. Missing sub-fields (omitempty BE-side) become empty
 * strings; the FE schema requires both.
 */
export function mapCustomerMe(input: BackendCustomerMe): CustomerProfile {
  return {
    id: input.id,
    email: input.email,
    firstName: input.profile.firstName ?? '',
    lastName: input.profile.lastName ?? '',
    stripeCustomerId: input.stripeCustomerId,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

/**
 * FE → BE: change-password request body.
 *
 * Renames `confirmNewPassword` → `confirmPassword` to match the
 * Go handler's `changePasswordRequest` struct. The BE validates
 * the typo-protection echo at the handler layer (not the service),
 * so the wire shape is the only place this name appears.
 */
export function mapChangePasswordRequest(
  input: ChangePasswordInput,
): BackendChangePasswordRequest {
  return {
    currentPassword: input.currentPassword,
    newPassword: input.newPassword,
    confirmPassword: input.confirmNewPassword,
  };
}
