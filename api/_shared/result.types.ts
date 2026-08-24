import type { ApiError } from './error.types';

/**
 * Discriminated result returned by every service function in the kit.
 *
 *   - Success → `{ data: T,    error: null }`
 *   - Failure → `{ data: null, error: ApiError }`
 *
 * Service functions never throw. The UI branches on `result.error`
 * without try/catch.
 *
 *   const r = await cart_service.add_item({ productId, quantity });
 *   if (r.error) return toast.error(r.error.message);
 *   refreshCart(r.data);
 */
export type Result<T> =
  | { data: T; error: null }
  | { data: null; error: ApiError };
