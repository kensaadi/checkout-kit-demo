import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import type { ApiError } from '@api/_shared/error.types';
import type { Result } from '@api/_shared/result.types';

/**
 * Default handler for non-validation errors. Apps register a real
 * handler at boot — typically one that opens a snackbar via the
 * UI library of choice.
 *
 *   // in mui/src/main.tsx
 *   setDefaultErrorHandler((e) =>
 *     enqueueSnackbar(e.message, { variant: 'error' }),
 *   );
 *
 * Until configured, errors land in the console. Per-form custom
 * handlers always take precedence via the `onError` opt.
 */
type DefaultErrorHandler = (error: ApiError) => void;

let defaultErrorHandler: DefaultErrorHandler = (e) => {
  // eslint-disable-next-line no-console
  console.error('[useApiSubmit] no default error handler registered:', e);
};

export function setDefaultErrorHandler(handler: DefaultErrorHandler): void {
  defaultErrorHandler = handler;
}

/**
 * Submit-handler factory for forms backed by `<DashForm>` /
 * `useDashFormContext`. Bridges the BE error pipeline with the RHF
 * form state in three lines per form:
 *
 *   const onSubmit = useApiSubmit(rhf, {
 *     submit: (input) => auth_service.login(input),
 *     onSuccess: ({ token }) => { authStore.token = token; navigate('/'); },
 *   });
 *
 *   <form onSubmit={onSubmit}>...</form>
 *
 * Behavior:
 *
 *   1. Calls `submit(values)` and awaits the `Result<T>`.
 *   2. On success → optional `reset()` + `onSuccess(data)`.
 *   3. On VALIDATION_ERROR with field-level `details` → maps each
 *      detail to `rhf.setError(field, { type: 'server', message })`.
 *      The form renders the message under the matching field
 *      automatically (DashForge `<TextField>` + `useDashFieldMeta`).
 *   4. On any other error → custom `onError(err, rhf)` if provided,
 *      else the registered default handler.
 *
 * Errors NEVER throw out of this function. The form is responsible
 * for resetting `formState.errors.root` between submits (RHF does
 * that automatically on each `handleSubmit` invocation).
 */
export function useApiSubmit<
  TInput extends FieldValues,
  TOutput,
>(
  rhf: UseFormReturn<TInput>,
  opts: {
    submit: (input: TInput) => Promise<Result<TOutput>>;
    onSuccess?: (data: TOutput) => void;
    onError?: (error: ApiError, rhf: UseFormReturn<TInput>) => void;
    resetOnSuccess?: boolean;
  },
) {
  return rhf.handleSubmit(async (input) => {
    const r = await opts.submit(input);

    if (r.error) {
      // Field-level BE validation → pin to fields via RHF setError.
      // DashForge fields render the resulting messages without any
      // additional component-level code.
      if (r.error.code === 'VALIDATION_ERROR' && r.error.details) {
        for (const [field, message] of Object.entries(r.error.details)) {
          rhf.setError(field as Path<TInput>, {
            type: 'server',
            message,
          });
        }
        return;
      }

      // Anything else: custom handler (e.g. UNAUTHORIZED → setError
      // on root) or the registered default (typically a snackbar).
      if (opts.onError) {
        opts.onError(r.error, rhf);
      } else {
        defaultErrorHandler(r.error);
      }
      return;
    }

    if (opts.resetOnSuccess) rhf.reset();
    opts.onSuccess?.(r.data);
  });
}
