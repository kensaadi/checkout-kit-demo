import { Box, Card, Stack, Typography } from '@mui/material';
import type { Order } from '@api/orders/orders.types';
import { OrderStatusChip } from './OrderStatusChip';
import { formatDateTime } from './format';

/**
 * Header card for an order detail page. Renders order id,
 * status chip, currency, key Stripe ids, and timestamps.
 *
 * `showCustomer` adds the customerId — used by the admin view
 * only. The customer view of their own order is already scoped
 * (the BE only returns the customer's own orders), so showing
 * the customerId there would be redundant.
 */
export function OrderSummaryCard({
  order,
  showCustomer = false,
}: {
  order: Order;
  showCustomer?: boolean;
}) {
  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
          }}
        >
          <Box>
            <Typography variant="overline" color="text.secondary">
              Order
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
            >
              {order.id}
            </Typography>
          </Box>
          <OrderStatusChip status={order.status} size="medium" />
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            rowGap: 1.5,
            columnGap: 3,
          }}
        >
          {showCustomer && (
            <SummaryField label="Customer">
              <code>{order.customerId}</code>
            </SummaryField>
          )}
          <SummaryField label="Currency">
            {order.currency.toUpperCase()}
          </SummaryField>
          <SummaryField label="Placed">
            {formatDateTime(order.createdAt)}
          </SummaryField>
          <SummaryField label="Last updated">
            {formatDateTime(order.updatedAt)}
          </SummaryField>
          {order.stripePaymentIntentId && (
            <SummaryField label="Payment intent">
              <code>{order.stripePaymentIntentId}</code>
            </SummaryField>
          )}
          {order.stripeChargeId && (
            <SummaryField label="Charge">
              <code>{order.stripeChargeId}</code>
            </SummaryField>
          )}
          {order.failureReason && (
            <SummaryField label="Failure reason">
              <Typography variant="body2" color="error">
                {order.failureReason}
              </Typography>
            </SummaryField>
          )}
        </Box>
      </Stack>
    </Card>
  );
}

function SummaryField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block' }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
        {children}
      </Typography>
    </Box>
  );
}
