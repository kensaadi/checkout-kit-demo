import { Box, IconButton, Stack, Typography } from '@mui/material';
import { Button } from '@dashforge/ui';
import { Can } from '@dashforge/rbac';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useState } from 'react';
import { useSnackbar } from '@dashforge/ui';
import { add_item } from '@api/cart/cart.service';
import { cartStore } from '@shared/store/cart.store';
import { useCall } from '@shared/hooks/useCall';

/**
 * Quantity stepper + "Add to cart" pair for a single product
 * detail page. Renders only for users with `cart:create`
 * permission — staff browsing the storefront see nothing here.
 *
 * On success:
 *   - Cart store updated from the response (no extra GET)
 *   - Snackbar confirmation
 *   - Quantity reset to 1 so a quick second add doesn't compound
 */
export function AddToCartButton({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1);
  const { success } = useSnackbar();

  const { call: callAdd, loading } = useCall(add_item, {
    onSuccess: (cart) => {
      cartStore.cart = cart;
      success(
        quantity === 1
          ? '1 item added to cart'
          : `${quantity} items added to cart`,
      );
      setQuantity(1);
    },
  });

  return (
    <Can action="create" resource="cart" fallback={null}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' } }}
      >
        <Stack
          direction="row"
          spacing={0}
          sx={{
            alignItems: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            px: 0.5,
            alignSelf: { xs: 'flex-start', sm: 'auto' },
          }}
        >
          <IconButton
            size="small"
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || loading}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <Box
            sx={{
              minWidth: 32,
              textAlign: 'center',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <Typography variant="body1">{quantity}</Typography>
          </Box>
          <IconButton
            size="small"
            aria-label="Increase quantity"
            disabled={loading}
            onClick={() => setQuantity((q) => q + 1)}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Button
          variant="contained"
          size="large"
          loading={loading}
          onClick={() => callAdd({ productId, quantity })}
          sx={{ flex: { sm: 1 } }}
        >
          Add to cart
        </Button>
      </Stack>
    </Can>
  );
}
