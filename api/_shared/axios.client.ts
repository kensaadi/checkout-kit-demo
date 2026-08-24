import axios, { type InternalAxiosRequestConfig } from 'axios';
import type { ZodSchema } from 'zod';
import { authStore, logout } from '@shared/store/auth.store';
import { API_HOST } from './config';
import { normalizeAxiosError } from './error.normalize';
import type { ApiError } from './error.types';

/**
 * Extend axios's request config so each call can attach a zod schema
 * for response validation. When set, the response interceptor parses
 * the body against the schema; mismatch throws a CONTRACT_MISMATCH
 * ApiError instead of letting a malformed shape leak into the app.
 */
declare module 'axios' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface AxiosRequestConfig {
    responseSchema?: ZodSchema;
  }
}

/**
 * Pulls the request URL out of an ApiError's `cause`. Used by the
 * 401-redirect interceptor to skip auto-logout for login attempts
 * (otherwise "wrong credentials" would loop the user to /login).
 */
function getRequestUrl(apiError: ApiError): string {
  if (
    apiError.cause &&
    typeof apiError.cause === 'object' &&
    'config' in apiError.cause
  ) {
    const cfg = (apiError.cause as { config?: { url?: string } }).config;
    if (cfg && typeof cfg.url === 'string') return cfg.url;
  }
  return '';
}

const axiosClient = axios.create({
  baseURL: API_HOST,
});

// --- Request: inject Bearer token from authStore (Valtio) ---
axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.token;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// --- Response (1/2): validate schema if attached, normalize errors ---
//
// Success path: if the request carried a `responseSchema`, parse the
// body against it. Schema failure throws an ApiError so the catch
// branch handles it uniformly.
//
// Error path: every rejection is funneled through `normalizeAxiosError`
// so downstream code only ever sees the ApiError shape.
axiosClient.interceptors.response.use(
  (response) => {
    const schema = response.config.responseSchema;
    if (schema) {
      const parsed = schema.safeParse(response.data);
      if (!parsed.success) {
        const apiError: ApiError = {
          code: 'CONTRACT_MISMATCH',
          message: 'Unexpected response from server.',
          status: response.status,
          cause: parsed.error,
        };
        throw apiError;
      }
      response.data = parsed.data;
    }
    return response;
  },
  (error) => Promise.reject(normalizeAxiosError(error)),
);

// --- Response (2/2): cross-cutting 401 → logout + redirect ---
//
// Centralizing this here means no component ever needs to write
// `if (error.code === 'UNAUTHORIZED') navigate('/login')`. Two
// guards prevent reload loops:
//
//   - **Login attempt**: a 401 hitting /auth/login or /auth/customer-login
//     is "wrong credentials" — the LoginForm renders it inline.
//     Doing logout+redirect here would clear the form and reload
//     the same screen on every wrong-password attempt.
//
//   - **No-token state**: if `authStore.token` was already null when
//     the call went out, the 401 means the endpoint is auth-protected
//     and the user isn't signed in (e.g. the boot-time policy fetch
//     before login). Logging out the already-empty session +
//     redirecting to /login would trigger an infinite reload loop
//     when the page-load itself fires another such call. Skip the
//     redirect — components above can render an "auth required"
//     state from the ApiError code.
axiosClient.interceptors.response.use(
  (response) => response,
  (apiError: ApiError) => {
    if (apiError.code === 'UNAUTHORIZED') {
      const url = getRequestUrl(apiError);
      const isLoginAttempt =
        url.includes('/auth/login') ||
        url.includes('/auth/customer-login');
      const wasUnauthenticated = authStore.token === null;

      if (!isLoginAttempt && !wasUnauthenticated) {
        logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(apiError);
  },
);

export default axiosClient;
