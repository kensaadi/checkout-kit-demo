import axiosClient from '@api/_shared/axios.client';
import type { AuthProvider } from '../auth.provider';
import {
  LoginResultSchema,
  type LoginInput,
  type LoginResult,
} from '../auth.types';

async function loginStaff(input: LoginInput): Promise<LoginResult> {
  const { data } = await axiosClient.post<LoginResult>(
    '/v1/auth/login',
    input,
    { responseSchema: LoginResultSchema },
  );
  return data;
}

async function loginCustomer(input: LoginInput): Promise<LoginResult> {
  const { data } = await axiosClient.post<LoginResult>(
    '/v1/auth/customer-login',
    input,
    { responseSchema: LoginResultSchema },
  );
  return data;
}

const authLiveProvider: AuthProvider = { loginStaff, loginCustomer };
export default authLiveProvider;
