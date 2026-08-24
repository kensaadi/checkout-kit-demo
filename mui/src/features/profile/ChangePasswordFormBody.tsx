import { Alert, Box, Stack } from '@mui/material';
import { Button } from '@dashforge/ui';
import { useDashFormContext } from '@dashforge/forms';
import { useSnackbar } from '@dashforge/ui';
import { change_customer_password } from '@api/me/me.service';
import type { ChangePasswordInput } from '@api/me/me.types';
import { useApiSubmit } from '@shared/forms/useApiSubmit';
import { PasswordField } from '../../components/fields';

/**
 * Owns the submit for the change-password form. This is the form
 * that demonstrates the kit's headline error-handling pattern:
 *
 *   - Client-side: zod schema's `.refine()` catches
 *     `newPassword !== confirmNewPassword` BEFORE the BE call.
 *     Error lands on `confirmNewPassword` field.
 *
 *   - Server-side: when the customer types the WRONG current
 *     password, the BE returns
 *       422 + `{ "error": "...", "details": { "currentPassword": "..." } }`
 *     `useApiSubmit` reads `details` and maps each entry to
 *     `rhf.setError(field, ...)`. The PasswordField on
 *     `currentPassword` renders the message under itself
 *     automatically — **zero handler code in this body**.
 *
 * The buyer reading this file sees a 3-field form + a submit
 * call. The whole error story is implicit. That's the kit's
 * value proposition in concrete form.
 */
export function ChangePasswordFormBody() {
  const { rhf } = useDashFormContext<ChangePasswordInput>();
  const { success } = useSnackbar();

  const onSubmit = useApiSubmit(rhf, {
    submit: change_customer_password,
    resetOnSuccess: true,
    onSuccess: () => {
      success('Password changed');
    },
  });

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Alert severity="info" variant="outlined">
          You'll stay signed in. Use the new password the next time
          you log in.
        </Alert>

        <PasswordField<ChangePasswordInput>
          name="currentPassword"
          label="Current password"
          placeholder="Enter your current password"
          autoComplete="current-password"
        />

        <PasswordField<ChangePasswordInput>
          name="newPassword"
          label="New password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />

        <PasswordField<ChangePasswordInput>
          name="confirmNewPassword"
          label="Confirm new password"
          placeholder="Repeat the new password"
          autoComplete="new-password"
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            loading={rhf.formState.isSubmitting}
          >
            Change password
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
