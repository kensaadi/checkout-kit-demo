import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { STRIPE_PK } from '@api/_shared/config';

/**
 * Lazy-loaded Stripe.js singleton.
 *
 * `loadStripe()` is called once at module evaluation; the promise
 * is shared by every `<Elements>` mount in the app. Calling it
 * more than once would re-download stripe.js and create duplicate
 * Elements instances — Stripe explicitly warns against this.
 *
 * The promise resolves to `null` if the PK is malformed or
 * Stripe.js fails to load; `<Elements>` handles a null value by
 * not rendering its children's Stripe components — the rest of
 * the checkout UI keeps working.
 */
export const stripePromise: Promise<Stripe | null> = loadStripe(STRIPE_PK);

/**
 * Element appearance config — keeps card fields visually
 * coherent with the kit's MUI theme. Edit the values here to
 * rebrand the Stripe-rendered widgets.
 *
 * See https://stripe.com/docs/elements/appearance-api for the
 * full vocabulary.
 */
export const stripeAppearance = {
  theme: 'stripe' as const,
  variables: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    fontSizeBase: '16px',
    colorPrimary: '#1976d2',
    colorBackground: '#ffffff',
    colorText: '#1f2937',
    borderRadius: '8px',
    spacingUnit: '4px',
  },
};
