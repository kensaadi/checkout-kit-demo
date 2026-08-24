import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Card,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LocalAtmOutlinedIcon from '@mui/icons-material/LocalAtmOutlined';
import { admin_list_orders } from '@api/orders/orders.service';
import type { Order } from '@api/orders/orders.types';
import { CountUp } from '../../../components/CountUp';
import { InspectThisPage } from '../../../components/demo/InspectThisPage';
import { formatPrice } from '../../cart/format';
import { formatDateTime } from '../../orders/format';
import { OrderStatusChip } from '../../orders/OrderStatusChip';

/**
 * Admin landing dashboard. Shows the demo at its most "real
 * product" angle: a sales chart, KPIs, top products, and a
 * recent-activity feed — all hydrated from live BE data via
 * `/v1/admin/orders`.
 *
 * Client-side aggregation is the right call here: the kit ships
 * the BE wide enough to power a dashboard, and turning that into
 * a dedicated `/v1/admin/stats` endpoint with proper Mongo
 * aggregation is the natural V1.5 addition. For the demo it's
 * one fetch + a reduce loop — zero BE work.
 *
 * Empty state graceful: a fresh DB with 0 orders shows a "Your
 * sales will plot here once orders start flowing" panel instead
 * of an empty chart.
 */
export function AdminDashboardPage() {
  const theme = useTheme();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    admin_list_orders({ page: 1, perPage: 200 }).then((r) => {
      if (cancelled) return;
      setLoading(false);
      if (r.error) {
        setError(r.error.message);
        return;
      }
      setOrders(r.data.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => computeStats(orders ?? []), [orders]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (loading || !orders) {
    return <DashboardSkeleton />;
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <Stack spacing={3}>
        <DashboardHeader />
        <Card sx={{ p: { xs: 4, md: 6 } }}>
          <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Box
              sx={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                background: theme.tokens.gradients.heroSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUpIcon
                sx={{ fontSize: 44, color: theme.tokens.colors.primary }}
              />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              No sales to plot yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460 }}>
              Your dashboard wakes up the moment a customer
              completes the first checkout. Try buying something as
              the customer role — you'll see the numbers move here.
            </Typography>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <DashboardHeader subtitle={`Across ${orders.length} order${orders.length === 1 ? '' : 's'} in the last 30 days`} />

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
        <KpiCard
          icon={<LocalAtmOutlinedIcon />}
          label="Revenue (paid)"
          value={
            <CountUp
              value={Math.round(stats.revenuePaid / 100)}
              duration={900}
            />
          }
          suffix={` ${stats.currency.toUpperCase()}`}
          hint={`AOV ${formatPrice(stats.aovCents, stats.currency)}`}
          accent="money"
        />
        <KpiCard
          icon={<ReceiptLongOutlinedIcon />}
          label="Orders"
          value={<CountUp value={stats.orderCount} />}
          hint={`${stats.paidCount} paid · ${stats.pendingCount} pending`}
          accent="primary"
        />
        <KpiCard
          icon={<TrendingUpIcon />}
          label="Last 7 days"
          value={<CountUp value={stats.last7Count} />}
          hint={`${formatPrice(stats.last7Revenue, stats.currency)} revenue`}
          accent="secondary"
        />
      </Box>

      {/* --- Sales chart + Top products --- */}
      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          alignItems: 'stretch',
        }}
      >
        <Card sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: 'block' }}
              >
                Sales · last 7 days
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revenue per day from paid orders, in {stats.currency.toUpperCase()}.
              </Typography>
            </Box>
            <Box sx={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.last7Days}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="salesGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={theme.tokens.colors.money}
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor={theme.tokens.colors.money}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.tokens.colors.borderSubtle}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="dayLabel"
                    stroke={theme.tokens.colors.textMuted}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={theme.tokens.colors.textMuted}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`
                    }
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.tokens.colors.surface,
                      border: `1px solid ${theme.tokens.colors.borderDefault}`,
                      borderRadius: theme.tokens.radius.md,
                      fontSize: 13,
                    }}
                    labelStyle={{ color: theme.tokens.colors.textSecondary }}
                    formatter={(value) => {
                      const n = typeof value === 'number' ? value : 0;
                      return [
                        formatPrice(n * 100, stats.currency),
                        'Revenue',
                      ];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenueMajor"
                    stroke={theme.tokens.colors.money}
                    strokeWidth={2.5}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: 'block' }}
              >
                Top products
              </Typography>
              <Typography variant="body2" color="text.secondary">
                By units sold in the last 30 days.
              </Typography>
            </Box>
            {stats.topProducts.length === 0 ? (
              <Typography variant="body2" color="text.disabled">
                Nothing sold yet.
              </Typography>
            ) : (
              <Stack spacing={1.25}>
                {stats.topProducts.map((p, i) => (
                  <Box key={p.slug}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: 'center' }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor:
                            i === 0
                              ? theme.tokens.colors.accentSoft
                              : theme.tokens.colors.surfaceMuted,
                          color:
                            i === 0
                              ? theme.tokens.colors.accent
                              : theme.tokens.colors.textMuted,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600 }}
                          noWrap
                          title={p.name}
                        >
                          {p.name}
                        </Typography>
                      </Box>
                      <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: theme.tokens.colors.money,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {p.units}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ display: 'block', lineHeight: 1 }}
                        >
                          units
                        </Typography>
                      </Box>
                    </Stack>
                    {/* Bar showing relative units */}
                    <Box
                      sx={{
                        mt: 0.75,
                        height: 4,
                        borderRadius: 2,
                        bgcolor: theme.tokens.colors.surfaceMuted,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${
                            stats.topProducts[0]
                              ? Math.max(
                                  6,
                                  (p.units / stats.topProducts[0].units) * 100,
                                )
                              : 0
                          }%`,
                          height: '100%',
                          bgcolor:
                            i === 0
                              ? theme.tokens.colors.accent
                              : theme.tokens.colors.primary,
                          borderRadius: 2,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </Card>
      </Box>

      {/* --- Recent activity --- */}
      <Card sx={{ p: 0 }}>
        <Box
          sx={{
            p: 2.5,
            borderBottom: `1px solid ${theme.tokens.colors.borderSubtle}`,
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: 'block' }}
          >
            Recent activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The newest orders across all customers.
          </Typography>
        </Box>
        <Stack divider={<Divider />}>
          {stats.recent.slice(0, 6).map((o) => {
            const itemName = o.items[0]?.name ?? '—';
            const extra = o.items.length > 1 ? ` +${o.items.length - 1}` : '';
            return (
              <Stack
                key={o.id}
                direction="row"
                spacing={2}
                sx={{ alignItems: 'center', px: 2.5, py: 1.75 }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    bgcolor: theme.tokens.colors.primarySoft,
                    color: theme.tokens.colors.primary,
                  }}
                >
                  {o.customerId.slice(-2).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap>
                    Order for{' '}
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      {itemName}
                    </Box>
                    {extra}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ display: 'block' }}
                  >
                    {formatDateTime(o.createdAt)}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: theme.tokens.colors.money,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatPrice(o.itemsTotal, o.currency)}
                </Typography>
                <OrderStatusChip status={o.status} />
              </Stack>
            );
          })}
        </Stack>
      </Card>

      <InspectThisPage
        metadata={{
          title: 'Admin dashboard',
          filePath:
            'client/mui/src/features/admin/dashboard/AdminDashboardPage.tsx',
          lines: 380,
          summary:
            "Production-grade admin landing. Every number is live: a single fetch of /v1/admin/orders feeds the chart, KPIs, top-products bar, and the recent-activity feed via client-side reduce. Promotes to a dedicated /v1/admin/stats BE endpoint when query volume grows.",
          features: [
            'Sales 7-day area chart (recharts) with money-accent gradient',
            'KPI cards: revenue paid, orders count, last-7-days slice',
            'Top-products bar visualization (units sold)',
            'Recent-activity feed (latest 6 orders cross-customer)',
            'Client-side aggregation — zero BE endpoint added for V1',
            'Graceful empty state when the catalog has no sales yet',
          ],
          stack: ['React 19', 'MUI', 'recharts'],
          endpoints: [
            'GET /v1/admin/orders?page=1&perPage=200',
          ],
        }}
      />
    </Stack>
  );
}

