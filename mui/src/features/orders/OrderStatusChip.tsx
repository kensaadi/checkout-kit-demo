import { Chip, type ChipProps } from '@mui/material';
import type { OrderStatus } from '@api/orders/orders.types';

/**
 * Visual chip for the four order statuses. Single source of
 * truth for the status → label / color mapping so the customer
 * detail, the customer list, the admin detail, and the admin
 * list all render identical chips.
 *
 * Changing a label or color here propagates everywhere — never
 * hand-style a status badge elsewhere in the codebase.
 */
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: ChipProps['color']; variant: ChipProps['variant'] }
> = {
  pending_payment: {
    label: 'Pending payment',
    color: 'default',
    variant: 'outlined',
  },
  paid: { label: 'Paid', color: 'success', variant: 'filled' },
  failed: { label: 'Failed', color: 'error', variant: 'filled' },
  refunded: { label: 'Refunded', color: 'warning', variant: 'outlined' },
};

export function OrderStatusChip({
  status,
  size = 'small',
}: {
  status: OrderStatus;
  size?: ChipProps['size'];
}) {
  const config = STATUS_CONFIG[status];
  return (
    <Chip
      label={config.label}
      color={config.color}
      variant={config.variant}
      size={size}
    />
  );
}
