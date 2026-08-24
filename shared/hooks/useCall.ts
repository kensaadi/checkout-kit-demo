import { useCallback, useRef, useState } from 'react';
import type { ApiError } from '@api/_shared/error.types';
import type { Result } from '@api/_shared/result.types';

/**
 * State exposed by `useCall`.
 *
 *   - `data`    → last successful result, or `null`
 *   - `error`   → last failure, or `null`
 *   - `loading` → true while the in-flight call is pending
 */
export interface UseCallState<TData> {
  data: TData | null;
  error: ApiError | null;
  loading: boolean;
}

/**
 * Generic mutation hook for actions that are NOT a form submit.
 *
 * Use it for things like a quantity +/- button on a cart row, a
 * "Remove" link, a "Mark as read" toggle. The hook owns the
 * loading flag, the error state, and an optional success/error
 * callback. The component just calls `call(args)` from an event
 * handler.
 *
 *   const { loading, call } = useCall(cart_service.add_item, {
 *     onSuccess: () => refreshCart(),
 *   });
 *   <button disabled={loading} onClick={() => call({ productId, quantity: 1 })}>
 *     Add to cart
 *   </button>
 *
 * Form submits use `useApiSubmit` instead — that hook also handles
 * `VALIDATION_ERROR.details` → field errors, which a button can't
 * meaningfully render.
 *
 * Callback identities (`onSuccess`, `onError`) can change between
 * renders without re-creating `call`; the hook reads them via a
 * ref so the returned `call` stays stable.
 */
export function useCall<TArgs extends unknown[], TData>(
  fn: (...args: TArgs) => Promise<Result<TData>>,
  opts?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: ApiError) => void;
  },
): UseCallState<TData> & {
  call: (...args: TArgs) => Promise<Result<TData>>;
  reset: () => void;
} {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  // Stable ref to opts so the returned `call` identity does not
  // change every render when the consumer passes inline callbacks.
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const call = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError(null);
      const r = await fn(...args);
      setLoading(false);
      if (r.error) {
        setData(null);
        setError(r.error);
        optsRef.current?.onError?.(r.error);
      } else {
        setData(r.data);
        setError(null);
        optsRef.current?.onSuccess?.(r.data);
      }
      return r;
    },
    [fn],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, error, loading, call, reset };
}