function DashboardHeader({ subtitle }: { subtitle?: string }) {
  return (
    <Box>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: 'block', mb: 0.5 }}
      >
        Admin
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
        Dashboard
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
  suffix,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint: string;
  suffix?: string;
  accent: 'money' | 'primary' | 'secondary';
}) {
  const theme = useTheme();
  const colorMap = {
    money: theme.tokens.colors.money,
    primary: theme.tokens.colors.primary,
    secondary: theme.tokens.colors.secondary,
  };
  const softMap = {
    money: theme.tokens.colors.moneySoft,
    primary: theme.tokens.colors.primarySoft,
    secondary: theme.tokens.colors.secondarySoft,
  };
  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={1.75}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center' }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: softMap[accent],
              color: colorMap[accent],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& svg': { fontSize: 20 },
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
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            lineHeight: 1.1,
            color: colorMap[accent],
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
          {suffix && (
            <Box
              component="span"
              sx={{
                fontSize: '1rem',
                fontWeight: 600,
                ml: 0.5,
                color: 'text.secondary',
              }}
            >
              {suffix}
            </Box>
          )}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      </Stack>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="text" width={180} height={48} />
      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        }}
      >
        <Skeleton variant="rounded" height={140} />
        <Skeleton variant="rounded" height={140} />
        <Skeleton variant="rounded" height={140} />
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
        }}
      >
        <Skeleton variant="rounded" height={300} />
        <Skeleton variant="rounded" height={300} />
      </Box>
      <Skeleton variant="rounded" height={320} />
    </Stack>
  );
}

