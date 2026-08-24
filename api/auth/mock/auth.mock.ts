import type { ApiError } from '@api/_shared/error.types';
import type { AuthProvider } from '../auth.provider';
import type { LoginInput, LoginResult } from '../auth.types';
import { MOCK_CUSTOMERS, MOCK_DELAY_MS, MOCK_STAFF } from './auth.mock.data';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Throws an ApiError-shaped object for invalid credentials so the
 * `attempt()` wrapper recognises it directly (via `isApiError`)
 * instead of wrapping it as UNKNOWN. Matches what a real 401
 * response would produce.
 */
function invalidCredentials(): never {
  const err: ApiError = {
    code: 'UNAUTHORIZED',
    message: 'invalid credentials',
    status: 401,
  };
  throw err;
}

async function loginStaff(input: LoginInput): Promise<LoginResult> {
  await delay(MOCK_DELAY_MS);
  const account = MOCK_STAFF[input.email];
  if (!account || account.password !== input.password) {
    invalidCredentials();
  }
  return { token: account.token };
}

async function loginCustomer(input: LoginInput): Promise<LoginResult> {
  await delay(MOCK_DELAY_MS);
  const account = MOCK_CUSTOMERS[input.email];
  if (!account || account.password !== input.password) {
    invalidCredentials();
  }
  return { token: account.token };
}

const authMockProvider: AuthProvider = { loginStaff, loginCustomer };
export default authMockProvider;
