import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Button } from '@dashforge/ui';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineRounded';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '@dashforge/ui';
import { get_my_order_by_id } from '@api/orders/orders.service';
import type { Order } from '@api/orders/orders.types';

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 30; // ~60s total

/**
 * Final step of the checkout wizard. Polls the order endpoint
 * every `POLL_INTERVAL_MS` until the order status leaves
 * `pending_payment` — flipping to `paid` / `failed` / `refunded`
 * via the Stripe webhook (BE-side).
 *
 * If polling reaches the max attempts without a transition,
 * the screen offers a "Check again" button so the user can
 * manually re-poll without leaving the page.
 *
 * Visual: each terminal state (paid / failed) gets a hero glyph
 * inside a tinted circle, a one-line outcome line, and a pair of
 * CTAs scaled for finger taps on mobile. The pending state shows
 * a live progress bar that maps to the polling attempts.
 */
export function CompleteStep({ orderId }: { orderId: string }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { info } = useSnackbar();
  const [order, setOrder] = useState<Order | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [pollingError, setPollingError] = useState<string | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const prevStatusRef = useRef<Order['status'] | null>(null);
  const pollStartRef = useRef<number>(Date.now());

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;
    let timeoutId: number | undefined;

    async function tick() {
      if (cancelled) return;
      attempt += 1;
      setAttempts(attempt);

      const r = await get_my_order_by_id(orderId);
      if (cancelled) return;

      if (r.error) {
        setPollingError(r.error.message);
        return;
      }

      // Detect the pending → terminal transition. This is the
      // moment the Stripe webhook (payment_intent.succeeded /
      // payment_failed) lands on the BE and the FE catches it
      // on the next poll. We surface a small "webhook landed"
      // toast so the prospect actually SEES the infrastructure
      // working — that moment used to be silent.
      const prev = prevStatusRef.current;
      const next = r.data.status;
      if (
        prev === 'pending_payment' &&
        (next === 'paid' || next === 'failed' || next === 'refunded')
      ) {
        const elapsedMs = Date.now() - pollStartRef.current;
        const event =
          next === 'paid'
            ? 'payment_intent.succeeded'
            : next === 'failed'
              ? 'payment_intent.payment_failed'
              : 'charge.refunded';
        // DashForge snackbar owns placement globally — no per-call
        // anchorOrigin. autoHideDuration is still per-call.
        info(
          `📡 Stripe webhook · ${event}  ·  ${elapsedMs < 1000 ? `${elapsedMs}ms` : `${(elapsedMs / 1000).toFixed(1)}s`}`,
          { autoHideDuration: 2200 },
        );
      }
      prevStatusRef.current = next;

      setOrder(r.data);

      if (r.data.status !== 'pending_payment') return;

      if (attempt >= POLL_MAX_ATTEMPTS) {
        setExhausted(true);
        return;
      }

      timeoutId = window.setTimeout(tick, POLL_INTERVAL_MS);
    }

    pollStartRef.current = Date.now();
    tick();

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [orderId, info]);

  function handleRetryCheck() {
    setExhausted(false);
    setAttempts(0);
    setPollingError(null);
    get_my_order_by_id(orderId).then((r) => {
      if (r.error) {
        setPollingError(r.error.message);
        return;
      }
      setOrder(r.data);
    });
  }

  // === Render branches ===
  if (pollingError) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Couldn't reach your order
        </Typography>
        <Alert severity="error">{pollingError}</Alert>
        <Box>
          <Button variant="contained" onClick={() => navigate('/welcome')}>
            Back to home
          </Button>
        </Box>
      </Stack>
    );
  }

  if (!order) {
    return (
      <Stack spacing={3} sx={{ alignItems: 'center', py: 6 }}>
        <CircularProgress />
        <Typography variant="body1">Confirming your payment…</Typography>
      </Stack>
    );
  }

  if (order.status === 'paid') {
    return (
      <Stack spacing={4} sx={{ alignItems: 'center', py: { xs: 3, md: 5 } }}>
        <Box
          sx={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            bgcolor: theme.tokens.colors.successSoft,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'successPop .55s cubic-bezier(.16,1.2,.4,1) both',
            '@keyframes successPop': {
              '0%': { transform: 'scale(0.6)', opacity: 0 },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          <CheckCircleIcon
            sx={{ fontSize: 56, color: theme.tokens.colors.success }}
          />
        </Box>
        <Box sx={{ textAlign: 'center', maxWidth: 460 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            You're in.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Stripe cleared the payment. Your receipt is on its way,
            and the order is waiting for you in your orders list.
          </Typography>
          <Card
            variant="outlined"
            sx={{
              mt: 3,
              p: 2,
              display: 'inline-block',
              bgcolor: 'background.default',
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              Order ID
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: 'monospace', fontWeight: 600 }}
            >
              {order.id}
            </Typography>
          </Card>
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ width: '100%', justifyContent: 'center' }}
        >
          <Button variant="text" onClick={() => navigate('/welcome')}>
            Back to home
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            View order
          </Button>
        </Stack>
      </Stack>
    );
  }

  if (order.status === 'failed') {
    return (
      <Stack spacing={4} sx={{ alignItems: 'center', py: { xs: 3, md: 5 } }}>
        <Box
          sx={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            bgcolor: theme.tokens.colors.dangerSoft,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ErrorOutlineIcon
            sx={{ fontSize: 56, color: theme.tokens.colors.danger }}
          />
        </Box>
        <Box sx={{ textAlign: 'center', maxWidth: 460 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            That didn't go through
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {order.failureReason ?? 'Your bank declined the payment.'}{' '}
            Head back to the cart and try another card.
          </Typography>
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ width: '100%', justifyContent: 'center' }}
        >
          <Button variant="text" onClick={() => navigate('/welcome')}>
            Back to home
          </Button>
          <Button variant="contained" onClick={() => navigate('/cart')}>
            Back to cart
          </Button>
        </Stack>
      </Stack>
    );
  }

  // status === 'pending_payment' → polling state
  const pct = Math.min(100, (attempts / POLL_MAX_ATTEMPTS) * 100);
  return (
    <Stack spacing={4} sx={{ alignItems: 'center', py: 4 }}>
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          bgcolor: theme.tokens.colors.primarySoft,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress
          size={48}
          thickness={4.5}
          sx={{ color: theme.tokens.colors.primary }}
        />
      </Box>
      <Box sx={{ textAlign: 'center', maxWidth: 460 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Almost there
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Stripe's checking with your bank. A few seconds, tops.
        </Typography>
      </Box>

      <Box sx={{ width: '100%', maxWidth: 320 }}>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{ borderRadius: 999, height: 6 }}
        />
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: 'block', mt: 1, textAlign: 'center' }}
        >
          Polling attempt {attempts}/{POLL_MAX_ATTEMPTS}
        </Typography>
      </Box>

      {exhausted && (
        <Stack spacing={1.5} sx={{ alignItems: 'center', width: '100%' }}>
          <Alert severity="warning" variant="outlined" sx={{ maxWidth: 460 }}>
            Still waiting for the webhook. The order will update once
            the bank confirms. You can safely leave this page.
          </Alert>
          <Stack direction="row" spacing={1.5}>
            <Button variant="text" onClick={handleRetryCheck}>
              Check again
            </Button>
            <Button variant="contained" onClick={() => navigate('/welcome')}>
              Back to home
            </Button>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
