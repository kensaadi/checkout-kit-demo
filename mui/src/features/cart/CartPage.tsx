import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  Divider,
  List,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Button } from '@dashforge/ui';
import { Can } from '@dashforge/rbac';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { useNavigate } from 'react-router-dom';
import { clear_cart } from '@api/cart/cart.service';
import { cartStore, refreshCart, useCart } from '@shared/store/cart.store';
import { useCall } from '@shared/hooks/useCall';
import { InspectThisPage } from '../../components/demo/InspectThisPage';
import { CartItemRow } from './CartItemRow';
import { EmptyCart } from './EmptyCart';
import { formatPrice } from './format';

/**
 * Full-page cart view. On mount, refreshes from the server to
 * guard against stale local state (e.g. cart cleared in another
 * tab). Renders empty state if no items, otherwise a 2-column
 * layout: line list on the left, sticky summary on the right.
 */
export function CartPage() {
  const { cart, loaded } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const reload = useCallback(async () => {
    setRetrying(true);
    setFetchError(null);
    const r = await refreshCart();
    if (r.error) {
      setFetchError(r.error.message);
    }
    setRetrying(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const { call: callClear, loading: clearing } = useCall(clear_cart, {
    onSuccess: (cleared) => {
      cartStore.cart = cleared;
    },
  });

  // First-load failure: refreshCart never flipped `loaded` to true,
  // so without this branch the skeleton would render forever. Show
  // an actionable Alert + retry instead.
  if (fetchError && !loaded) {
    return (
      <Stack spacing={3}>
        <Typography variant="h3" sx={{ mb: 0.5 }}>
          Your cart
        </Typography>
        <Alert
          severity="error"
          action={
            <Button
              size="small"
              variant="text"
              color="inherit"
              startIcon={<RefreshOutlinedIcon />}
              onClick={reload}
              disabled={retrying}
            >
              {retrying ? 'Retrying…' : 'Retry'}
            </Button>
          }
        >
          Couldn&apos;t load your cart — {fetchError}
        </Alert>
      </Stack>
    );
  }

  if (!loaded || !cart) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width={220} height={48} />
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: '1fr 320px' },
          }}
        >
          <Skeleton variant="rounded" height={360} />
          <Skeleton variant="rounded" height={240} />
        </Box>
      </Stack>
    );
  }

  if (cart.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ mb: 0.5 }}>
          Your cart
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {cart.items.length} item
          {cart.items.length === 1 ? '' : 's'} · {cart.currency.toUpperCase()} ·
          single-currency by design
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '1fr 340px' },
          alignItems: 'start',
        }}
      >
        {/* --- Line items --- */}
        <Card sx={{ p: 0 }}>
          <List disablePadding>
            {cart.items.map((item) => (
              <CartItemRow key={item.productId} item={item} />
            ))}
          </List>
        </Card>

        {/* --- Sticky summary --- */}
        <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  Order summary
                </Typography>
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'space-between' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Items total
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatPrice(cart.itemsTotal, cart.currency)}
                  </Typography>
                </Stack>
              </Box>

              <Divider />

              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Total
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    fontVariantNumeric: 'tabular-nums',
                    color: theme.tokens.colors.money,
                  }}
                >
                  {formatPrice(cart.itemsTotal, cart.currency)}
                </Typography>
              </Stack>

              <Can
                action="create"
                resource="checkout"
                fallback={
                  <Button variant="contained" size="large" fullWidth disabled>
                    Proceed to checkout
                  </Button>
                }
              >
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  endIcon={<LockOutlinedIcon />}
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to checkout
                </Button>
              </Can>

              <Button
                variant="text"
                color="inherit"
                fullWidth
                onClick={() => callClear()}
                disabled={clearing}
              >
                Clear cart
              </Button>

              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ textAlign: 'center', display: 'block' }}
              >
                🔒 Stripe-secured · cancel anytime
              </Typography>
            </Stack>
          </Card>
        </Box>
      </Box>

      <InspectThisPage
        metadata={{
          title: 'Cart with sticky summary',
          filePath: 'client/mui/src/features/cart/CartPage.tsx',
          lines: 180,
          summary:
            'Two-column layout on md+ with the order summary sticky on scroll. Every quantity bump or removal hits the BE and refreshes the cart store atomically — the topbar badge stays in lock-step without a re-fetch.',
          features: [
            'Sticky summary card with running total',
            'One-cart-per-customer with currency lock (422 cross-currency)',
            'Live re-pricing: items show CURRENT catalog price (BE re-enriches)',
            'Quantity +/− with optimistic skeleton (Valtio reactive)',
            'Empty-cart state with branded SVG illustration',
            '<Can resource="checkout"> guards the proceed button',
          ],
          stack: ['React 19', 'Valtio', 'MUI', '@dashforge/rbac'],
          endpoints: [
            'GET /v1/cart',
            'PATCH /v1/cart/items/:productId',
            'DELETE /v1/cart/items/:productId',
            'DELETE /v1/cart',
          ],
        }}
      />
    </Stack>
  );
}
