import { DashFormProvider } from '@dashforge/forms';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UpdateCustomerInputSchema,
  type UpdateCustomerInput,
} from '@api/me/me.types';
import { useUser } from '@shared/store/user.store';
import { ProfileFormBody } from './ProfileFormBody';

/**
 * Thin parent — mounts the DashFormProvider with the customer's
 * current firstName / lastName as initial values, so the form is
 * pre-filled on open.
 *
 * Reads from userStore which is populated by the post-login
 * `get_customer_me()` call. If the user lands here on a cold
 * reload, the page-level fetch in ProfilePage refreshes
 * userStore first.
 */
export function ProfileForm() {
  const { user } = useUser();

  return (
    <DashFormProvider<UpdateCustomerInput>
      resolver={zodResolver(UpdateCustomerInputSchema)}
      defaultValues={{
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
      }}
      mode="onBlur"
    >
      <ProfileFormBody />
    </DashFormProvider>
  );
}
