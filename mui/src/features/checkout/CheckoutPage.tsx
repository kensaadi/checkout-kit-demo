import { useState } from 'react';
import {
  Box,
  Card,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { InspectThisPage } from '../../components/demo/InspectThisPage';
import { CheckoutSummary } from './CheckoutSummary';
import { CompleteStep } from './CompleteStep';
import { PaymentStep } from './PaymentStep';
import { ResumeStep } from './ResumeStep';

type WizardStep = 'resume' | 'payment' | 'complete';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'resume', label: 'Resume cart' },
  { id: 'payment', label: 'Payment' },
  { id: 'complete', label: 'Complete' },
];

/**
 * Three-step checkout wizard. Step state is local to this
 * component — no URL routing per step (refresh would lose
 * orderId from CompleteStep otherwise).
 *
 *   resume    → ResumeStep (cart review)
 *   payment   → PaymentStep (DashFormProvider + Stripe + visibleWhen)
 *   complete  → CompleteStep (polls order status from BE)
 *
 * Two-column layout on md+ with a sticky `CheckoutSummary` on the
 * right; single-column on xs/sm so the wizard owns full width.
 *
 * Mounted under /checkout, gated by CustomerGuard in AppRouter.
 */
export function CheckoutPage() {
  const [step, setStep] = useState<WizardStep>('resume');
  const [orderId, setOrderId] = useState<string | null>(null);
  const activeIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ mb: 0.5 }}>
          Checkout
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Step {activeIndex + 1} of {STEPS.length} ·{' '}
          {STEPS[activeIndex]?.label}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 4,
          gridTemplateColumns: { xs: '1fr', md: '1fr 360px' },
          alignItems: 'start',
        }}
      >
        <Box>
          <Stepper activeStep={activeIndex} alternativeLabel sx={{ mb: 4 }}>
            {STEPS.map((s) => (
              <Step key={s.id}>
                <StepLabel>{s.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Card sx={{ p: { xs: 2.5, sm: 4 } }}>
            {step === 'resume' && (
              <ResumeStep onContinue={() => setStep('payment')} />
            )}
            {step === 'payment' && (
              <PaymentStep
                onConfirmed={(id) => {
                  setOrderId(id);
                  setStep('complete');
                }}
              />
            )}
            {step === 'complete' && orderId && (
              <CompleteStep orderId={orderId} />
            )}
          </Card>
        </Box>

        {/* Summary visible on md+, hidden on mobile while paying. */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          {step !== 'complete' && <CheckoutSummary />}
        </Box>
      </Box>

      <InspectThisPage
        metadata={{
          title: 'Three-step Stripe wizard',
          filePath: 'client/mui/src/features/checkout/CheckoutPage.tsx',
          lines: 95,
          summary:
            'Resume → Payment → Complete. The Payment step uses Stripe Elements with a saved-card / new-card visibleWhen branch via @dashforge/forms. Confirm creates the Order BEFORE the PaymentIntent so the order id can land in the PI metadata (webhook correlation).',
          features: [
            'Stripe Elements for PCI-safe card input',
            'Off-session confirm + idempotency_key derived from orderId',
            'Polling CompleteStep (30×2s) until webhook flips order status',
            'Sticky summary card with live cart re-pricing',
            'Lazy Stripe Customer provisioning on first /setup-intent call',
          ],
          stack: ['Stripe.js', 'React 19', 'MUI', '@dashforge/forms'],
          endpoints: [
            'GET /v1/checkout/payment-methods',
            'POST /v1/checkout/setup-intent',
            'POST /v1/checkout/confirm',
            'GET /v1/orders/:id (polled)',
          ],
        }}
      />
    </Box>
  );
}
