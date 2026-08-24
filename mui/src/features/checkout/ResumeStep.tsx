import {
  Box,
  Card,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { Button } from '@dashforge/ui';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@shared/store/cart.store';
import { formatPrice } from '../cart/format';

/**
 * Step 1 of the checkout wizard. Re-displays the cart so the
 * customer confirms what they're about to buy before entering
 * payment details. Empty cart → bail out to /cart.
 */
export function ResumeStep({ onContinue }: { onContinue: () => void }) {
  const { cart } = useCart();
  const navigate = useNavigate();

  if (!cart || cart.items.length === 0) {
    return (
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="h6">Your cart is empty</Typography>
        <Button variant="contained" onClick={() => navigate('/cart')}>
          Back to cart
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Review your order
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You're about to pay {formatPrice(cart.itemsTotal, cart.currency)}{' '}
          for {cart.items.length} item
          {cart.items.length === 1 ? '' : 's'}.
        </Typography>
      </Box>

      <Card>
        <List disablePadding>
          {cart.items.map((item) => (
            <ListItem
              key={item.productId}
              sx={{
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <ListItemText
                primary={item.name}
                secondary={`${item.quantity} × ${formatPrice(item.price, cart.currency)}`}
              />
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
              >
                {formatPrice(item.lineTotal, cart.currency)}
              </Typography>
            </ListItem>
          ))}
        </List>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2.5,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Total
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
          >
            {formatPrice(cart.itemsTotal, cart.currency)}
          </Typography>
        </Box>
      </Card>

      <Divider />

      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
        <Button variant="text" onClick={() => navigate('/cart')}>
          Edit cart
        </Button>
        <Button variant="contained" size="large" onClick={onContinue}>
          Continue to payment
        </Button>
      </Stack>
    </Stack>
  );
}
