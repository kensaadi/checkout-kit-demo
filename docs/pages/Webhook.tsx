import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { H2, P, PageTitle } from '../components/PageTitle';
import { useDocs } from '../DocsContext';

export function Webhook() {
  const { be } = useDocs();
  const isNode = be === 'node';

  return (
    <>
      <PageTitle
        eyebrow="API Reference"
        title={
          isNode
            ? 'Stripe Webhook Idempotency in Node.js — Production Pattern'
            : 'Stripe Webhook Idempotency in Go — Production Pattern'
        }
        description={
          isNode
            ? 'How to handle Stripe webhooks idempotently in Node.js + Express. Signature verification with the raw body, event-id deduplication, status transitions, and a clean domain extension point.'
            : 'How to handle Stripe webhooks idempotently in Go + Gin. Signature verification, event-id deduplication, status transitions, and a clean domain extension point. Real production pattern from a shipped kit.'
        }
      />

      <H2>Why webhook idempotency matters</H2>
      <P>
        Stripe webhooks are the only way the BE learns about an
        asynchronous outcome —{' '}<code>payment_intent.succeeded</code>,{' '}
        <code>charge.refunded</code>, a payout dispute. The catch:{' '}
        <strong>Stripe will redeliver the same event more than once</strong>.
        It happens for three reasons that every production system hits
        sooner or later:
      </P>
      <P>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.75 }}>
          <li>
            <strong>Your server returns a non-2xx</strong> (transient DB
            timeout, deploy in progress, OOM kill) — Stripe retries on a
            backoff schedule up to 3 days
          </li>
          <li>
            <strong>Your server is too slow</strong> — if you don't ack within
            ~10s, Stripe assumes failure and queues a retry
          </li>
          <li>
            <strong>Stripe's own at-least-once delivery</strong> guarantee — even
            on a perfect 2xx, you might receive the same event twice within
            seconds during their internal failover
          </li>
        </ul>
      </P>
      <P>
        Without idempotency, the second delivery of{' '}
        <code>payment_intent.succeeded</code> can transition an already-paid
        order back through the "send receipt email" code path, double-send
        the email, double-grant subscription access, double-fulfil the
        physical good. A refund event re-applied creates a negative balance.
        These are the real bugs that hit production-grade SaaS — and the
        reason{' '}
        {isNode
          ? 'the Node Edition of the kit'
          : 'the Go Edition of the kit'}{' '}
        ships a dedicated{' '}<code>webhook_events</code>{' '}collection from
        day one.
      </P>

      <H2>Pattern overview</H2>
      <P>
        Three guards, applied in order, before any business code runs:
      </P>
      <P>
        <ol style={{ paddingLeft: 18, margin: 0, lineHeight: 1.75 }}>
          <li>
            <strong>Verify the signature.</strong> Stripe signs the request
            body with your <code>STRIPE_WEBHOOK_SECRET</code>. A mismatched
            signature means the payload is forged or corrupted — return 400
            immediately, before reading any field
          </li>
          <li>
            <strong>Check the event id against{' '}
            <code>webhook_events</code>.</strong> If we've seen this{' '}
            <code>evt_…</code>{' '}before, return 200 without re-running the
            handler. Stripe sees the ack, stops retrying
          </li>
          <li>
            <strong>Apply the status transition + extension point.</strong>{' '}
            Only once we're certain this is a first delivery do we touch
            the Order or the buyer's domain code
          </li>
        </ol>
      </P>
      <P>
        The same pattern works for{' '}
        <a href="/docs/checkout" style={{ color: '#1a1a1a', fontWeight: 600 }}>
          Stripe checkout in Go
        </a>{' '}and pairs naturally with the{' '}
        <a href="/docs/rbac" style={{ color: '#1a1a1a', fontWeight: 600 }}>
          RBAC engine
        </a>{' '}— webhook handlers run outside any user request, so they
        bypass HTTP-level auth entirely and rely on the signature guard
        as their only trust boundary.
      </P>

      <H2>Endpoint</H2>
      <CodeBlock
        language="bash"
        code={`POST /v1/webhooks/stripe
Header: Stripe-Signature: t=...,v1=...`}
      />
      <P>
        Public route (no JWT — Stripe doesn't carry one). The security
        boundary is the{' '}<code>Stripe-Signature</code>{' '}header verified
        against{' '}<code>STRIPE_WEBHOOK_SECRET</code>. A mismatched
        signature returns 400 immediately, before any side-effect runs.
      </P>

      {isNode && (
        <Callout variant="info" title="Raw body matters in Express">
          The Stripe SDK verifies the signature against the EXACT bytes
          Stripe sent. The kit mounts <code>express.raw()</code> on{' '}
          <code>/v1/webhooks/stripe</code> BEFORE the global{' '}
          <code>express.json()</code>{' '} — otherwise the JSON parser
          consumes the body and the signature check fails.
        </Callout>
      )}

      <H2>Events handled</H2>
      {isNode ? (
        <CodeBlock
          filename="server/src/controllers/webhook.controller.ts"
          language="typescript"
          code={`switch (event.type) {
  case 'payment_intent.succeeded':
    await deps.webhook.handlePaymentSucceeded(event);
    break;

  case 'payment_intent.payment_failed':
    await deps.webhook.handlePaymentFailed(event);
    break;

  case 'charge.refunded':
    await deps.webhook.handleChargeRefunded(event);
    break;

  default:
    // 200 — Stripe will retry non-2xx. We don't want it to retry
    // events we deliberately ignore.
}`}
        />
      ) : (
        <CodeBlock
          filename="server/internal/handler/webhook.go"
          language="go"
          code={`switch event.Type {
case "payment_intent.succeeded":
    h.webhook.HandlePaymentSucceeded(...)

case "payment_intent.payment_failed":
    h.webhook.HandlePaymentFailed(...)

case "charge.refunded":
    h.webhook.HandleChargeRefunded(...)

default:
    // 200 — Stripe will retry non-2xx. We don't want it to retry
    // events we deliberately ignore.
}`}
        />
      )}

      <H2>Idempotency</H2>
      <P>
        Every event id is stored in a{' '}<code>webhook_events</code>{' '}
        collection on first arrival. A retry (same id) is detected
        before the handler runs and returns 200 without re-applying
        the side-effects. The customer cannot be double-charged or
        double-refunded by a Stripe retry.
      </P>

      <H2>Status transitions</H2>
      <CodeBlock
        language="bash"
        code={`pending_payment → paid       (payment_intent.succeeded)
pending_payment → failed     (payment_intent.payment_failed)
paid           → refunded    (charge.refunded)`}
      />

      <H2>Extension point</H2>
      <P>
        After applying the status transition, each handler calls the
        <strong> DOMAIN EXTENSION POINT</strong> hook. Buyer code goes
        there: send a receipt email, enqueue a fulfilment job, update
        analytics, grant subscription access. The kit ships the hook
        empty — the comment block tells you exactly where to add code.
      </P>
      {isNode ? (
        <CodeBlock
          filename="server/src/services/webhook.service.ts"
          language="typescript"
          code={`async handlePaymentSucceeded(event: Stripe.Event): Promise<void> {
  // ... resolve order id from PI metadata, transition status to paid ...

  // ============== DOMAIN EXTENSION POINT ==============
  // Send the receipt email, trigger a webhook to your CRM,
  // grant a Discord role, ... whatever your product needs.
  // Keep it idempotent — Stripe MIGHT redeliver this event.
  // ====================================================
}`}
        />
      ) : (
        <CodeBlock
          filename="server/internal/service/webhook_service.go"
          language="go"
          code={`func (s *WebhookService) HandlePaymentSucceeded(ctx context.Context, evt stripe.Event) error {
    // ... resolve order id from PI metadata, transition status to paid ...

    // ============== DOMAIN EXTENSION POINT ==============
    // Send the receipt email, trigger a webhook to your CRM,
    // grant a Discord role, ... whatever your product needs.
    // Keep it idempotent — Stripe MIGHT redeliver this event.
    // ====================================================

    return nil
}`}
        />
      )}

      <Callout variant="warning" title="Local testing requires the Stripe CLI">
        For local development, run{' '}
        <code>stripe listen --forward-to localhost:3333/v1/webhooks/stripe</code>{' '}
        in a separate terminal. The CLI prints a{' '}
        <code>whsec_...</code>{' '}you paste into{' '}
        <code>server/.env</code>'s <code>STRIPE_WEBHOOK_SECRET</code>.
        Restart the BE after editing.
      </Callout>
    </>
  );
}
