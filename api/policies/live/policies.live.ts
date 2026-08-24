import axiosClient from '@api/_shared/axios.client';
import type { PoliciesProvider } from '../policies.provider';
import { RbacPolicySchema, type RbacPolicy } from '../policies.types';

async function getPolicies(): Promise<RbacPolicy> {
  const { data } = await axiosClient.get<RbacPolicy>('/v1/policies', {
    responseSchema: RbacPolicySchema,
  });
  return data;
}

const policiesLiveProvider: PoliciesProvider = { getPolicies };
export default policiesLiveProvider;
