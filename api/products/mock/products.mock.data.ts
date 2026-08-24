import type { Product } from '../products.types';

export const MOCK_DELAY_MS = 150;

/**
 * Seeded catalog for the mock provider. Mirrors
 * `server/seed/products.json` byte-for-byte where the shape
 * allows, with cover + gallery URLs added (the BE seed doesn't
 * carry images — those land via the admin upload endpoints).
 *
 * Image URLs point to Unsplash's CDN with `auto=format` + size
 * hints so each render is cache-friendly and consistent across
 * demo replays.
 *
 * Keys are product ids — the same ones used as `productId` in
 * `cart.mock.data.ts`, so add-to-cart from the storefront
 * resolves to a real catalog entry.
 *
 * Exported as a `Map` (not a plain object) so admin mutations
 * — create / update / delete — can grow / shrink the catalog
 * naturally. Test helpers reset to the seeded baseline.
 */
function seed(p: Product): Product {
  return { ...p };
}

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&h=900&fit=crop&auto=format&q=80`;

const INITIAL: Product[] = [
  seed({
    id: 'prod-pro-annual',
    slug: 'dashforge-pro-annual',
    name: 'DashForge Pro — Annual',
    description:
      'The full DashForge experience for one year. All UI components, all kits, priority Discord support, and white-label rights. Renews automatically; cancel anytime. Best for teams shipping more than one product per quarter.',
    price: 49900,
    currency: 'usd',
    active: true,
    coverUrl: U('1499951360447-b19be8fe80f5'),
    galleryUrls: [U('1517694712202-14dd9538aa97'), U('1551288049-bebda4e38f71')],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }),
  seed({
    id: 'prod-starter-monthly',
    slug: 'starter-monthly',
    name: 'Starter Monthly',
    description:
      'Entry tier billed monthly. Access to the core component library and one starter kit of your choice. Community Discord support. Cancel anytime — no questions, no email forms.',
    price: 1900,
    currency: 'usd',
    active: true,
    coverUrl: U('1517336714731-489689fd1ca8'),
    galleryUrls: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }),
  seed({
    id: 'prod-ui-library',
    slug: 'ui-component-library',
    name: 'UI Component Library',
    description:
      '60+ production-grade React components with full TypeScript types, dark mode, and RBAC field-level access props. One-time purchase, lifetime updates. Used in three of our shipped kits already.',
    price: 19900,
    currency: 'usd',
    active: true,
    coverUrl: U('1467232004584-a241de8bcf5d'),
    galleryUrls: [U('1581291518857-4e27b48ff24e'), U('1593642632559-0c6d3fc62b89')],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }),
  seed({
    id: 'prod-templates-bundle',
    slug: 'templates-bundle',
    name: 'Templates Bundle',
    description:
      '12 Figma + React templates covering dashboards, marketing pages, auth flows, and checkout funnels. Source files included, MIT-licensed for the React layer.',
    price: 9900,
    currency: 'usd',
    active: true,
    coverUrl: U('1561070791-2526d30994b8'),
    galleryUrls: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }),
  seed({
    id: 'prod-lifetime',
    slug: 'lifetime-access',
    name: 'Lifetime Access',
    description:
      'One payment, everything DashForge ever ships. Current catalog, every future kit, every future component release. Cap of 100 seats — first come, first served.',
    price: 99900,
    currency: 'usd',
    active: true,
    coverUrl: U('1556761175-5973dc0f32e7'),
    galleryUrls: [U('1559526324-4b87b5e36e44')],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }),
  // A draft (active=false) so admin tests can verify the
  // public-vs-admin visibility filter behaves correctly.
  seed({
    id: 'prod-enterprise-draft',
    slug: 'enterprise-coming-soon',
    name: 'Enterprise — Coming Soon',
    description: 'Bespoke onboarding, SSO, SLA, dedicated support channel. Reveals when active=true is toggled.',
    price: 199900,
    currency: 'usd',
    active: false,
    coverUrl: null,
    galleryUrls: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }),
];

export const MOCK_PRODUCTS: Map<string, Product> = new Map(
  INITIAL.map((p) => [p.id, p]),
);

/** Test helper — resets to the seeded baseline. */
export function _resetMockProducts(): void {
  MOCK_PRODUCTS.clear();
  for (const p of INITIAL) {
    MOCK_PRODUCTS.set(p.id, seed(p));
  }
}
