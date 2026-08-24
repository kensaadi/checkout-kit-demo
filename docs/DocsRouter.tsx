import { Routes, Route, Navigate } from 'react-router-dom';
import { DocsProvider } from './DocsContext';
import { DocsLayout } from './layout/DocsLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts';
import { Deployment } from './pages/Deployment';
import { ApiEndpoints } from './pages/ApiEndpoints';
import { Architecture } from './pages/Architecture';
import { BrunoCollection } from './pages/BrunoCollection';
import { Catalog } from './pages/Catalog';
import { CartOrders } from './pages/CartOrders';
import { Installation } from './pages/Installation';
import { Introduction } from './pages/Introduction';
import { License } from './pages/License';
import { MuiVsTailwind } from './pages/MuiVsTailwind';
import { Pricing } from './pages/Pricing';
import { ProductionChecklist } from './pages/ProductionChecklist';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { ProviderPattern } from './pages/ProviderPattern';
import { RbacEngine } from './pages/RbacEngine';
import { StripeCheckout } from './pages/StripeCheckout';
import { ThemeTokens } from './pages/ThemeTokens';
import { Webhook } from './pages/Webhook';

/**
 * Documentation router. Mounted under /docs/* in AppRouter,
 * OUTSIDE the auth guards — the docs are public.
 *
 * DocsProvider wraps everything so version + fe + be selectors
 * survive across route changes.
 */
export function DocsRouter() {
  return (
    <DocsProvider>
      <Routes>
        <Route element={<DocsLayout />}>
          <Route index element={<Introduction />} />
          <Route path="installation" element={<Installation />} />
          <Route path="architecture" element={<Architecture />} />
          <Route path="mui-vs-tailwind" element={<MuiVsTailwind />} />
          <Route path="provider-pattern" element={<ProviderPattern />} />
          <Route path="rbac" element={<RbacEngine />} />
          <Route path="theme" element={<ThemeTokens />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="checkout" element={<StripeCheckout />} />
          <Route path="cart-orders" element={<CartOrders />} />
          <Route path="admin-products" element={<AdminProducts />} />
          <Route path="admin-dashboard" element={<AdminDashboard />} />
          <Route path="bruno" element={<BrunoCollection />} />
          <Route path="api-endpoints" element={<ApiEndpoints />} />
          <Route path="webhook" element={<Webhook />} />
          <Route path="deployment" element={<Deployment />} />
          <Route path="production" element={<ProductionChecklist />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="license" element={<License />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="*" element={<Navigate to="/docs" replace />} />
        </Route>
      </Routes>
    </DocsProvider>
  );
}
