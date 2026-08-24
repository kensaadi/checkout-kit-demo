import { Alert, Box, Typography } from '@mui/material';
import { CardElement } from '@stripe/react-stripe-js';
import { useEngineVisibility } from '@dashforge/ui-core';
import { useDashFormContext } from '@dashforge/forms';
import { useState } from 'react';
import { PROVIDER, IS_STRIPE_TEST_MODE } from '@api/_shared/config';
import type { PaymentStepInput } from './PaymentStepBody';

/**
 * Wraps Stripe's `<CardElement>` for the new-card branch of the
 * payment step. Two behaviours composed:
 *
 *   1. `visibleWhen` — reads the form's `cardChoice` flag from the
 *      DashForge Engine. Renders only when the user chose the
 *      "Add new card" branch. NULL render otherwise.
 *
 *   2. Stripe state tracking — listens to `CardElement.onChange`
 *      and surfaces "complete" / "error" via a small inline
 *      message so the user sees real-time validation feedback.
 *
 * The actual card details NEVER reach the kit's BE — Stripe.js
 * handles capture, and only the resulting `pm_...` id is passed
 * to the BE via `confirm_payment`.
 *
 * In `VITE_PROVIDER=mock`, real Stripe.js still mounts so the UX
 * is faithful, but the mock's `confirm_payment` doesn't validate
 * against Stripe — any pm_id is accepted.
 */
export function StripeElementsField({
  cardError,
}: {
  cardError: string | null;
}) {
  const { engine } = useDashFormContext<PaymentStepInput>();
  const isVisible = useEngineVisibility(
    engine,
    (e) => e.getNode('cardChoice')?.value !== 'existing',
  );
  const [stripeError, setStripeError] = useState<string | null>(null);

  if (!isVisible) return null;

  return (
    <Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 1.5 }}
      >
        Card details
      </Typography>
      <Box
        sx={{
          p: 1.75,
          border: '1px solid',
          borderColor: stripeError || cardError ? 'error.main' : 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          transition: 'border-color 150ms',
        }}
      >
        <CardElement
          onChange={(event) => {
            setStripeError(event.error ? event.error.message : null);
          }}
          options={{
            hidePostalCode: true,
            style: {
              base: {
                fontSize: '16px',
                fontFamily: '"Inter", "Roboto", sans-serif',
                color: '#1f2937',
                '::placeholder': { color: '#9ca3af' },
              },
              invalid: { color: '#d32f2f' },
            },
          }}
        />
      </Box>

      {(stripeError || cardError) && (
        <Alert severity="error" variant="outlined" sx={{ mt: 1.5 }}>
          {stripeError ?? cardError}
        </Alert>
      )}

      {(PROVIDER === 'mock' || IS_STRIPE_TEST_MODE) && (
        <Alert severity="info" variant="outlined" sx={{ mt: 1.5 }}>
          Test mode — use card <strong>4242 4242 4242 4242</strong>, any future
          expiry, any CVC.
        </Alert>
      )}
    </Box>
  );
}
