import axiosClient from '@api/_shared/axios.client';
import type { MeProvider } from '../me.provider';
import type {
  ChangePasswordInput,
  ChangePasswordResult,
  CustomerProfile,
  StaffProfile,
  UpdateCustomerInput,
} from '../me.types';
import {
  mapChangePasswordRequest,
  mapCustomerMe,
  mapStaffMe,
} from './me.live.mapper';
import {
  BackendCustomerMeSchema,
  BackendStaffMeSchema,
  type BackendCustomerMe,
  type BackendStaffMe,
} from './me.live.types';

async function getStaffMe(): Promise<StaffProfile> {
  const { data } = await axiosClient.get<BackendStaffMe>('/v1/me', {
    responseSchema: BackendStaffMeSchema,
  });
  return mapStaffMe(data);
}

async function getCustomerMe(): Promise<CustomerProfile> {
  const { data } = await axiosClient.get<BackendCustomerMe>(
    '/v1/customer/me',
    { responseSchema: BackendCustomerMeSchema },
  );
  return mapCustomerMe(data);
}

async function updateCustomerMe(
  input: UpdateCustomerInput,
): Promise<CustomerProfile> {
  // FE → BE: input shape is a strict subset of the BE struct
  // (firstName, lastName), so a direct pass-through is correct.
  // No mapper needed here — the BE accepts unknown fields absent.
  const { data } = await axiosClient.patch<BackendCustomerMe>(
    '/v1/customer/me',
    input,
    { responseSchema: BackendCustomerMeSchema },
  );
  return mapCustomerMe(data);
}

async function changeCustomerPassword(
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  // BE returns 204 No Content on success. There is no body to
  // validate, so we deliberately skip responseSchema and synthesize
  // the FE-shaped `{ ok: true }` here. Failure paths still surface
  // via the axios interceptor → ApiError.
  await axiosClient.post(
    '/v1/customer/change-password',
    mapChangePasswordRequest(input),
  );
  return { ok: true };
}

const meLiveProvider: MeProvider = {
  getStaffMe,
  getCustomerMe,
  updateCustomerMe,
  changeCustomerPassword,
};
export default meLiveProvider;
