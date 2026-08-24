import { useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button } from '@dashforge/ui';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSnackbar } from '@dashforge/ui';
import { login_customer, login_staff } from '@api/auth/auth.service';
import { get_customer_me, get_staff_me } from '@api/me/me.service';
import { authStore } from '@shared/store/auth.store';
import { refreshCart } from '@shared/store/cart.store';
import { userStore, type UserSnapshot } from '@shared/store/user.store';
import { BrandMark } from '../../components/layout/BrandMark';
import { DemoBanner } from '../../components/layout/DemoBanner';
import { PromoBar } from '../../components/layout/PromoBar';
import { ThemeModeToggle } from '../../components/layout/ThemeModeToggle';
import { InspectThisPage } from '../../components/demo/InspectThisPage';
import { Seo } from '@seo';
import {
  breadcrumbSchema,
  combineJsonLd,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from '@seo/jsonLd';

/**
 * Seeded demo accounts — keep BYTE-FOR-BYTE in sync with
 * `server/seed/users.json` + `server/seed/customers.json`. The
 * mock provider mirrors the same credentials so the splash
 * one-click works against both `VITE_PROVIDER=live` and `=mock`.
 */
type DemoRole = {
  kind: 'staff' | 'customer';
  email: string;
  password: string;
  title: string;
  tagline: string;
  preview: string[];
  icon: React.ReactNode;
  accent: 'primary' | 'secondary' | 'warning';
};

const DEMO_ROLES: Record<'customer' | 'admin' | 'sales', DemoRole> = {
  customer: {
    kind: 'customer',
    email: 'bob.buyer@example.com',
    password: 'BuyerPass!2026',
    title: 'Customer',
    tagline: 'Shop, pay, see your orders',
    preview: [
      'Browse the catalog + fill your cart',
      'Pay with Stripe Elements end-to-end',
      'See your orders + manage your profile',
    ],
    icon: <StorefrontOutlinedIcon />,
    accent: 'primary',
  },
  admin: {
    kind: 'staff',
    email: 'admin@checkout-kit.local',
    password: 'AdminPass!2026',
    title: 'Admin',
    tagline: 'Run the whole catalog',
    preview: [
      'Create, edit, delete products — drag-drop image upload',
      'Inspect every order across customers',
      'Wildcard RBAC: nothing is hidden',
    ],
    icon: <AdminPanelSettingsOutlinedIcon />,
    accent: 'secondary',
  },
  sales: {
    kind: 'staff',
    email: 'sales@checkout-kit.local',
    password: 'SalesPass!2026',
    title: 'Sales',
    tagline: 'See what scoped roles get',
    preview: [
      'Same screens as admin — but every input locks',
      'Mutations disappear without redirects',
      'Field-level RBAC, live',
    ],
    icon: <InsightsOutlinedIcon />,
    accent: 'warning',
  },
};

type DemoRoleKey = keyof typeof DEMO_ROLES;

const TECH_STACK = [
  'Go + Gin',
  'React 19 + MUI',
  'Stripe Elements',
  'MongoDB',
  'S3 storage',
  'TypeScript',
  'Zod contracts',
  '314 tests',
];

export function DemoSplashPage() {
  const [busy, setBusy] = useState<DemoRoleKey | null>(null);
  const navigate = useNavigate();
  const { error: notifyError } = useSnackbar();
  const theme = useTheme();

  async function handleDemoLogin(roleKey: DemoRoleKey) {
    const role = DEMO_ROLES[roleKey];
    setBusy(roleKey);

    const fn = role.kind === 'staff' ? login_staff : login_customer;
    const r = await fn({ email: role.email, password: role.password });
    setBusy(null);

    if (r.error) {
      notifyError(r.error.message);
      return;
    }

    authStore.token = r.data.token;

    let user: UserSnapshot;
    if (role.kind === 'staff') {
      const meResult = await get_staff_me();
      if (meResult.error) {
        authStore.token = null;
        notifyError(meResult.error.message);
        return;
      }
      user = {
        id: meResult.data.id,
        email: meResult.data.email,
        roles: meResult.data.roles,
        name: meResult.data.name,
      };
    } else {
      const meResult = await get_customer_me();
      if (meResult.error) {
        authStore.token = null;
        notifyError(meResult.error.message);
        return;
      }
      user = {
        id: meResult.data.id,
        email: meResult.data.email,
        roles: ['customer'],
        firstName: meResult.data.firstName,
        lastName: meResult.data.lastName,
      };
    }

    userStore.user = user;
    if (role.kind === 'customer') await refreshCart();
    navigate('/welcome');
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Seo
        title="Stripe Checkout App (Go/Node, MUI/Tailwind)"
        description="Production Stripe checkout app for React. Storefront, cart, 3-step Stripe wizard, admin, RBAC, S3 uploads. Go or Node backend, MUI or Tailwind frontend."
        canonicalPath="/"
        jsonLd={combineJsonLd(
          websiteSchema(),
          organizationSchema(),
          softwareApplicationSchema({
            name: 'checkout-kit',
            description:
              'A complete production-grade Stripe checkout application for React. Pick your stack: Go + Gin or Node + Express backend, MUI or Tailwind frontend. Storefront, cart, three-step Stripe wizard, admin dashboard, RBAC engine, S3 image upload.',
            offers: [
              { name: 'Node Edition · Developer', priceUsd: 299, description: 'Single-developer license · 1 production deploy · 6 months of updates' },
              { name: 'Node Edition · Team', priceUsd: 699, description: 'Up to 5 developers · 3 production deploys · 12 months of updates' },
              { name: 'Node Edition · Extended', priceUsd: 1499, description: 'Unlimited developers · unlimited deploys · white-label · lifetime updates' },
              { name: 'Go Edition · Developer', priceUsd: 399, description: 'Single-developer license · 1 production deploy · 6 months of updates' },
              { name: 'Go Edition · Team', priceUsd: 899, description: 'Up to 5 developers · 3 production deploys · 12 months of updates' },
              { name: 'Go Edition · Extended', priceUsd: 1999, description: 'Unlimited developers · unlimited deploys · white-label · lifetime updates' },
            ],
          }),
          breadcrumbSchema([{ name: 'Home', path: '/' }]),
        )}
      />
      <PromoBar />
      <DemoBanner />

      {/* --- Top bar --- */}
      <Box
        sx={{
          px: { xs: 3, md: 6 },
          py: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <BrandMark size={36} withWordmark />
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <ThemeModeToggle />
          <Chip
            label="LIVE DEMO"
            size="small"
            sx={{
              bgcolor: theme.tokens.colors.successSoft,
              color: theme.tokens.colors.success,
              border: `1px solid ${theme.tokens.colors.success}33`,
            }}
          />
        </Stack>
      </Box>

      <InspectThisPage
        metadata={{
          title: 'Demo splash + one-click login',
          filePath: 'client/mui/src/features/auth/DemoSplashPage.tsx',
          lines: 290,
          summary:
            'Anonymous landing. One click on a role card calls the matching auth endpoint, swaps the token in via the axios interceptor, fetches the /me profile, hydrates the user store, and navigates to /welcome. No manual login form in the way.',
          features: [
            'Live-vs-mock provider toggle via VITE_PROVIDER (zero code change)',
            'BrandMark inline SVG (no asset round-trip)',
            'Three demo accounts seeded byte-for-byte against the BE',
            'Per-role pre-warm: customer triggers refreshCart() before navigate',
          ],
          stack: ['React 19', 'Valtio', 'MUI', '@dashforge/ui'],
          endpoints: [
            'POST /v1/auth/login',
            'POST /v1/auth/customer-login',
            'GET /v1/me',
            'GET /v1/customer/me',
            'GET /v1/cart',
          ],
        }}
      />

      {/* --- Hero --- */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 6 },
          textAlign: 'center',
          maxWidth: 1280,
          mx: 'auto',
          width: '100%',
        }}
      >
        <Chip
          label="✓ FREE UI DEMO · MOCK MODE, NO REAL CHARGES"
          size="small"
          sx={{
            mb: 3,
            bgcolor: theme.tokens.colors.successSoft,
            color: theme.tokens.colors.success,
            fontWeight: 800,
            letterSpacing: '0.04em',
            border: `1px solid ${theme.tokens.colors.success}33`,
            fontSize: '0.7rem',
          }}
        />
        <Typography
          variant="h1"
          sx={{
            mb: 2,
            fontSize: { xs: '2.25rem', md: '3.25rem' },
            background: theme.tokens.gradients.hero,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            maxWidth: 880,
          }}
        >
          A React + Stripe checkout UI. Try the whole flow as a real customer.
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: '1.125rem',
            maxWidth: 680,
            mb: 5,
            lineHeight: 1.6,
            '& strong': {
              color: 'text.primary',
              fontWeight: 700,
            },
          }}
        >
          This is the <strong>front-end</strong> of the Checkout Kit,
          running in <strong>mock mode</strong> — real UI, mock data,
          no backend and no real payments. The{' '}
          <strong>production app</strong> — Node/Go backend, signed
          Stripe webhooks, orders, field-level RBAC and an admin
          dashboard — is the paid kit at{' '}
          <Box
            component="a"
            href="https://dashforge-ui.com/starter-kits"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            dashforge-ui.com
          </Box>
          .
        </Typography>

        {/* --- Stacks strip: SEO + buyer orientation --- */}
        <Box
          sx={{
            mb: 5,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            The kit ships every stack — pick any combo at purchase
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}
          >
            {[
              { emoji: '🟦', label: 'Go + Gin', kind: 'backend' },
              { emoji: '🟩', label: 'Node + Express', kind: 'backend' },
              { emoji: '🎨', label: 'MUI', kind: 'frontend' },
              { emoji: '💨', label: 'Tailwind', kind: 'frontend' },
            ].map((s) => (
              <Box
                key={s.label}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.6,
                  borderRadius: theme.tokens.radius.pill + 'px',
                  border: `1px solid ${theme.tokens.colors.borderSubtle}`,
                  bgcolor: 'background.paper',
                  fontSize: '13px',
                }}
              >
                <Box component="span" sx={{ fontSize: '14px', lineHeight: 1 }}>
                  {s.emoji}
                </Box>
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 700,
                    fontSize: '13px',
                    color: 'text.primary',
                    lineHeight: 1,
                  }}
                >
                  {s.label}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '10.5px',
                    fontWeight: 600,
                    color: 'text.disabled',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    lineHeight: 1,
                    ml: 0.25,
                  }}
                >
                  {s.kind}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* --- 3 role cards --- */}
        <Box
          sx={{
            width: '100%',
            display: 'grid',
            gap: 2.5,
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            mb: 6,
          }}
        >
          {(Object.keys(DEMO_ROLES) as DemoRoleKey[]).map((key) => {
            const role = DEMO_ROLES[key];
            const accentColor = theme.palette[role.accent].main;
            const accentSoft =
              role.accent === 'primary'
                ? theme.tokens.colors.primarySoft
                : role.accent === 'secondary'
                  ? theme.tokens.colors.secondarySoft
                  : theme.tokens.colors.accentSoft;

            return (
              <Card
                key={key}
                sx={{
                  p: 3,
                  textAlign: 'left',
                  cursor: busy ? 'progress' : 'pointer',
                  opacity: busy && busy !== key ? 0.5 : 1,
                  '&:hover': {
                    transform: busy ? 'none' : 'translateY(-4px)',
                    boxShadow: theme.tokens.shadow.md,
                    borderColor: `${accentColor}55`,
                  },
                }}
                onClick={() => !busy && handleDemoLogin(key)}
              >
                <Stack spacing={2.5} sx={{ height: '100%' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: accentSoft,
                      color: accentColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '& svg': { fontSize: 28 },
                    }}
                  >
                    {role.icon}
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {role.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {role.tagline}
                    </Typography>
                  </Box>
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    {role.preview.map((line) => (
                      <Stack
                        key={line}
                        direction="row"
                        spacing={1.25}
                        sx={{ alignItems: 'center' }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: accentColor,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ fontWeight: 500 }}
                        >
                          {line}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Button
                    variant={key === 'customer' ? 'contained' : 'outlined'}
                    color={role.accent === 'warning' ? 'primary' : role.accent}
                    fullWidth
                    loading={busy === key}
                    disabled={busy !== null && busy !== key}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Try as {role.title}
                  </Button>
                </Stack>
              </Card>
            );
          })}
        </Box>

        {/* --- Tech stack chips --- */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 1,
            mb: 3,
          }}
        >
          {TECH_STACK.map((label) => (
            <Chip
              key={label}
              label={label}
              variant="outlined"
              size="small"
              sx={{
                bgcolor: 'background.paper',
                fontWeight: 500,
              }}
            />
          ))}
        </Stack>

        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ textAlign: 'center' }}
        >
          Prefer the long way?{' '}
          <RouterLink
            to="/customer-login"
            style={{ color: 'inherit', textDecoration: 'underline' }}
          >
            customer
          </RouterLink>{' '}
          ·{' '}
          <RouterLink
            to="/login"
            style={{ color: 'inherit', textDecoration: 'underline' }}
          >
            staff
          </RouterLink>
        </Typography>
      </Box>
    </Box>
  );
}
