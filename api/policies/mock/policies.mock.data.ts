import type { RbacPolicy } from '../policies.types';

export const MOCK_DELAY_MS = 100;

/**
 * Mirrors `server/seed/policies.json` byte-for-byte so the FE
 * route guards and RBAC checks behave identically against the
 * mock and the live BE.
 *
 * Keep this file in sync when the seed changes — there is no
 * compile-time link between them. A spec test could enforce
 * parity later if drift becomes a real problem.
 */
export const MOCK_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'admin',
      permissions: [{ action: '*', resource: '*', effect: 'allow' }],
    },
    {
      name: 'sales',
      permissions: [
        { action: 'read', resource: 'self', effect: 'allow' },
        { action: 'read', resource: 'products', effect: 'allow' },
        { action: 'read', resource: 'orders', effect: 'allow' },
        { action: 'read', resource: 'customers', effect: 'allow' },
        { action: 'read', resource: 'dashboard/sales', effect: 'allow' },
        { action: 'read', resource: 'dashboard/customers', effect: 'allow' },
      ],
    },
    {
      name: 'customer',
      permissions: [
        { action: 'read', resource: 'self', effect: 'allow' },
        { action: 'update', resource: 'self', effect: 'allow' },
        { action: 'read', resource: 'products', effect: 'allow' },
        { action: 'read', resource: 'orders', effect: 'allow' },
        { action: 'create', resource: 'orders', effect: 'allow' },
        { action: 'read', resource: 'customers', effect: 'allow' },
        { action: 'read', resource: 'cart', effect: 'allow' },
        { action: 'create', resource: 'cart', effect: 'allow' },
        { action: 'update', resource: 'cart', effect: 'allow' },
        { action: 'delete', resource: 'cart', effect: 'allow' },
        { action: 'read', resource: 'checkout', effect: 'allow' },
        { action: 'create', resource: 'checkout', effect: 'allow' },
      ],
    },
  ],
};
