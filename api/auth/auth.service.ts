import { attempt } from '@api/_shared/attempt';
import type { Result } from '@api/_shared/result.types';
import { authProvider } from './auth.provider';
import type { LoginInput, LoginResult } from './auth.types';

/**
 * Signs in a staff user (admin or sales role) via
 * POST /v1/auth/login.
 *
 * On 401 the axios interceptor SKIPS the auto-logout-and-redirect
 * because the URL is a login endpoint — the form is expected to
 * surface "wrong credentials" inline. Don't replicate that logic
 * in the caller.
 */
export async function login_staff(
  input: LoginInput,
): Promise<Result<LoginResult>> {
  const provider = await authProvider();
  return attempt(provider.loginStaff(input));
}

/**
 * Signs in a customer via POST /v1/auth/customer-login.
 *
 * Same 401-handling note as `login_staff`.
 */
export async function login_customer(
  input: LoginInput,
): Promise<Result<LoginResult>> {
  const provider = await authProvider();
  return attempt(provider.loginCustomer(input));
}
