import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Button } from '@dashforge/ui';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmptyRounded';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import ContentCopyIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckIcon from '@mui/icons-material/CheckRounded';
import { admin_get_order_by_id } from '@api/orders/orders.service';
import type { Order, OrderStatus } from '@api/orders/orders.types';
import { InspectThisPage } from '../../../components/demo/InspectThisPage';
import { OrderItemsList } from '../../orders/OrderItemsList';
import { OrderStatusChip } from '../../orders/OrderStatusChip';
import { formatDateTime } from '../../orders/format';

/**
 * Staff view of a single order. Identical UX to the customer
 * detail page with two diffs:
 *
 *   - Uses the admin endpoint (no ownership scoping)
 *   - Surfaces the customerId in the payment-details sidebar
 *
 * Read-only. Order state transitions only via the Stripe webhook
 * on the BE side.
 */
export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Missing order id in URL');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    admin_get_order_by_id(id).then((r) => {
      if (cancelled) return;
      setLoading(false);
      if (r.error) {
        setError(r.error.message);
        return;
      }
      setOrder(r.data);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width={180} height={36} />
        <Skeleton variant="rounded" height={140} />
        <Skeleton variant="rounded" height={320} />
      </Stack>
    );
  }

  if (error || !order) {
    return (
      <Stack spacing={2}>
        <Button
          onClick={() => navigate('/admin/orders')}
          startIcon={<ArrowBackIcon />}
          variant="text"
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to all orders
        </Button>
        <Alert severity="error">{error ?? 'Order not found'}</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Button
        onClick={() => navigate('/admin/orders')}
        startIcon={<ArrowBackIcon />}
        variant="text"
        sx={{ alignSelf: 'flex-start' }}
      >
        Back to all orders
      </Button>

      <StatusHero order={order} />

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '1fr 340px' },
          alignItems: 'start',
        }}
      >
        <Card sx={{ p: 0 }}>
          <Box
            sx={{
              p: 2.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="overline" color="text.secondary">
              Items in this order
            </Typography>
          </Box>
          <OrderItemsList order={order} />
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Typography variant="overline" color="text.secondary">
              Payment details
            </Typography>
            <Detail label="Customer" value={order.customerId} copyable />
            <Detail label="Currency" value={order.currency.toUpperCase()} />
            <Detail
              label="Placed"
              value={formatDateTime(order.createdAt)}
            />
            <Detail
              label="Last updated"
              value={formatDateTime(order.updatedAt)}
            />
            {order.stripePaymentIntentId && (
              <Detail
                label="Payment intent"
                value={order.stripePaymentIntentId}
                copyable
              />
            )}
            {order.stripeChargeId && (
              <Detail
                label="Charge"
                value={order.stripeChargeId}
                copyable
              />
            )}
            {order.failureReason && (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block' }}
                >
                  Failure reason
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: theme.tokens.colors.danger }}
                >
                  {order.failureReason}
                </Typography>
              </Box>
            )}
          </Stack>
        </Card>
      </Box>

      <InspectThisPage
        metadata={{
          title: 'Admin order detail',
          filePath:
            'client/mui/src/features/admin/orders/AdminOrderDetailPage.tsx',
          lines: 230,
          summary:
            "Admin view of any order. No ownership filter (vs the customer detail). Customer id is surfaced for audit and search. Read-only: state transitions happen via the Stripe webhook on the BE, never via a click here.",
          features: [
            'Same StatusHero as the customer view (single visual language)',
            'Customer id with copy-to-clipboard',
            'Stripe ids (PI + charge) with copy-to-clipboard',
            'Failure reason surfaced for failed orders',
          ],
          stack: ['React 19', 'MUI'],
          endpoints: ['GET /v1/admin/orders/:id'],
        }}
      />
    </Stack>
  );
}

/** Mirrors customer OrderDetailPage.StatusHero — shared visual */
function StatusHero({ order }: { order: Order }) {
  const theme = useTheme();

  const config: Record<
    OrderStatus,
    {
      icon: React.ReactNode;
      glyphColor: string;
      glyphBg: string;
      title: string;
      sub: string;
      animate?: boolean;
    }
  > = {
    paid: {
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      glyphColor: theme.tokens.colors.success,
      glyphBg: theme.tokens.colors.successSoft,
      title: 'Paid',
      sub: 'Stripe confirmed the payment. The charge has been captured.',
      animate: true,
    },
    pending_payment: {
      icon: <HourglassEmptyIcon sx={{ fontSize: 40 }} />,
      glyphColor: theme.tokens.colors.primary,
      glyphBg: theme.tokens.colors.primarySoft,
      title: 'Pending payment',
      sub: 'Waiting on the Stripe webhook to confirm the charge.',
    },
    failed: {
      icon: <ErrorOutlineIcon sx={{ fontSize: 40 }} />,
      glyphColor: theme.tokens.colors.danger,
      glyphBg: theme.tokens.colors.dangerSoft,
      title: 'Payment failed',
      sub: order.failureReason ?? 'The card was declined.',
    },
    refunded: {
      icon: <RefreshIcon sx={{ fontSize: 40 }} />,
      glyphColor: theme.tokens.colors.warning,
      glyphBg: theme.tokens.colors.warningSoft,
      title: 'Refunded',
      sub: 'Original charge returned via Stripe. Webhook landed here.',
    },
  };

  const c = config[order.status];

  return (
    <Card sx={{ p: { xs: 3, md: 4 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2.5}
          sx={{ alignItems: { sm: 'center' } }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: c.glyphBg,
              color: c.glyphColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              animation: c.animate
                ? 'adminOrderHeroPop .55s cubic-bezier(.16,1.2,.4,1) both'
                : undefined,
              '@keyframes adminOrderHeroPop': {
                '0%': { transform: 'scale(0.6)', opacity: 0 },
                '100%': { transform: 'scale(1)', opacity: 1 },
              },
            }}
          >
            {c.icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {c.title}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 460 }}
            >
              {c.sub}
            </Typography>
          </Box>
        </Stack>
        <Box sx={{ flexShrink: 0 }}>
          <OrderStatusChip status={order.status} size="medium" />
        </Box>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
      >
        Order id: {order.id}
      </Typography>
    </Card>
  );
}

function Detail({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  }
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: 0.25 }}
      >
        {label}
      </Typography>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ alignItems: 'center', minHeight: 28 }}
      >
        <Typography
          variant="body2"
          sx={{
            fontFamily: copyable ? 'monospace' : undefined,
            fontSize: copyable ? '0.78rem' : undefined,
            wordBreak: 'break-all',
            flex: 1,
          }}
        >
          {value}
        </Typography>
        {copyable && (
          <Tooltip title={copied ? 'Copied' : 'Copy'} placement="top">
            <IconButton size="small" onClick={copy}>
              {copied ? (
                <CheckIcon fontSize="small" color="success" />
              ) : (
                <ContentCopyIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
}
