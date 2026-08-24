import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  Chip,
  Pagination,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import { useNavigate } from 'react-router-dom';
import { EmptyOrdersIllustration } from '../../../components/illustrations';
import { admin_list_orders } from '@api/orders/orders.service';
import type { OrderList, OrderStatus } from '@api/orders/orders.types';
import { InspectThisPage } from '../../../components/demo/InspectThisPage';
import { OrderStatusChip } from '../../orders/OrderStatusChip';
import {
  formatDateTime,
  formatPrice,
  shortenId,
} from '../../orders/format';

const PER_PAGE = 20;

const STATUS_FILTERS: { id: 'all' | OrderStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending_payment', label: 'Pending' },
  { id: 'paid', label: 'Paid' },
  { id: 'failed', label: 'Failed' },
  { id: 'refunded', label: 'Refunded' },
];

/**
 * Staff (admin + sales) view of ALL orders, paginated. Identical
 * to the customer list with one extra column (Customer id) and a
 * client-side status filter row above the table.
 *
 * Mutations are intentionally absent — orders are mutated only
 * by the Stripe webhook on the BE side, never by an admin click.
 * If a refund is needed, an admin issues it in Stripe; the
 * webhook lands the state change here.
 */
export function AdminOrdersListPage() {
  const [page, setPage] = useState(1);
  const [list, setList] = useState<OrderList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]['id']>('all');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    admin_list_orders({ page, perPage: PER_PAGE }).then((r) => {
      if (cancelled) return;
      setLoading(false);
      if (r.error) {
        setError(r.error.message);
        return;
      }
      setList(r.data);
    });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const filtered = useMemo(() => {
    if (!list) return [];
    if (statusFilter === 'all') return list.data;
    return list.data.filter((o) => o.status === statusFilter);
  }, [list, statusFilter]);

  if (error) return <Alert severity="error">{error}</Alert>;

  if (loading && !list) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width={220} height={48} />
        <Skeleton variant="rounded" height={48} />
        <Skeleton variant="rounded" height={400} />
      </Stack>
    );
  }

  if (!list || list.data.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 6, md: 10 },
        }}
      >
        <Stack
          spacing={3}
          sx={{
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: 420,
          }}
        >
          <EmptyOrdersIllustration size={200} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              No orders yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              The moment a customer checks out, it shows up here.
              Stripe webhooks flip statuses in real time.
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  }

  const totalPages = Math.max(
    1,
    Math.ceil(list.meta.total / list.meta.perPage),
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ mb: 0.5 }}>
          All orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {list.meta.total} order{list.meta.total === 1 ? '' : 's'} across
          all customers
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        sx={{ flexWrap: 'wrap', gap: 1 }}
      >
        {STATUS_FILTERS.map((f) => (
          <Chip
            key={f.id}
            label={f.label}
            onClick={() => setStatusFilter(f.id)}
            sx={{
              fontWeight: 600,
              cursor: 'pointer',
              bgcolor:
                statusFilter === f.id
                  ? theme.tokens.colors.primary
                  : theme.tokens.colors.surface,
              color:
                statusFilter === f.id
                  ? theme.tokens.colors.textInverse
                  : theme.tokens.colors.textPrimary,
              border:
                statusFilter === f.id
                  ? 'none'
                  : `1px solid ${theme.tokens.colors.borderSubtle}`,
              '&:hover': {
                bgcolor:
                  statusFilter === f.id
                    ? theme.tokens.colors.primaryHover
                    : theme.tokens.colors.surfaceMuted,
              },
            }}
          />
        ))}
      </Stack>

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Placed</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 600,
                    }}
                  >
                    {shortenId(order.id)}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: 'monospace',
                      color: 'text.secondary',
                    }}
                  >
                    {shortenId(order.customerId)}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {formatDateTime(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusChip status={order.status} />
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 600,
                    }}
                  >
                    {formatPrice(order.itemsTotal, order.currency)}
                  </TableCell>
                  <TableCell align="right">
                    <KeyboardArrowRightIcon
                      sx={{ color: theme.tokens.colors.textMuted }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_e, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      <InspectThisPage
        metadata={{
          title: 'Admin orders list',
          filePath:
            'client/mui/src/features/admin/orders/AdminOrdersListPage.tsx',
          lines: 280,
          summary:
            'Read-only view of every order across all customers. No mutation actions by design: orders transition only via the Stripe webhook. A refund issued in Stripe Dashboard lands here automatically as a status flip.',
          features: [
            'Client-side status filter chips (all / pending / paid / failed / refunded)',
            'Customer id column (admin-only — customer view hides it)',
            'Skeleton table loading + branded empty state',
            'Same OrderStatusChip used in the customer list (single source of truth)',
          ],
          stack: ['React 19', 'MUI'],
          endpoints: ['GET /v1/admin/orders?page=N&perPage=20'],
        }}
      />
    </Stack>
  );
}
