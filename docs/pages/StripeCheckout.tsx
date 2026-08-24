import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { StepList } from '../components/StepList';
import { H2, P, PageTitle } from '../components/PageTitle';
import { useDocs } from '../DocsContext';

export function StripeCheckout() {
  const { fe } = useDocs();
  if (fe === 'tailwind') {
    return (
      <>
        <PageTitle
          eyebrow="Storefront"
          title="Stripe Checkout — Tailwind"
          description="Three-step wizard with Stripe Elements + SetupIntent, PaymentIntent with idempotency key, off_session confirm, and webhook-driven status transitions. 1:1 port of the MUI flavor."
        />

        <H2>Same pattern, different rendering</H2>
        <P>
          The Tailwind checkout is a 1:1 port of the MUI flavor — same
          wizard shape, same API contracts, same Stripe flow. The only
          differences are the component library (DashForge Tailwind
          primitives instead of MUI) and the notification system
          (<code>useSnackbar</code> from <code>@dashforge/tw</code>{' '}
          instead of the MUI snackbar).
        </P>

        <H2>Wizard shape</H2>
        <StepList
          steps={[
            {
              title: 'Resume — review the cart',
              description:
                'Final pass on what the customer is about to pay. Items list, total, "Edit cart" + "Continue to payment" buttons.',
            },
            {
              title: 'Payment — Stripe Elements',
              description:
                'Saved card list (if any) OR new card via SetupIntent + Stripe.confirmCardSetup. The BE never sees raw card data — only the resulting pm_… id.',
            },
            {
              title: 'Complete — poll order status',
              description:
                'The BE creates the Order BEFORE the PaymentIntent (orderId in PI metadata for webhook correlation), then off_session-confirms. The FE polls /v1/orders/:id until status leaves pending_payment.',
            },
          ]}
        />

        <H2>Order before PaymentIntent</H2>
        <P>
          The kit always creates the Order in{' '}<code>pending_payment</code>{' '}
          first, then creates the PaymentIntent with{' '}
          <code>metadata.orderId</code> and idempotency key{' '}
          <code>order_{'<orderID>'}</code>. This prevents the two main
          production race conditions: webhook arriving before the order
          exists, and money in Stripe with no matching order in the DB.
        </P>

        <H2>The webhook visual moment</H2>
        <P>
          The polling step normally feels silent. The Tailwind flavor
          surfaces a DashForge snackbar the moment the BE transitions
          the order status — turning the silent webhook into a
          demo-friendly moment. The elapsed time is shown to make the
          webhook latency tangible.
        </P>
        <CodeBlock
          filename="client/tailwind/src/features/checkout/CompleteStep.tsx"
          language="tsx"
          code={`const { enqueue } = useSnackbar(); // from '@dashforge/tw'

if (prev === 'pending_payment' && next === 'paid') {
  const elapsedMs = Date.now() - pollStartRef.current;
  enqueue({
    message: \`📡 Stripe webhook · payment_intent.succeeded · \${
      elapsedMs < 1000 ? \`\${elapsedMs}ms\` : \`\${(elapsedMs / 1000).toFixed(1)}s\`
    }\`,
    severity: 'info',
    autoHideMs: 2200,
  });
}`}
        />

        <Callout variant="warning" title="stripe listen must be running locally">
          Without the Stripe CLI forwarding webhooks to your BE, orders
          stay <code>pending_payment</code> forever and the polling
          eventually exhausts. See the <strong>Installation</strong>{' '}
          page for the one-line setup.
        </Callout>

        <Callout variant="success" title="Lazy Stripe Customer">
          The BE creates a Stripe Customer the first time the buyer calls
          any checkout endpoint. The id is persisted on{' '}
          <code>Customer.stripeCustomerId</code> so subsequent calls
          reuse it. If the Stripe-side customer is deleted, the BE
          re-creates and re-persists silently.
        </Callout>
      </>
    );
  }

  return (
    <>
      <PageTitle
        eyebrow="Storefront"
        title="Stripe Checkout in Go — Production Pattern"
        description="Build a production-grade Stripe checkout in Go + Gin: a three-step wizard, Stripe Elements + SetupIntent for card capture, PaymentIntent with idempotency key, off_session confirm, and webhook-driven status transitions. Real pattern from a shipped kit."
      />

      <H2>Why Stripe Elements over Checkout Sessions</H2>
      <P>
        Stripe ships two flavours for collecting payment:{' '}
        <code>Checkout Sessions</code>{' '}(hosted page) and{' '}
        <code>Stripe Elements</code>{' '}(embedded in your UI). For a real
        SaaS product, Elements wins on three things that matter:
      </P>
      <P>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.75 }}>
          <li>
            <strong>Brand control</strong> — Elements lives inside your
            checkout page, your typography, your spacing. Checkout
            Sessions redirect to a Stripe-branded URL, which costs you
            attribution and breaks immersion for high-AOV B2B flows
          </li>
          <li>
            <strong>Saved cards UX</strong> — Elements lets you list saved
            payment methods and one-click the default, which is what
            recurring SaaS customers expect. Checkout Sessions handle this
            but with more redirects
          </li>
          <li>
            <strong>PCI scope still minimal</strong> — Elements never sends
            raw card data to your BE; it tokenises in the browser via the
            Stripe SDK and your server only sees a{' '}<code>pm_…</code>{' '}id.
            Same compliance posture as Checkout Sessions, more UX control
          </li>
        </ul>
      </P>

      <H2>Order before PaymentIntent — the production gotcha</H2>
      <P>
        Most "Stripe checkout in Go" tutorials get the order of operations
        wrong: they create the PaymentIntent first, then create the Order
        on success. That fails in two real production scenarios:
      </P>
      <P>
        <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.75 }}>
          <li>
            <strong>Webhook arrives first</strong> — Stripe's webhook for{' '}
            <code>payment_intent.succeeded</code>{' '}can outrun your "create
            Order" code path. The webhook fires, looks up an Order that
            doesn't exist yet, returns 500, Stripe retries. Race condition
          </li>
          <li>
            <strong>Refund / dispute with no audit trail</strong> — if
            payment succeeded but Order creation failed (DB transient
            error), you have money in Stripe with no Order in your DB.
            Manual reconciliation, every time
          </li>
        </ul>
      </P>
      <P>
        The kit always creates the Order in{' '}<code>pending_payment</code>{' '}
        FIRST, then creates the PaymentIntent with{' '}
        <code>metadata.orderId = order.id</code>{' '}and idempotency key{' '}
        <code>order_&lt;orderID&gt;</code>. The webhook always finds an
        Order; status transitions are unidirectional. The pattern also
        composes cleanly with the kit's{' '}
        <a href="/docs/webhook" style={{ color: '#1a1a1a', fontWeight: 600 }}>
          webhook idempotency
        </a>{' '}layer.
      </P>

      <H2>Wizard shape</H2>
      <StepList
        steps={[
          {
            title: 'Resume — review the cart',
            description:
              'Final pass on what the customer is about to pay. Items list, total, "Edit cart" + "Continue to payment" buttons.',
          },
          {
            title: 'Payment — Stripe Elements',
            description:
              'visibleWhen branches: saved card list (if any) OR new card via SetupIntent + Stripe.confirmCardSetup. The BE never sees raw card data — only the resulting pm_… id.',
          },
          {
            title: 'Complete — poll order status',
            description:
              'On confirm the BE creates the Order BEFORE the PaymentIntent (orderId lives in the PI metadata for webhook correlation), then off_session-confirms. The FE polls /v1/orders/:id until status leaves pending_payment.',
          },
        ]}
      />

      <H2>Why order before PaymentIntent</H2>
      <P>
        Order id needs to be in <code>PaymentIntent.metadata</code> so
        the Stripe webhook knows which order to update. So the flow is
        always: create pending Order → create PI with{' '}
        <code>metadata.orderId</code> → off_session confirm. Idempotency
        key on the PI is{' '}<code>order_&lt;orderID&gt;</code> — Stripe
        dedupes retries within 24h, so a UI double-click or network
        retry can't double-charge.
      </P>

      <H2>The webhook visual moment</H2>
      <P>
        The polling step normally feels silent (a spinner for 1-3
        seconds). The kit pops a DashForge info snackbar the moment
        the BE transitions the order — turning the silent webhook into
        a demo-friendly moment.
      </P>
      <CodeBlock
        filename="client/mui/src/features/checkout/CompleteStep.tsx"
        language="tsx"
        code={`// DashForge's useSnackbar — variant shortcuts + global placement
const { info } = useSnackbar(); // from '@dashforge/ui'

if (prev === 'pending_payment' && next === 'paid') {
  const elapsedMs = Date.now() - pollStartRef.current;
  info(
    \`📡 Stripe webhook · payment_intent.succeeded · \${elapsedMs}ms\`,
    { autoHideDuration: 2200 },
  );
}`}
      />

      <Callout variant="warning" title="stripe listen must be running locally">
        Without the Stripe CLI forwarding webhooks to your BE, orders
        stay <code>pending_payment</code> forever and the polling
        eventually exhausts. See the{' '}
        <strong>Installation</strong> page for the one-line setup.
      </Callout>

      <Callout variant="success" title="Lazy Stripe Customer">
        The BE creates a Stripe Customer the first time the buyer calls
        any checkout endpoint (list payment methods, setup intent,
        confirm). The id lands on{' '}
        <code>Customer.stripeCustomerId</code>{' '}so subsequent calls reuse it.
        If the Stripe-side customer is deleted, the BE re-creates and
        re-persists silently — no admin intervention needed.
      </Callout>
    </>
  );
}
