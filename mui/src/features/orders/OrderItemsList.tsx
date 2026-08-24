import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import type { Order } from '@api/orders/orders.types';
import { formatPrice } from './format';

/**
 * Renders the line items of an order. Used by both the customer
 * detail page and the admin detail page — same shape, same UX.
 *
 * Items are the IMMUTABLE snapshot taken at checkout time.
 * `name`, `slug`, `price` reflect the catalog at the moment of
 * payment, not the current product state. Re-pricing happens
 * only on the live cart (re-read on each view).
 */
export function OrderItemsList({ order }: { order: Order }) {
  return (
    <Box>
      <List disablePadding>
        {order.items.map((item) => (
          <ListItem
            key={item.productId}
            sx={{
              py: 1.75,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ListItemText
              primary={item.name}
              // `secondary` defaults to a <Typography component="p">; our
              // content is a Stack (<div>) + Typographies (<p>), which is
              // invalid nesting inside a <p>. Render the secondary wrapper
              // as a <div> so the block content is legal HTML.
              slotProps={{ secondary: { component: 'div' } }}
              secondary={
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {item.quantity} ×{' '}
                    {formatPrice(item.price, order.currency)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {item.slug}
                  </Typography>
                </Stack>
              }
            />
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                minWidth: 80,
                textAlign: 'right',
              }}
            >
              {formatPrice(item.lineTotal, order.currency)}
            </Typography>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
          px: 2,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Total
        </Typography>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
        >
          {formatPrice(order.itemsTotal, order.currency)}
        </Typography>
      </Box>
    </Box>
  );
}
