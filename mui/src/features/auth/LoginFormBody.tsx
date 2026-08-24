import { useDashFormContext } from '@dashforge/forms';
import { Button } from '@dashforge/ui';
import { Alert, Box, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login_customer, login_staff } from '@api/auth/auth.service';
import type { LoginInput } from '@api/auth/auth.types';
import { get_customer_me, get_staff_me } from '@api/me/me.service';
import { useApiSubmit } from '@shared/forms/useApiSubmit';
import { authStore } from '@shared/store/auth.store';
import { refreshCart } from '@shared/store/cart.store';
import { userStore, type UserSnapshot } from '@shared/store/user.store';
import { EmailField, PasswordField } from '../../components/fields';

/**
 * Owns the submit. Lives inside the DashFormProvider context so it
 * can pull `rhf` from `useDashFormContext` and feed it to
 * `useApiSubmit`. Renders its own `<form>` element — the provider
 * intentionally does NOT render a wrapping `<form>` so we don't
 * end up with nested forms.
 */
export function LoginFormBody({ kind }: { kind: 'staff' | 'customer' }) {
  const { rhf } = useDashFormContext<LoginInput>();
  const navigate = useNavigate();

  const onSubmit = useApiSubmit(rhf, {
    submit: (input) =>
      kind === 'staff' ? login_staff(input) : login_customer(input),
    onSuccess: async ({ token }) => {
      // 1. Save token: triggers axios bearer injection on subsequent calls.
      authStore.token = token;

      // 2. Fetch the full profile so userStore carries name /
      //    firstName / lastName — not just JWT claims. The two
      //    branches use DIFFERENT endpoints with different return
      //    shapes, so we keep them apart to let TypeScript narrow
      //    the profile type cleanly.
      let user: UserSnapshot;
      if (kind === 'staff') {
        const meResult = await get_staff_me();
        if (meResult.error) {
          authStore.token = null;
          rhf.setError('root', { message: meResult.error.message });
          return;
        }
        user = {
          id: meResult.data.id,
          email: meResult.data.email,
          roles: meResult.data.roles,
          name: meResult.data.name,
        };
      } else {
        const meResult = await get_customer_me();
        if (meResult.error) {
          authStore.token = null;
          rhf.setError('root', { message: meResult.error.message });
          return;
        }
        user = {
          id: meResult.data.id,
          email: meResult.data.email,
          roles: ['customer'],
          firstName: meResult.data.firstName,
          lastName: meResult.data.lastName,
        };
      }

      userStore.user = user;

      // Pre-warm the cart store for customers so the topbar
      // badge shows the correct count on the first paint of
      // /welcome instead of "0 → flicker → real count".
      if (kind === 'customer') {
        await refreshCart();
      }

      navigate('/welcome');
    },
    onError: (apiError, rhf) => {
      // The axios interceptor's auto-logout SKIPS login URLs, so a
      // 401 lands here intact. Surface it as a form-level "root"
      // error — the body renders this as the inline <Alert> above
      // the fields. Anything else falls through to the default
      // handler (snackbar) wired in AppProviders.
      if (apiError.code === 'UNAUTHORIZED') {
        rhf.setError('root', {
          message: 'Email or password are incorrect',
        });
      }
    },
  });

  const rootError = rhf.formState.errors.root?.message;

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ width: '100%' }}>
      <Stack spacing={3}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            {kind === 'staff' ? 'Staff sign in' : 'Customer sign in'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {kind === 'staff'
              ? 'Back-office access for admin and sales.'
              : 'Public storefront access for buyers.'}
          </Typography>
        </Box>

        {rootError && <Alert severity="error">{rootError}</Alert>}

        <EmailField<LoginInput> name="email" />
        <PasswordField<LoginInput> name="password" />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          loading={rhf.formState.isSubmitting}
        >
          Sign in
        </Button>
      </Stack>
    </Box>
  );
}
