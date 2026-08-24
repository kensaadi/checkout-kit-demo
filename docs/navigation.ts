/**
 * Navigation index for the checkout-kit documentation.
 *
 * Three selectors persist in the top bar and decide which content
 * variant a page renders: version, frontend flavor, backend flavor.
 *
 * Version is GLOBAL to the kit — a Go-side change ships as
 * v1.0.1, not "Go v1.0.1 / MUI v1.0.0". When a new version lands,
 * append it to `DOC_VERSIONS` and the selector picks it up.
 */
export type DocNavItem = {
  label: string;
  path: string;
  emoji: string;
  /** Hint to the renderer about which page bits depend on which
   *  selector. Used only for badges in the sidebar, NOT for routing. */
  varies?: ('fe' | 'be')[];
};

export type DocNavSection = {
  section: string;
  items: DocNavItem[];
};

export const DOC_VERSIONS = ['v1.0.0'] as const;
export type DocVersion = (typeof DOC_VERSIONS)[number];
export const DEFAULT_DOC_VERSION: DocVersion = 'v1.0.0';

export type FeFlavor = 'mui' | 'tailwind';
export type BeFlavor = 'go' | 'node';
export const DEFAULT_FE: FeFlavor = 'mui';
export const DEFAULT_BE: BeFlavor = 'go';

export const docsNavigation: DocNavSection[] = [
  {
    section: 'Getting Started',
    items: [
      { label: 'Introduction', path: '/docs', emoji: '🏠' },
      { label: 'Installation', path: '/docs/installation', emoji: '⚡', varies: ['be'] },
    ],
  },
  {
    section: 'Architecture',
    items: [
      { label: 'Project Structure', path: '/docs/architecture', emoji: '📁', varies: ['fe', 'be'] },
      { label: 'MUI vs Tailwind', path: '/docs/mui-vs-tailwind', emoji: '⚖️' },
      { label: 'Provider Pattern', path: '/docs/provider-pattern', emoji: '🧪', varies: ['fe'] },
      { label: 'RBAC Engine', path: '/docs/rbac', emoji: '🛡️', varies: ['be'] },
      { label: 'Theme & Tokens', path: '/docs/theme', emoji: '🎨', varies: ['fe'] },
    ],
  },
  {
    section: 'Storefront',
    items: [
      { label: 'Catalog', path: '/docs/catalog', emoji: '🛍️', varies: ['fe'] },
      { label: 'Stripe Checkout', path: '/docs/checkout', emoji: '💳', varies: ['fe'] },
      { label: 'Cart & Orders', path: '/docs/cart-orders', emoji: '🛒', varies: ['fe'] },
    ],
  },
  {
    section: 'Admin',
    items: [
      { label: 'Products CRUD', path: '/docs/admin-products', emoji: '⚙️', varies: ['fe', 'be'] },
      { label: 'Dashboard', path: '/docs/admin-dashboard', emoji: '📊', varies: ['fe'] },
    ],
  },
  {
    section: 'API Reference',
    items: [
      { label: 'Bruno Collection', path: '/docs/bruno', emoji: '🍱' },
      { label: 'Endpoints', path: '/docs/api-endpoints', emoji: '📡', varies: ['be'] },
      { label: 'Stripe Webhook', path: '/docs/webhook', emoji: '🔔', varies: ['be'] },
    ],
  },
  {
    section: 'Deployment',
    items: [
      { label: 'Deploy to DO', path: '/docs/deployment', emoji: '🚀', varies: ['be'] },
      { label: 'Production Checklist', path: '/docs/production', emoji: '✅' },
    ],
  },
  {
    section: 'Get the kit',
    items: [
      { label: 'Pricing', path: '/docs/pricing', emoji: '💰', varies: ['be'] },
      { label: 'License', path: '/docs/license', emoji: '📄' },
      { label: 'Privacy Policy', path: '/docs/privacy', emoji: '🔒' },
    ],
  },
];

export const flatNavItems: DocNavItem[] = docsNavigation.flatMap(
  (s) => s.items,
);

export function getPrevNext(currentPath: string): {
  prev: DocNavItem | null;
  next: DocNavItem | null;
} {
  const idx = flatNavItems.findIndex((i) => i.path === currentPath);
  return {
    prev: idx > 0 ? flatNavItems[idx - 1]! : null,
    next:
      idx >= 0 && idx < flatNavItems.length - 1
        ? flatNavItems[idx + 1]!
        : null,
  };
}
