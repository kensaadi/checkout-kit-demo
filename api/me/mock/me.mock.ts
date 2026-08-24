import type { ApiError } from '@api/_shared/error.types';
import { authStore } from '@shared/store/auth.store';
import { decodeJwtPayload } from '../../auth/jwt';
import type { MeProvider } from '../me.provider';
import type {
  ChangePasswordInput,
  ChangePasswordResult,
  CustomerProfile,
  StaffProfile,
  UpdateCustomerInput,
} from '../me.types';
import {
  MOCK_CUSTOMER_PASSWORDS,
  MOCK_CUSTOMER_PROFILES,
  MOCK_DELAY_MS,
  MOCK_STAFF_PROFILES,
} from './me.mock.data';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function makeError(
  code: ApiError['code'],
  message: string,
  status: number,
): ApiError {
  return { code, message, status };
}

/**
 * Reads `sub` from the current JWT in authStore. Returns `null`
 * if no token / bad token. The mock uses this as a stand-in for
 * the BE's "look up user by JWT subject" logic.
 */
function currentSubjectId(): string | null {
  const token = authStore.token;
  if (!token) return null;
  return decodeJwtPayload(token)?.sub ?? null;
}

async function getStaffMe(): Promise<StaffProfile> {
  await delay(MOCK_DELAY_MS);
  const sub = currentSubjectId();
  if (!sub) throw makeError('UNAUTHORIZED', 'not signed in', 401);

  const profile = MOCK_STAFF_PROFILES[sub];
  if (!profile) throw makeError('FORBIDDEN', 'not a staff user', 403);
  return { ...profile };
}

async function getCustomerMe(): Promise<CustomerProfile> {
  await delay(MOCK_DELAY_MS);
  const sub = currentSubjectId();
  if (!sub) throw makeError('UNAUTHORIZED', 'not signed in', 401);

  const profile = MOCK_CUSTOMER_PROFILES[sub];
  if (!profile) throw makeError('FORBIDDEN', 'not a customer', 403);
  return { ...profile };
}

async function updateCustomerMe(
  input: UpdateCustomerInput,
): Promise<CustomerProfile> {
  await delay(MOCK_DELAY_MS);
  const sub = currentSubjectId();
  if (!sub) throw makeError('UNAUTHORIZED', 'not signed in', 401);

  const profile = MOCK_CUSTOMER_PROFILES[sub];
  if (!profile) throw makeError('FORBIDDEN', 'not a customer', 403);

  // Mutate the mock fixture so subsequent reads see the new values.
  MOCK_CUSTOMER_PROFILES[sub] = {
    ...profile,
    firstName: input.firstName,
    lastName: input.lastName,
    updatedAt: new Date().toISOString(),
  };
  return { ...MOCK_CUSTOMER_PROFILES[sub] };
}

async function changeCustomerPassword(
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  await delay(MOCK_DELAY_MS);
  const sub = currentSubjectId();
  if (!sub) throw makeError('UNAUTHORIZED', 'not signed in', 401);
  if (!MOCK_CUSTOMER_PROFILES[sub]) {
    throw makeError('FORBIDDEN', 'not a customer', 403);
  }

  const current = MOCK_CUSTOMER_PASSWORDS[sub];
  if (current !== input.currentPassword) {
    // Surface as field-level validation so the form pins the
    // message to the "currentPassword" field via setError.
    const err: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Current password is incorrect',
      status: 422,
      details: { currentPassword: 'Current password is incorrect' },
    };
    throw err;
  }

  MOCK_CUSTOMER_PASSWORDS[sub] = input.newPassword;
  return { ok: true };
}

const meMockProvider: MeProvider = {
  getStaffMe,
  getCustomerMe,
  updateCustomerMe,
  changeCustomerPassword,
};
export default meMockProvider;
