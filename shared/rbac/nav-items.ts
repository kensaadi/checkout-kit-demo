import type { NavigationItem } from '@dashforge/rbac';

/**
 * Single source of truth for the topbar / sidebar navigation.
 *
 * Each item declares an optional `access` requirement. At render
 * time, the layout passes this array through
 * `filterNavigationItems(NAV_ITEMS, can)` (from `@dashforge/rbac`)
 * to get the subset visible to the current subject — admin sees
 * everything, sales sees only `orders` + admin-products read-only,
 * customer sees only public + own areas.
 *
 * Adding a new top-level destination = adding one item here.
 * Adding a sub-item = nesting under `children`. The render code
 * does not change.
 */
export const NAV_ITEMS: NavigationItem[] = [
  {
    id: 'storefront',
    label: 'Shop',
    path: '/',
    // No `access` → always visible.
  },
  {
    id: 'orders-mine',
    label: 'My orders',
    path: '/orders',
    access: { resource: 'orders', action: 'read' },
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    access: { resource: 'self', action: 'read' },
  },
  {
    id: 'admin',
    label: 'Admin',
    access: { resource: 'products', action: 'read' },
    children: [
      {
        id: 'admin-products',
        label: 'Products',
        path: '/admin/products',
        access: { resource: 'products', action: 'read' },
      },
      {
        id: 'admin-orders',
        label: 'Orders',
        path: '/admin/orders',
        access: { resource: 'orders', action: 'read' },
      },
    ],
  },
];
