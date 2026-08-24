import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Button } from '@dashforge/ui';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { useNavigate } from 'react-router-dom';
import {
  admin_list_products,
  list_products,
} from '@api/products/products.service';
import {
  admin_list_orders,
  list_my_orders,
} from '@api/orders/orders.service';
import { useCart } from '@shared/store/cart.store';
import { useUser } from '@shared/store/user.store';
import { CountUp } from '../../components/CountUp';
import { InspectThisPage } from '../../components/demo/InspectThisPage';
import { PageFadeIn } from '../../components/layout/PageFadeIn';
import { formatPrice } from '../cart/format';

/**
 * Post-login landing. Replaces the old RBAC smoke test with a
 * role-aware dashboard:
 *
 *   - customer → orders count, cart preview, last order, CTAs to
 *                continue shopping / view profile
 *   - admin    → orders count, products count + drafts, revenue
 *                summary, CTAs to admin products / admin orders
 *   - sales    → same admin layout but with "read-only" hints
 *
 * KPI cards hydrate from real endpoints. Failures are silent —
 * the card shows a dash, never blocks the page.
 */
export function HomePage() {
  return (
    <PageFadeIn>
      <HomeContent />
    </PageFadeIn>
  );
}

function HomeContent() {
  const { user } = useUser();
  const navigate = useNavigate();
  const theme = useTheme();
  const { cart, count: cartCount } = useCart();

  const isCustomer = user?.roles.includes('customer') ?? false;
  const isAdmin = user?.roles.includes('admin') ?? false;
  const isStaff =
    user?.roles.some((r) => r === 'admin' || r === 'sales') ?? false;

  const [orderTotal, setOrderTotal] = useState<number | null>(null);
  const [productTotal, setProductTotal] = useState<number | null>(null);
  const [draftCount, setDraftCount] = useState<number | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [lastOrderStatus, setLastOrderStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    if (isCustomer) {
      list_my_orders({ page: 1, perPage: 1 }).then((r) => {
        if (!r.error) {
          setOrderTotal(r.data.meta.total);
          const first = r.data.data[0];
          if (first) {
            setLastOrderId(first.id);
            setLastOrderStatus(first.status);
          }
        }
        setLoading(false);
      });
    } else if (isStaff) {
      Promise.all([
        admin_list_orders({ page: 1, perPage: 1 }),
        admin_list_products({ page: 1, perPage: 100 }),
      ]).then(([ordersR, productsR]) => {
        if (!ordersR.error) setOrderTotal(ordersR.data.meta.total);
        if (!productsR.error) {
          setProductTotal(productsR.data.meta.total);
          const drafts = productsR.data.data.filter((p) => !p.active).length;
          setDraftCount(drafts);
        } else {
          list_products({ page: 1, perPage: 100 }).then((pr) => {
            if (!pr.error) setProductTotal(pr.data.meta.total);
          });
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) return null;

  const displayName =
    user.name ??
    ([user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
      user.email.split('@')[0]!);

  return (
    <Stack spacing={4}>
      {/* --- Welcome header --- */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: 'block' }}
          >
            Welcome back
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Signed in as {user.email}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {user.roles.map((role) => (
            <Chip
              key={role}
              label={role}
              size="small"
              sx={{
                bgcolor: theme.tokens.colors.primarySoft,
                color: theme.tokens.colors.primary,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* --- KPI cards --- */}
      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
        }}
      >
        {isCustomer && (
          <>
            <KpiCard
              icon={<ShoppingBagOutlinedIcon />}
              accent="primary"
              label="Cart"
              value={
                cart
                  ? `${cartCount} item${cartCount === 1 ? '' : 's'}`
                  : '—'
              }
              hint={
                cart && cart.items.length > 0
                  ? formatPrice(cart.itemsTotal, cart.currency)
                  : 'Empty'
              }
              cta="View cart"
              onCta={() => navigate('/cart')}
            />
            <KpiCard
              icon={<ReceiptLongOutlinedIcon />}
              accent="secondary"
              label="Your orders"
              value={loading ? null : orderTotal !== null ? orderTotal : 0}
              hint={
                lastOrderId && lastOrderStatus
                  ? `Last: ${lastOrderStatus}`
                  : 'No orders yet'
              }
              cta="View orders"
              onCta={() => navigate('/orders')}
            />
            <KpiCard
              icon={<PersonOutlinedIcon />}
              accent="warning"
              label="Profile"
              value="Manage"
              hint="Name, password, RBAC field-level"
              cta="Open profile"
              onCta={() => navigate('/profile')}
            />
          </>
        )}

        {isStaff && (
          <>
            <KpiCard
              icon={<ReceiptLongOutlinedIcon />}
              accent="primary"
              label="All orders"
              value={loading ? null : orderTotal !== null ? orderTotal : 0}
              hint={isAdmin ? 'Read + audit' : 'Read-only (sales scope)'}
              cta="View orders"
              onCta={() => navigate('/admin/orders')}
            />
            <KpiCard
              icon={<InventoryOutlinedIcon />}
              accent="secondary"
              label="Products"
              value={
                loading ? null : productTotal !== null ? productTotal : 0
              }
              hint={
                draftCount !== null
                  ? `${draftCount} draft${draftCount === 1 ? '' : 's'}`
                  : 'Public catalog'
              }
              cta={isAdmin ? 'Manage products' : 'View products'}
              onCta={() => navigate('/admin/products')}
            />
            <KpiCard
              icon={<StorefrontOutlinedIcon />}
              accent="warning"
              label="Dashboard"
              value="Live"
              hint="Sales chart + top products"
              cta="Open dashboard"
              onCta={() => navigate('/admin')}
            />
          </>
        )}
      </Box>

      {/* --- Hero CTA --- */}
      <Card
        sx={{
          background: theme.tokens.gradients.heroSoft,
          border: 'none',
          p: { xs: 3, md: 4 },
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: 'block', mb: 0.5 }}
            >
              {isCustomer ? 'The good part' : 'Customer view'}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {isCustomer
                ? 'Run a full Stripe checkout'
                : "See what they see"}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 540 }}>
              Drop something into the cart and walk the three-step
              wizard. Card{' '}
              <Box
                component="span"
                sx={{ fontFamily: 'monospace', fontWeight: 700 }}
              >
                4242 4242 4242 4242
              </Box>
              {' '}any future date, any CVC. Nothing is real.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/shop')}
            sx={{ flexShrink: 0 }}
          >
            Open the shop
          </Button>
        </Stack>
      </Card>

      <InspectThisPage
        metadata={{
          title: 'Role-aware dashboard',
          filePath: 'client/mui/src/features/home/HomePage.tsx',
          lines: 320,
          summary:
            'Post-login landing. Each card hydrates from the right endpoint based on the current role: customer sees cart + their orders + profile, staff sees all orders + products + drafts. Failures are silent — a card never blocks the page.',
          features: [
            'Role-based KPI cards (customer / admin / sales)',
            'Live cart count reactive via Valtio useSnapshot',
            'Sales-fallback: admin endpoints 403 → fall back to public counts',
            'Skeleton in loading, dash when fetch fails',
            'Stripe test card 4242 hint in the hero CTA',
          ],
          stack: ['React 19', 'Valtio', 'MUI'],
          endpoints: [
            'GET /v1/orders?page=1&perPage=1',
            'GET /v1/admin/orders',
            'GET /v1/admin/products?perPage=100',
            'GET /v1/products?perPage=100 (sales fallback)',
          ],
        }}
      />
    </Stack>
  );
}

/** One KPI tile. Loading state renders skeletons in place. */
function KpiCard({
  icon,
  accent,
  label,
  value,
  hint,
  cta,
  onCta,
}: {
  icon: React.ReactNode;
  accent: 'primary' | 'secondary' | 'warning';
  label: string;
  value: number | string | null;
  hint: string;
  cta: string;
  onCta: () => void;
}) {
  const theme = useTheme();
  const accentColor = theme.palette[accent].main;
  const accentSoft =
    accent === 'primary'
      ? theme.tokens.colors.primarySoft
      : accent === 'secondary'
        ? theme.tokens.colors.secondarySoft
        : theme.tokens.colors.accentSoft;

  return (
    <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack spacing={2.5} sx={{ flex: 1 }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center' }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: accentSoft,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& svg': { fontSize: 22 },
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 700,
            }}
          >
            {label}
          </Typography>
        </Stack>
        <Box sx={{ flex: 1 }}>
          {value === null ? (
            <Skeleton variant="text" width={120} height={48} />
          ) : (
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              <CountUp value={value} />
            </Typography>
          )}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {hint}
          </Typography>
        </Box>
        <Button
          variant="text"
          color={accent === 'warning' ? 'primary' : accent}
          onClick={onCta}
          sx={{ alignSelf: 'flex-start', mx: -1.5 }}
        >
          {cta} →
        </Button>
      </Stack>
    </Card>
  );
}
