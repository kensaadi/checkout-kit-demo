import { PROVIDER } from '@api/_shared/config';
import type {
  ChangePasswordInput,
  ChangePasswordResult,
  CustomerProfile,
  StaffProfile,
  UpdateCustomerInput,
} from './me.types';

/**
 * Contract every me-provider must implement.
 *
 * Two read methods — one per BE endpoint — and two customer-only
 * mutations. Staff profile mutations are intentionally out of
 * scope V1 (staff accounts are admin-provisioned).
 */
export interface MeProvider {
  getStaffMe(): Promise<StaffProfile>;
  getCustomerMe(): Promise<CustomerProfile>;
  updateCustomerMe(input: UpdateCustomerInput): Promise<CustomerProfile>;
  changeCustomerPassword(
    input: ChangePasswordInput,
  ): Promise<ChangePasswordResult>;
}

const meProviderMapping: Record<string, () => Promise<MeProvider>> = {
  live: () => import('./live/me.live').then((m) => m.default as MeProvider),
  mock: () => import('./mock/me.mock').then((m) => m.default as MeProvider),
};

export async function meProvider(): Promise<MeProvider> {
  const loader = meProviderMapping[PROVIDER];
  if (!loader) {
    throw new Error(`[me] provider "${PROVIDER}" not supported`);
  }
  return loader();
}
