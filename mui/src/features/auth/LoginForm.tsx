import { DashFormProvider } from '@dashforge/forms';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginInputSchema, type LoginInput } from '@api/auth/auth.types';
import { LoginFormBody } from './LoginFormBody';

/**
 * Thin parent — mounts the DashFormProvider with the zod resolver
 * and the default empty values. All real logic (submit, error
 * mapping, post-success navigation) lives in `LoginFormBody`
 * because that's where `useDashFormContext` is available.
 */
export function LoginForm({ kind }: { kind: 'staff' | 'customer' }) {
  return (
    <DashFormProvider<LoginInput>
      resolver={zodResolver(LoginInputSchema)}
      defaultValues={{ email: '', password: '' }}
      mode="onBlur"
    >
      <LoginFormBody kind={kind} />
    </DashFormProvider>
  );
}
