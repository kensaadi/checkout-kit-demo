import {
  Avatar,
  Box,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/DeleteOutlineRounded';
import { remove_item, update_item } from '@api/cart/cart.service';
import type { CartItemView } from '@api/cart/cart.types';
import { cartStore } from '@shared/store/cart.store';
import { useCall } from '@shared/hooks/useCall';
import { formatPrice } from './format';

/**
 * One cart line. Three actions:
 *
 *   - "−"  → if quantity > 1, decrement via `update_item`; if 1,
 *            remove the line entirely (UX shortcut so the user
 *            isn't stuck on 1)
 *   - "+"  → increment quantity by 1 via `update_item`
 *   - 🗑  → remove the line via `remove_item`
 *
 * All three mutations sync the cart store from the response
 * directly — no extra GET round trip. The badge in TopBar updates
 * reactively because it reads `cartStore.cart` via useSnapshot.
 */
export function CartItemRow({ item }: { item: CartItemView }) {
  const { call: callUpdate, loading: updating } = useCall(update_item, {
    onSuccess: (cart) => {
      cartStore.cart = cart;
    },
  });
  const { call: callRemove, loading: removing } = useCall(remove_item, {
    onSuccess: (cart) => {
      cartStore.cart = cart;
    },
  });

  const busy = updating || removing;

  function handleDecrement() {
    if (item.quantity <= 1) {
      callRemove(item.productId);
    } else {
      callUpdate(item.productId, { quantity: item.quantity - 1 });
    }
  }

  function handleIncrement() {
    callUpdate(item.productId, { quantity: item.quantity + 1 });
  }

  function handleRemove() {
    callRemove(item.productId);
  }

  return (
    <ListItem
      sx={{
        gap: 2,
        py: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
      secondaryAction={
        <IconButton
          edge="end"
          aria-label={`Remove ${item.name}`}
          onClick={handleRemove}
          disabled={busy}
        >
          <DeleteIcon />
        </IconButton>
      }
    >
      <ListItemAvatar>
        <Avatar
          variant="rounded"
          src={item.coverUrl ?? undefined}
          alt={item.name}
          sx={{ width: 56, height: 56, bgcolor: 'action.hover' }}
        >
          {item.name.charAt(0)}
        </Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={item.name}
        // Plain string secondary — ListItemText wraps it in its own
        // <Typography component="p"> (body2 / text.secondary by
        // default, which is exactly what we want). Passing a nested
        // <Typography> here would put a <p> inside a <p> (invalid).
        secondary={`${formatPrice(item.price, /* currency from cart */ 'usd')} each`}
      />

      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', mr: 6 }}
      >
        <IconButton
          size="small"
          aria-label="Decrease quantity"
          onClick={handleDecrement}
          disabled={busy}
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
          {item.quantity}
        </Box>
        <IconButton
          size="small"
          aria-label="Increase quantity"
          onClick={handleIncrement}
          disabled={busy}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box sx={{ minWidth: 96, textAlign: 'right', mr: 6 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {formatPrice(item.lineTotal, 'usd')}
        </Typography>
      </Box>
    </ListItem>
  );
}
