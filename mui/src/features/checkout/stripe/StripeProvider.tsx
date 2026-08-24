import { Elements } from '@stripe/react-stripe-js';
import type { ReactNode } from 'react';
import { stripeAppearance, stripePromise } from './stripe.config';

/**
 * Wraps children in `<Elements>` so any DashForge / Stripe.js
 * field inside can use `useStripe()` and `useElements()`.
 *
 * Mounted by the PaymentStep above the form body — the form
 * needs a Stripe context, but everything OUTSIDE the form
 * (cart resume, polling complete) does not. Keeping the
 * `<Elements>` mount scoped to just the payment step avoids
 * paying the Stripe.js load cost on routes that never collect
 * a card.
 */
export function StripeProvider({ children }: { children: ReactNode }) {
  return (
    <Elements
      stripe={stripePromise}
      options={{ appearance: stripeAppearance }}
    >
      {children}
    </Elements>
  );
}
