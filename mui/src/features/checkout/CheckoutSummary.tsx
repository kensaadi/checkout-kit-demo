import {
  Box,
  Card,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useCart } from '@shared/store/cart.store';
import { formatPrice } from '../cart/format';

/**
 * Read-only cart recap shown alongside the checkout wizard on
 * desktop. Reads from `cartStore` directly so any cart mutation
 * from elsewhere (rare during checkout, but possible — e.g. a
 * second tab) reflects instantly.
 *
 * Mobile (xs/sm) hides this — the user sees the wizard full-width.
 */
export function CheckoutSummary() {
  const { cart } = useCart();
  const theme = useTheme();

  if (!cart) return null;

  return (
    <Card sx={{ p: 3, position: { md: 'sticky' }, top: { md: 24 } }}>
      <Stack spacing={2.5}>
        <Typography variant="overline" color="text.secondary">
          Order summary
        </Typography>

        <Stack spacing={1.5}>
          {cart.items.map((item) => (
            <Stack
              key={item.productId}
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center' }}
            >
              <Box
                component={item.coverUrl ? 'img' : 'div'}
                src={item.coverUrl ?? undefined}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: theme.tokens.radius.sm + 'px',
                  bgcolor: theme.tokens.colors.surfaceMuted,
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600 }}
                  noWrap
                  title={item.name}
                >
                  {item.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Qty {item.quantity} ·{' '}
                  {formatPrice(item.price, cart.currency)}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                }}
              >
                {formatPrice(item.lineTotal, cart.currency)}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Divider />

        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
        >
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            Total
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              color: theme.tokens.colors.money,
            }}
          >
            {formatPrice(cart.itemsTotal, cart.currency)}
          </Typography>
        </Stack>

        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ textAlign: 'center', display: 'block' }}
        >
          🔒 Stripe-secured · cancel anytime
        </Typography>
      </Stack>
    </Card>
  );
}
