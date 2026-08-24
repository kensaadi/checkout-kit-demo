import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
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
import { Button } from '@dashforge/ui';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import { useNavigate } from 'react-router-dom';
import { EmptyOrdersIllustration } from '../../components/illustrations';
import { list_my_orders } from '@api/orders/orders.service';
import type { OrderList } from '@api/orders/orders.types';
import { OrderStatusChip } from './OrderStatusChip';
import { formatDateTime, formatPrice, shortenId } from './format';

const PER_PAGE = 20;

/**
 * Customer-scoped order history. Paginated table; click on a
 * row → /orders/:id detail.
 *
 * Empty state offers a CTA back to the shop so a brand-new
 * customer has a non-dead-end.
 */
export function OrdersListPage() {
  const [page, setPage] = useState(1);
  const [list, setList] = useState<OrderList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    list_my_orders({ page, perPage: PER_PAGE }).then((r) => {
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

  if (error) return <Alert severity="error">{error}</Alert>;

  if (loading && !list) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width={240} height={48} />
        <Skeleton variant="rounded" height={320} />
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
              Nothing here yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              The orders you place will show up right here.
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => navigate('/shop')}>
            Go shopping
          </Button>
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
          Your orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {list.meta.total} order{list.meta.total === 1 ? '' : 's'} total
        </Typography>
      </Box>

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Placed</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {list.data.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  onClick={() => navigate(`/orders/${order.id}`)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'background-color .15s ease',
                  }}
                >
                  <TableCell
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    {shortenId(order.id)}
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
    </Stack>
  );
}
