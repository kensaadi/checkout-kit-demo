import { useEffect, useState } from 'react';
import { Alert, Box, Card, Stack, Typography } from '@mui/material';
import { Button, RadioGroup, useSnackbar } from '@dashforge/ui';
import { useDashFieldMeta, useDashFormContext } from '@dashforge/forms';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { z } from 'zod';
import {
  confirm_payment,
  create_setup_intent,
  list_payment_methods,
} from '@api/checkout/checkout.service';
import type { PaymentMethod } from '@api/checkout/checkout.types';
import { useUser } from '@shared/store/user.store';
import { cartStore } from '@shared/store/cart.store';
import { StripeElementsField } from './StripeElementsField';

/**
 * Schema for the payment-step form. `cardChoice` is the toggle that
 * drives `visibleWhen` on both the saved-card picker AND the new-card
 * Stripe Element below.
 *
 *   cardChoice === 'existing' → savedCardId required
 *   cardChoice === 'new'      → Stripe CardElement must be complete
 *
 * It's a STRING enum (not a boolean) so DashForge's <RadioGroup>
 * binds to it directly by `name` — the radio options are strings.
 * The "card must be complete" check is NOT in the schema (Stripe
 * tracks that internally); done at submit time below.
 */
export const PaymentStepInputSchema = z.object({
  cardChoice: z.enum(['existing', 'new']),
  savedCardId: z.string().nullable(),
});
export type PaymentStepInput = z.infer<typeof PaymentStepInputSchema>;

/**
 * Lives inside DashFormProvider + StripeProvider.
 *
 * The toggle + saved-card picker are DashForge `<RadioGroup>`s that
 * bind to their fields through the form BRIDGE by `name` — no
 * `rhf.watch`/`rhf.setValue` plumbing (that doesn't round-trip
 * through the bridge, which is why the manual MUI version left the
 * radio stuck on its default).
 *
 * The picker's visibility is a plain React conditional mount driven
 * by `useDashFieldMeta('cardChoice')`, NOT the RadioGroup's own
 * `visibleWhen`: that prop toggles per-option hooks (useAccessState
 * in a .map) on/off and crashes with "rendered more hooks". A
 * mount/unmount keeps the hook count stable.
 *
 * Saved cards are still fetched here (useEffect/useState) — a plain
 * data load, not a cross-field reaction.
 *
 * Submit walks two branches:
 *   SAVED CARD: paymentMethodId = chosen pm → confirm_payment.
 *   NEW CARD:   create_setup_intent → stripe.confirmCardSetup → pm
 *               → confirm_payment.
 */
export function PaymentStepBody({
  onConfirmed,
}: {
  onConfirmed: (orderId: string) => void;
}) {
  const { rhf } = useDashFormContext<PaymentStepInput>();
  const stripe = useStripe();
  const elements = useElements();
  const { error: notifyError } = useSnackbar();
  const { user } = useUser();

  const [savedCards, setSavedCards] = useState<PaymentMethod[]>([]);
  const [savedCardsLoaded, setSavedCardsLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // Reactive read of the toggle through the bridge (stable hook —
  // useSyncExternalStore). Drives the saved-card picker's mount.
  const { value: cardChoice } = useDashFieldMeta('cardChoice');
  const showSavedPicker = cardChoice === 'existing';

  // Fetch saved cards on mount (lazy Stripe Customer provisioning
  // happens BE-side during this call too). Plain data load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await list_payment_methods();
      if (cancelled) return;
      if (r.error) {
        notifyError(r.error.message);
        setSavedCardsLoaded(true);
        return;
      }
      setSavedCards(r.data.data);
      setSavedCardsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePay() {
    setCardError(null);

    // Read the choice on demand at submit time — no reactive watch
    // needed here. getValues reads the bridge-synced form state.
    const useExistingCard = rhf.getValues('cardChoice') === 'existing';

    if (useExistingCard) {
      const savedCardId = rhf.getValues('savedCardId');
      if (!savedCardId) {
        rhf.setError('savedCardId', { message: 'Pick a card' });
        return;
      }
      await runConfirm(savedCardId);
      return;
    }

    // NEW CARD branch — attach via SetupIntent then confirm.
    if (!stripe || !elements) {
      setCardError('Stripe is still loading. Please retry in a moment.');
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCardError('Card field not ready.');
      return;
    }

    setSubmitting(true);

    // 1. Ask the BE for a SetupIntent.
    const setupResult = await create_setup_intent();
    if (setupResult.error) {
      setSubmitting(false);
      notifyError(setupResult.error.message);
      return;
    }

    // 2. Hand the secret to Stripe.js — it captures the card,
    //    attaches it to the customer, returns a pm_... id.
    const { error: stripeErr, setupIntent } = await stripe.confirmCardSetup(
      setupResult.data.clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: { email: user?.email },
        },
      },
    );
    if (stripeErr) {
      setSubmitting(false);
      setCardError(stripeErr.message ?? 'Card could not be added.');
      return;
    }
    const pmId =
      typeof setupIntent?.payment_method === 'string'
        ? setupIntent.payment_method
        : setupIntent?.payment_method?.id;
    if (!pmId) {
      setSubmitting(false);
      setCardError('Stripe did not return a payment method.');
      return;
    }

    await runConfirm(pmId);
  }

  async function runConfirm(paymentMethodId: string) {
    setSubmitting(true);
    const r = await confirm_payment({ paymentMethodId });
    setSubmitting(false);

    if (r.error) {
      notifyError(r.error.message);
      return;
    }

    // Cart was consumed by the BE on confirm. Reset local store
    // optimistically so the topbar badge clears and a stale view
    // doesn't linger after we navigate to CompleteStep.
    cartStore.cart = null;
    cartStore.loaded = false;

    onConfirmed(r.data.orderId);
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Payment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose a saved card or enter a new one.
        </Typography>
      </Box>

      {savedCards.length > 0 && (
        <Card sx={{ p: 2.5 }}>
          {/* Toggle binds to `cardChoice` through the bridge by name. */}
          <RadioGroup
            name="cardChoice"
            options={[
              { value: 'existing', label: 'Use a saved card' },
              { value: 'new', label: 'Add a new card' },
            ]}
          />

          {/* Saved-card picker. Mounted/unmounted by React on the
              'existing' branch — NOT via the RadioGroup's `visibleWhen`.
              DashForge's RadioGroup runs a per-option hook
              (useAccessState) inside a .map, so toggling its internal
              visibility changes the hook count between renders and
              crashes ("rendered more hooks"). A clean conditional
              mount sidesteps that: when shown, the option count is
              fixed (cards already loaded). */}
          {showSavedPicker && (
            <Box sx={{ pl: 4 }}>
              <RadioGroup
                name="savedCardId"
                options={savedCards.map((pm) => ({
                  value: pm.id,
                  label: `${pm.brand.toUpperCase()} •••• ${pm.last4} · ${String(
                    pm.expMonth,
                  ).padStart(2, '0')}/${pm.expYear}`,
                }))}
              />
            </Box>
          )}
        </Card>
      )}

      <StripeElementsField cardError={cardError} />

      {!savedCardsLoaded && (
        <Alert severity="info" variant="outlined">
          Loading your saved cards…
        </Alert>
      )}

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ justifyContent: 'flex-end' }}
      >
        <Button
          type="button"
          variant="contained"
          size="large"
          loading={submitting}
          onClick={handlePay}
        >
          Pay now
        </Button>
      </Stack>
    </Stack>
  );
}
