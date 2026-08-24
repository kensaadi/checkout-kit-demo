import { useEffect } from 'react';
import { Box, Stack } from '@mui/material';
import { Button } from '@dashforge/ui';
import { useDashFormContext } from '@dashforge/forms';
import { useSnackbar } from '@dashforge/ui';
import { update_customer_me } from '@api/me/me.service';
import type { UpdateCustomerInput } from '@api/me/me.types';
import { useApiSubmit } from '@shared/forms/useApiSubmit';
import { userStore, useUser } from '@shared/store/user.store';
import { InputField } from '../../components/fields';

/**
 * Owns the submit for the profile edit form. After a successful
 * update:
 *   1. Syncs userStore so the topbar avatar / home greeting
 *      reflect the new name immediately
 *   2. Resets `isDirty` via `rhf.reset` with the new values so
 *      the "Save" button disables until the next edit
 *   3. Surfaces a "Profile updated" snackbar
 *
 * On VALIDATION_ERROR (e.g. server-side firstName length policy
 * not matched by the FE schema), `useApiSubmit` automatically
 * maps `details.firstName` → `rhf.setError('firstName', ...)`.
 * The InputField renders the message under the field with zero
 * code in this body.
 */
export function ProfileFormBody() {
  const { rhf } = useDashFormContext<UpdateCustomerInput>();
  const { user } = useUser();
  const { success } = useSnackbar();

  // Hydrate the form when userStore updates (e.g. after the
  // page-level get_customer_me() refresh resolves). Pre-fills
  // on cold load.
  useEffect(() => {
    if (user) {
      rhf.reset({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.firstName, user?.lastName]);

  const onSubmit = useApiSubmit(rhf, {
    submit: update_customer_me,
    onSuccess: (updated) => {
      // Sync userStore in place — every reader (topbar, home,
      // checkout billing details) sees the new name instantly.
      if (userStore.user) {
        userStore.user = {
          ...userStore.user,
          firstName: updated.firstName,
          lastName: updated.lastName,
        };
      }
      // Reset dirty state to the new values so "Save" disables
      // until the next user edit.
      rhf.reset({
        firstName: updated.firstName,
        lastName: updated.lastName,
      });
      success('Profile updated');
    },
  });

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={3}>
        <InputField<UpdateCustomerInput>
          name="firstName"
          label="First name"
          placeholder="Your first name"
          autoComplete="given-name"
        />
        <InputField<UpdateCustomerInput>
          name="lastName"
          label="Last name"
          placeholder="Your last name"
          autoComplete="family-name"
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            loading={rhf.formState.isSubmitting}
            disabled={!rhf.formState.isDirty}
          >
            Save changes
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
