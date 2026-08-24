import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSnapshot } from 'valtio';
import { userStore } from '@shared/store/user.store';

/**
 * Roles known to the FE. Mirrors the BE seeded roles.
 */
type Role = 'admin' | 'sales' | 'customer';

/**
 * Generic role-based gate. Used by the three exported guards
 * below; not exported itself to keep the public surface narrow.
 *
 * Decision tree:
 *
 *   no user in store          → redirect to /login
 *   user, but no allowed role → redirect to /unauthorized
 *   user with allowed role    → render children
 *
 * Role gating is distinct from RBAC permission gating:
 *
 *   - Role gates protect entire AREAS of the app (back-office vs
 *     storefront vs customer area). They live at the route level.
 *
 *   - Permission gates protect specific ACTIONS on specific
 *     resources (e.g. `products:update`). They live at the field
 *     level via the `access` prop on DashForge components, or
 *     around action buttons via `<Can>`.
 *
 * The two layers compose: a customer reaching the admin area is
 * stopped here (wrong role); an admin reaching a field they don't
 * own a permission for is stopped by the field's `access` prop.
 */
function RoleGuard({
  allow,
  children,
}: {
  allow: Role[];
  children: ReactNode;
}) {
  const snap = useSnapshot(userStore) as typeof userStore;
  const user = snap.user;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAllowedRole = user.roles.some((r) =>
    (allow as string[]).includes(r),
  );

  if (!hasAllowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

/**
 * Gates a route to admin users only. Used to wrap entire back-office
 * sub-trees like `/admin/*`.
 *
 *   <Route path="/admin/*" element={
 *     <AdminGuard><AdminLayout /></AdminGuard>
 *   } />
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  return <RoleGuard allow={['admin']}>{children}</RoleGuard>;
}

/**
 * Gates a route to staff (admin + sales). Used for back-office
 * routes that sales can read but not necessarily mutate (the
 * mutation gating happens via per-field `access` props).
 */
export function StaffGuard({ children }: { children: ReactNode }) {
  return <RoleGuard allow={['admin', 'sales']}>{children}</RoleGuard>;
}

/**
 * Gates a route to customer users. Used for the customer-only
 * surface: cart, checkout, customer profile, customer orders.
 */
export function CustomerGuard({ children }: { children: ReactNode }) {
  return <RoleGuard allow={['customer']}>{children}</RoleGuard>;
}

/**
 * Gates a route to ANY signed-in user, regardless of role. Used
 * for surfaces that any subject can legitimately view — e.g. the
 * public storefront browse: customers shop there, staff preview
 * "what customers see" without the cart write actions (those
 * stay gated by `<Can resource="cart">` at the component level).
 *
 * Anonymous visitors still bounce to /login.
 */
export function AnyAuthGuard({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allow={['admin', 'sales', 'customer']}>{children}</RoleGuard>
  );
}
