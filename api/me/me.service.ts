import { attempt } from '@api/_shared/attempt';
import type { Result } from '@api/_shared/result.types';
import { meProvider } from './me.provider';
import type {
  ChangePasswordInput,
  ChangePasswordResult,
  CustomerProfile,
  StaffProfile,
  UpdateCustomerInput,
} from './me.types';

/**
 * Fetches the signed-in staff user's profile from `GET /v1/me`.
 * Call after a successful `login_staff()` to populate userStore
 * with `{ name, ... }` fields the JWT alone does not carry.
 */
export async function get_staff_me(): Promise<Result<StaffProfile>> {
  const provider = await meProvider();
  return attempt(provider.getStaffMe());
}

/**
 * Fetches the signed-in customer's profile from
 * `GET /v1/customer/me`. Call after a successful
 * `login_customer()` to populate userStore.
 */
export async function get_customer_me(): Promise<Result<CustomerProfile>> {
  const provider = await meProvider();
  return attempt(provider.getCustomerMe());
}

/**
 * Updates the signed-in customer's profile. Returns the refreshed
 * profile so the caller can sync userStore in one step.
 *
 * On validation failure (e.g. firstName empty), the BE returns
 * VALIDATION_ERROR + `details` — `useApiSubmit` maps that to
 * field errors automatically.
 */
export async function update_customer_me(
  input: UpdateCustomerInput,
): Promise<Result<CustomerProfile>> {
  const provider = await meProvider();
  return attempt(provider.updateCustomerMe(input));
}

/**
 * Changes the signed-in customer's password.
 *
 * On wrong current password the BE returns UNAUTHORIZED — but
 * unlike a login 401, here the axios interceptor does NOT skip
 * the auto-logout-redirect because this URL is not a login
 * endpoint. Callers that want inline error display should map
 * VALIDATION_ERROR via the standard `useApiSubmit` flow; for
 * "current password wrong" prefer routing the BE to return a
 * VALIDATION_ERROR with `details.currentPassword` instead of a
 * raw 401.
 */
export async function change_customer_password(
  input: ChangePasswordInput,
): Promise<Result<ChangePasswordResult>> {
  const provider = await meProvider();
  return attempt(provider.changeCustomerPassword(input));
}