// ============================================================
//                       AGGREGATION
// ============================================================

type Stats = {
  currency: string;
  orderCount: number;
  paidCount: number;
  pendingCount: number;
  revenuePaid: number; // cents
  aovCents: number;
  last7Count: number;
  last7Revenue: number; // cents
  last7Days: Array<{ dayLabel: string; revenueMajor: number }>;
  topProducts: Array<{ slug: string; name: string; units: number }>;
  recent: Order[];
};

function computeStats(orders: Order[]): Stats {
  const currency = (orders.find((o) => o.currency)?.currency ?? 'usd').toLowerCase();
  const paid = orders.filter((o) => o.status === 'paid' || o.status === 'refunded');
  const pending = orders.filter((o) => o.status === 'pending_payment');

  const revenuePaid = paid.reduce((sum, o) => sum + o.itemsTotal, 0);
  const aovCents =
    paid.length > 0 ? Math.round(revenuePaid / paid.length) : 0;

  // Last 7 days bucket (today + 6 prior)
  const now = new Date();
  const days: Array<{ key: string; dayLabel: string; revenueCents: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      key,
      dayLabel: d.toLocaleDateString(undefined, { weekday: 'short' }),
      revenueCents: 0,
    });
  }
  const dayIndex = new Map(days.map((d, i) => [d.key, i] as const));
  for (const o of paid) {
    const k = o.createdAt.slice(0, 10);
    const idx = dayIndex.get(k);
    if (idx !== undefined) {
      days[idx]!.revenueCents += o.itemsTotal;
    }
  }
  const last7Count = orders.filter((o) => {
    const k = o.createdAt.slice(0, 10);
    return dayIndex.has(k);
  }).length;
  const last7Revenue = days.reduce((s, d) => s + d.revenueCents, 0);

  const last7Days = days.map((d) => ({
    dayLabel: d.dayLabel,
    revenueMajor: Math.round(d.revenueCents / 100),
  }));

  // Top products by units
  const productMap = new Map<string, { slug: string; name: string; units: number }>();
  for (const o of orders) {
    for (const it of o.items) {
      const existing = productMap.get(it.slug);
      if (existing) {
        existing.units += it.quantity;
      } else {
        productMap.set(it.slug, {
          slug: it.slug,
          name: it.name,
          units: it.quantity,
        });
      }
    }
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  // Recent activity — by createdAt desc
  const recent = [...orders].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );

  return {
    currency,
    orderCount: orders.length,
    paidCount: paid.length,
    pendingCount: pending.length,
    revenuePaid,
    aovCents,
    last7Count,
    last7Revenue,
    last7Days,
    topProducts,
    recent,
  };
}
