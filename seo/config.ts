/**
 * Site-wide SEO defaults. Buyers fork this once when they
 * rebrand — every <Seo> on every page reads from here.
 *
 * Pointed at the public demo URL. To override per environment,
 * set VITE_PUBLIC_SITE_URL in `.env` and rebuild.
 */

const RAW_URL =
  (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined) ??
  'https://checkout-kit.dashforge-ui.com';

/** No trailing slash — canonical URLs concatenate the path directly. */
export const SITE_URL = RAW_URL.replace(/\/$/, '');

export const SITE_NAME = 'checkout-kit';

export const SITE_TAGLINE =
  'Stripe Checkout App (Go/Node, MUI/Tailwind)';

/** Used when a page does not provide its own title. */
export const DEFAULT_TITLE = `${SITE_NAME} · ${SITE_TAGLINE}`;

export const DEFAULT_DESCRIPTION =
  'Production Stripe checkout app for React. Storefront, cart, 3-step Stripe wizard, admin, RBAC, S3 uploads. Go or Node backend, MongoDB or PostgreSQL (Postgres free on request), MUI or Tailwind frontend.';

/**
 * Default Open Graph / Twitter share image. The kit's build
 * pipeline should drop a `og-image.png` (1200×630) into
 * /public — until then this points at a placeholder so the
 * meta tags stay valid (social cards degrade gracefully).
 */
export const DEFAULT_OG_IMAGE = '/og-image.png';

export const TWITTER_SITE = '@dashforge_ui';

export const LOCALE = 'en_US';

/**
 * Build a fully-qualified URL from a path (`/docs/pricing`).
 * Used by <Seo> for canonical + Open Graph + JSON-LD.
 */
export function absoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

/**
 * Compose the document title.
 *  - undefined / empty → DEFAULT_TITLE
 *  - already ends with site name → use as-is
 *  - otherwise → "<page title> · <site name>"
 */
export function composeTitle(pageTitle: string | undefined): string {
  if (!pageTitle) return DEFAULT_TITLE;
  if (pageTitle.endsWith(SITE_NAME)) return pageTitle;
  return `${pageTitle} · ${SITE_NAME}`;
}
