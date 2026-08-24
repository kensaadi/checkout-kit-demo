import { type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AnyAuthGuard, CustomerGuard, StaffGuard } from '@shared/rbac/guards';
import { useUser } from '@shared/store/user.store';
import { Seo } from '@seo';
import { AppShell } from '../components/layout/AppShell';
import { CartPage } from '../features/cart/CartPage';
import { CheckoutPage } from '../features/checkout/CheckoutPage';
import { DemoSplashPage } from '../features/auth/DemoSplashPage';
import { HomePage } from '../features/home/HomePage';
import { LoginPage } from '../features/auth/LoginPage';
import {
  OrderDetailPage,
  OrdersListPage,
} from '../features/orders';
import { AdminDashboardPage } from '../features/admin/dashboard';
import {
  AdminOrderDetailPage,
  AdminOrdersListPage,
} from '../features/admin/orders';
import {
  AdminProductCreatePage,
  AdminProductEditPage,
  AdminProductsListPage,
} from '../features/admin/products';
import {
  ChangePasswordPage,
  ProfilePage,
} from '../features/profile';
import {
  ProductDetailPage,
  ProductsListPage,
} from '../features/storefront';
import { DocsRouter } from '@docs/DocsRouter';

/**
 * Defines every route in the MUI flavor.
 *
 *   /               — DemoSplashPage for anon, /welcome for authed
 *   /login          — staff manual login form
 *   /customer-login — customer manual login form
 *   /welcome        — placeholder authenticated home (more pages
 *                     mount here as features land)
 *
 * Authenticated routes are wrapped with `AuthGate` which redirects
 * to `/` if the user is not signed in. Role-specific gating
 * (admin / staff / customer) will use the guards from
 * `@shared/rbac/guards` once the admin and customer features land.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route
        path="/login"
        element={
          <Private title="Sign in (staff)">
            <LoginPage kind="staff" />
          </Private>
        }
      />
      <Route
        path="/customer-login"
        element={
          <Private title="Sign in (customer)">
            <LoginPage kind="customer" />
          </Private>
        }
      />
      <Route
        path="/welcome"
        element={
          <Private title="Home">
            <AuthGate>
              <AppShell>
                <HomePage />
              </AppShell>
            </AuthGate>
          </Private>
        }
      />
      <Route
        path="/cart"
        element={
          <Private title="Cart">
            <CustomerGuard>
              <AppShell>
                <CartPage />
              </AppShell>
            </CustomerGuard>
          </Private>
        }
      />
      <Route
        path="/checkout"
        element={
          <Private title="Checkout">
            <CustomerGuard>
              <AppShell>
                <CheckoutPage />
              </AppShell>
            </CustomerGuard>
          </Private>
        }
      />
      <Route
        path="/orders"
        element={
          <Private title="Orders">
            <CustomerGuard>
              <AppShell>
                <OrdersListPage />
              </AppShell>
            </CustomerGuard>
          </Private>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <Private title="Order detail">
            <CustomerGuard>
              <AppShell>
                <OrderDetailPage />
              </AppShell>
            </CustomerGuard>
          </Private>
        }
      />
      <Route
        path="/admin"
        element={
          <Private title="Admin · Dashboard">
            <StaffGuard>
              <AppShell>
                <AdminDashboardPage />
              </AppShell>
            </StaffGuard>
          </Private>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <Private title="Admin · Orders">
            <StaffGuard>
              <AppShell>
                <AdminOrdersListPage />
              </AppShell>
            </StaffGuard>
          </Private>
        }
      />
      <Route
        path="/admin/orders/:id"
        element={
          <Private title="Admin · Order detail">
            <StaffGuard>
              <AppShell>
                <AdminOrderDetailPage />
              </AppShell>
            </StaffGuard>
          </Private>
        }
      />
      <Route
        path="/admin/products"
        element={
          <Private title="Admin · Products">
            <StaffGuard>
              <AppShell>
                <AdminProductsListPage />
              </AppShell>
            </StaffGuard>
          </Private>
        }
      />
      <Route
        path="/admin/products/new"
        element={
          <Private title="Admin · New product">
            <StaffGuard>
              <AppShell>
                <AdminProductCreatePage />
              </AppShell>
            </StaffGuard>
          </Private>
        }
      />
      <Route
        path="/admin/products/:id"
        element={
          <Private title="Admin · Edit product">
            <StaffGuard>
              <AppShell>
                <AdminProductEditPage />
              </AppShell>
            </StaffGuard>
          </Private>
        }
      />
      <Route
        path="/profile"
        element={
          <Private title="Profile">
            <CustomerGuard>
              <AppShell>
                <ProfilePage />
              </AppShell>
            </CustomerGuard>
          </Private>
        }
      />
      <Route
        path="/profile/change-password"
        element={
          <Private title="Change password">
            <CustomerGuard>
              <AppShell>
                <ChangePasswordPage />
              </AppShell>
            </CustomerGuard>
          </Private>
        }
      />
      <Route
        path="/shop"
        element={
          <Private title="Shop">
            <AnyAuthGuard>
              <AppShell>
                <ProductsListPage />
              </AppShell>
            </AnyAuthGuard>
          </Private>
        }
      />
      <Route
        path="/shop/:slug"
        element={
          <Private title="Product">
            <AnyAuthGuard>
              <AppShell>
                <ProductDetailPage />
              </AppShell>
            </AnyAuthGuard>
          </Private>
        }
      />
      {/* Docs are public — no auth guard, no AppShell, per-page Seo. */}
      <Route path="/docs/*" element={<DocsRouter />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Wraps an auth-gated route with `<Seo noindex>` so private
 * surfaces never leak to crawlers (belt-and-braces with robots.txt)
 * and browser tabs carry the right title. Cheaper than mounting
 * Seo inside every page component.
 */
function Private({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <Seo title={title} noindex />
      {children}
    </>
  );
}

/**
 * Root route: anonymous users see the demo splash, authenticated
 * users go straight to /welcome. Single entry point for both.
 */
function RootRedirect() {
  const { user } = useUser();
  return user ? <Navigate to="/welcome" replace /> : <DemoSplashPage />;
}

/**
 * Redirects to `/` if not signed in. Wraps content in nothing else
 * — the AppShell stays an explicit choice of the route itself.
 */
function AuthGate({ children }: { children: ReactNode }) {
  const { user } = useUser();
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}
