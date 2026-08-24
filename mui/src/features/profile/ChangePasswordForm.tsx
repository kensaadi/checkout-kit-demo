import { DashFormProvider } from '@dashforge/forms';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChangePasswordInputSchema,
  type ChangePasswordInput,
} from '@api/me/me.types';
import { ChangePasswordFormBody } from './ChangePasswordFormBody';

/**
 * Thin parent — mounts the DashFormProvider with the zod
 * resolver. The schema includes `.refine()` for the
 * newPassword === confirmNewPassword check, so mismatched
 * passwords land as a FE-side field error on
 * `confirmNewPassword` without a BE round-trip.
 */
export function ChangePasswordForm() {
  return (
    <DashFormProvider<ChangePasswordInput>
      resolver={zodResolver(ChangePasswordInputSchema)}
      defaultValues={{
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }}
      mode="onBlur"
    >
      <ChangePasswordFormBody />
    </DashFormProvider>
  );
}
