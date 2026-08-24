import { DashFormProvider } from '@dashforge/forms';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PaymentStepBody,
  PaymentStepInputSchema,
  type PaymentStepInput,
} from './PaymentStepBody';
import { StripeProvider } from './stripe/StripeProvider';

/**
 * Wraps the payment step in two providers:
 *
 *   StripeProvider     → so the body can use useStripe()/useElements()
 *                        and render <CardElement>
 *   DashFormProvider   → form context; the body's DashForge
 *                        <RadioGroup>s bind to `cardChoice` /
 *                        `savedCardId` and gate visibility via
 *                        `visibleWhen` reading the Engine
 *
 * The body owns everything else: saved-cards fetch, branch logic,
 * SetupIntent + confirm sequencing.
 */
export function PaymentStep({
  onConfirmed,
}: {
  onConfirmed: (orderId: string) => void;
}) {
  return (
    <StripeProvider>
      <DashFormProvider<PaymentStepInput>
        resolver={zodResolver(PaymentStepInputSchema)}
        defaultValues={{ cardChoice: 'new', savedCardId: null }}
      >
        <PaymentStepBody onConfirmed={onConfirmed} />
      </DashFormProvider>
    </StripeProvider>
  );
}
